"use client";
import React, { useMemo, useState } from "react";
// import { useModal } from "@/hooks/useModal";
// import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logger } from "@/lib/utils/logger";
import { User } from "next-auth";
import { Card } from "@/components/ui/card";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { updateUserProfile } from "@/lib/api/users";
import { useSession } from "next-auth/react";

export default function UserMetaCard({ user }: { user: User }) {
  // const { isOpen, openModal, closeModal } = useModal();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, update: updateSession } = useSession();

  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] ?? "");
  const lastNameDefault = useMemo(() => {
    const parts = (user?.name || "").split(" ");
    return parts.slice(1).join(" ") ?? "";
  }, [user?.name]);
  const [lastName, setLastName] = useState(lastNameDefault);
  const [saving, setSaving] = useState(false);

  const displayName = useMemo(() => {
    return session?.user?.name || user?.name || "";
  }, [session?.user?.name, user?.name]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const updated = await updateUserProfile({ name: fullName });
      await updateSession?.({
        user: {
          ...(session?.user as unknown as Record<string, unknown>),
          name: updated.name,
          image: updated.image,
        },
      } as unknown as Record<string, unknown>);
      setIsOpen(false);
    } catch (err) {
      logger.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  logger.log("UserMetaCard", user);

  return (
    <>
      <Card>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {displayName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-500">
                    Member since{" "}
                    {new Date(user?.createdAt as Date).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                  {/* <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div> */}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* <div className="flex gap-2">
                <Button className="w-8 h-8 ring-1 ring-gray-300 rounded-lg bg-transparent text-gray-700 hover:bg-transparent">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  className="w-8 h-8 ring-1 ring-gray-300 rounded-lg bg-transparent text-gray-700 hover:bg-transparent"
                >
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.1708 1.875H17.9274L11.9049 8.75833L18.9899 18.125H13.4424L9.09742 12.4442L4.12578 18.125H1.36745L7.80912 10.7625L1.01245 1.875H6.70078L10.6283 7.0675L15.1708 1.875ZM14.2033 16.475H15.7308L5.87078 3.43833H4.23162L14.2033 16.475Z"
                      fill=""
                    />
                  </svg>
                </Button>
                <Button className="w-8 h-8 ring-1 ring-gray-300 rounded-lg bg-transparent text-gray-700 hover:bg-transparent">
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button className="w-8 h-8 ring-1 ring-gray-300 rounded-lg bg-transparent text-gray-700 hover:bg-transparent">
                  <Instagram className="w-4 h-4" />
                </Button>
              </div> */}
              <Button onClick={() => setIsOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={() => setIsOpen(false)}>
        <DialogContent className="max-w-[700px] m-4 bg-white max-h-[80vh] md:h-[fit-content] overflow-y-auto">
          <DialogTitle>Edit Personal Information</DialogTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your details to keep your profile up-to-date.
          </p>
          <div className=" bg-white dark:bg-gray-900">
            <form
              className="flex flex-col"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="custom-scrollbar">
                <div>
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Personal Information
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>First Name</Label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Last Name</Label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    <div className="w-full col-span-2">
                      <Label>Email Address</Label>
                      <Input type="text" value={user?.email || ""} disabled />
                    </div>

                    {/* <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input type="text" defaultValue="+09 363 398 46" />
                  </div> */}
                  </div>
                </div>
                {/* <div className="mt-7">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    Social Links
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div>
                      <Label>Facebook</Label>
                      <Input type="text" defaultValue="/dashboard/profile" />
                    </div>

                    <div>
                      <Label>X.com</Label>
                      <Input type="text" defaultValue="/dashboard/profile" />
                    </div>

                    <div>
                      <Label>Linkedin</Label>
                      <Input type="text" defaultValue="/dashboard/profile" />
                    </div>

                    <div>
                      <Label>Instagram</Label>
                      <Input type="text" defaultValue="/dashboard/profile" />
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={saving}
                >
                  Close
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
