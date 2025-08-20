"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthSession } from "@/hooks/use-auth-session";
import { type LucideIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Define roles posibles para navegación
type NavItemType = "superAdmin" | "user" | "privileged" | "adminOnly";

// Tipado de cada ítem del menú
type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  type?: NavItemType;
};

export function NavMain({ items }: { items: NavItem[] }) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuthSession();

  // Determinar si el usuario tiene privilegios
  const role = session?.user?.role as string | undefined;
  const isAdmin = role === "superAdmin";
  const isPrivileged =
    role === "superAdmin" || role === "admin" || role === "moderator";

  useEffect(() => {
    const activePath = items.find((item) => item.url === pathname);
    setActiveItem(activePath?.title || null);
  }, [pathname, items]);

  // Filtrar ítems de navegación según tipo de usuario
  const filteredItems = items.filter((item) => {
    if (!item.type) return true; // Mostrar a todos si no tiene tipo
    if (item.type === "superAdmin") return isAdmin; // Solo superAdmin
    if (item.type === "privileged") return isPrivileged; // Moderators/Admins/SuperAdmins
    if (item.type === "adminOnly")
      return role === "admin" || role === "superAdmin";
    if (item.type === "user") return true; // Mostrar a todos
    return false; // Ocultar si no se cumple nada
  });

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>{/* Espacio reservado para botón futuro */}</SidebarMenu>
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem
              key={item.title}
              onClick={() => {
                setActiveItem(item.title);
                router.push(item.url);
              }}
            >
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activeItem === item.title}
                className="data-[active=true]:text-[#698D8B] text-[#2F4858] hover:text-[#698D8B] data-[active=true]:bg-[#88b6b43c] hover:bg-[#698d8b25] transition-colors duration-200 ease-linear"
              >
                {item.icon && <item.icon className="size-7" />}
                <span className="text-base transition-colors duration-200 ease-linear">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
