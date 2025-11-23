"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  adminListUsers,
  adminChangeUserRole,
  type UserListItem,
} from "@/lib/api/users";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

type Role = "user" | "moderator" | "advisor" | "admin" | "superAdmin";

export default function Page() {
  const { session } = useAuthSession();
  const { update } = useSession();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [items, setItems] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  // Add just-in-time assignment form state
  const [assignEmail, setAssignEmail] = useState("");
  const [assignRole, setAssignRole] =
    useState<Exclude<Role, "user" | "superAdmin">>("moderator");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignCheckStatus, setAssignCheckStatus] = useState<
    "idle" | "checking" | "found" | "notfound"
  >("idle");
  const [assignFoundUser, setAssignFoundUser] = useState<UserListItem | null>(
    null
  );

  const canView = useMemo(() => {
    const r = (session?.user?.role as Role) || "user";
    return r === "admin" || r === "superAdmin";
  }, [session?.user?.role]);

  useEffect(() => {
    if (!canView) return;
    (async () => {
      setLoading(true);
      try {
        const res = await adminListUsers({
          q,
          role: role === "all" ? undefined : role,
          page,
          limit,
        });
        setItems(res.items);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    })();
  }, [q, role, page, canView]);

  if (!canView) return null;

  const maxPage = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Manage Roles</h2>
        <div className="flex gap-2">
          {/* <Input
            placeholder="Search name or email"
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            className="h-8 w-56"
          /> */}
          {/* <Select
            value={role}
            onValueChange={(v) => {
              setPage(1);
              setRole(v as Role | "all");
            }}
          >
            <SelectTrigger className="h-8 w-44">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superAdmin">SuperAdmin</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
      </div>

      {/* Assignment Form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Assign Role to Existing User</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 items-center">
            <Input
              placeholder="Enter user email"
              value={assignEmail}
              onChange={(e) => setAssignEmail(e.target.value)}
              onBlur={async () => {
                if (!assignEmail || !assignEmail.includes("@")) return;
                setAssignCheckStatus("checking");
                try {
                  const res = await adminListUsers({
                    q: assignEmail,
                    page: 1,
                    limit: 5,
                    includeUsers: true,
                  });
                  const found =
                    res.items.find(
                      (u) => u.email.toLowerCase() === assignEmail.toLowerCase()
                    ) || null;
                  setAssignFoundUser(found);
                  setAssignCheckStatus(found ? "found" : "notfound");
                } catch {
                  setAssignFoundUser(null);
                  setAssignCheckStatus("notfound");
                }
              }}
              className="h-8 w-72"
            />
            {assignCheckStatus === "checking" && (
              <span className="text-xs text-muted-foreground">Checking…</span>
            )}
            {assignCheckStatus === "found" && (
              <span className="text-xs text-green-600">User found</span>
            )}
            {assignCheckStatus === "notfound" && (
              <span className="text-xs text-red-500">User not found</span>
            )}
            <Select
              value={assignRole}
              onValueChange={(v) => setAssignRole(v as any)}
            >
              <SelectTrigger className="h-8 w-44">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="advisor">Advisor</SelectItem>
                {(session?.user?.role === "superAdmin" ||
                  session?.user?.role === "admin") && (
                  <SelectItem value="admin">Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button
              className="h-8"
              disabled={
                assignLoading || !assignEmail || assignCheckStatus !== "found"
              }
              onClick={async () => {
                if (!assignEmail) return;
                setAssignLoading(true);
                try {
                  // Prefer last verified result if available; otherwise fetch once
                  let found = assignFoundUser;
                  if (!found) {
                    const res = await adminListUsers({
                      q: assignEmail,
                      page: 1,
                      limit: 5,
                      includeUsers: true,
                    });
                    found =
                      res.items.find(
                        (u) =>
                          u.email.toLowerCase() === assignEmail.toLowerCase()
                      ) || null;
                  }
                  if (!found) {
                    alert("User not found");
                  } else {
                    // Allow both admin and superAdmin to assign admin
                    if (
                      assignRole === "admin" &&
                      !(
                        session?.user?.role === "superAdmin" ||
                        session?.user?.role === "admin"
                      )
                    ) {
                      return;
                    }
                    await adminChangeUserRole({
                      userId: found.id,
                      role: assignRole as any,
                    });
                    // If current list is showing only moderators/admins, ensure the user appears now if matches
                    setItems((prev) => {
                      const exists = prev.some((x) => x.id === found.id);
                      const updated = {
                        ...found,
                        role: assignRole,
                      } as UserListItem;
                      return exists
                        ? prev.map((x) => (x.id === found.id ? updated : x))
                        : [updated, ...prev];
                    });
                    setAssignCheckStatus("idle");
                    setAssignFoundUser(null);
                    if (found.id === session?.user?.id) {
                      try {
                        await update();
                      } catch {}
                    }
                  }
                } finally {
                  setAssignLoading(false);
                }
              }}
            >
              Assign
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privileged Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((u) => {
                  const isSelf = u.id === session?.user?.id;
                  const currentRole = u.role;
                  return (
                    <tr key={u.id} className="border-t">
                      <td className="p-2">{u.name}</td>
                      <td className="p-2">{u.email}</td>
                      <td className="p-2 capitalize">{u.role}</td>
                      <td className="p-2 text-right">
                        <div className="inline-flex gap-2 items-center">
                          <Select
                            value={currentRole}
                            onValueChange={async (newRole) => {
                              const nr = newRole as Role;
                              if (nr === u.role) return;
                              if (
                                nr === "admin" &&
                                !(
                                  session?.user?.role === "admin" ||
                                  session?.user?.role === "superAdmin"
                                )
                              )
                                return;
                              await adminChangeUserRole({
                                userId: u.id,
                                role: nr as any,
                              });
                              setItems((prev) =>
                                prev.map((x) =>
                                  x.id === u.id ? { ...x, role: nr } : x
                                )
                              );
                              if (isSelf) {
                                try {
                                  await update();
                                } catch {}
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">
                                Moderator
                              </SelectItem>
                              <SelectItem value="advisor">Advisor</SelectItem>
                              {(session?.user?.role === "admin" ||
                                session?.user?.role === "superAdmin") && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td
                      className="p-4 text-center text-muted-foreground"
                      colSpan={4}
                    >
                      No users
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Page {page} of {maxPage}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-8"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                className="h-8"
                onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                disabled={page >= maxPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
