"use client";

import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useIsMobile } from "@/hooks/use-mobile";

// Define roles posibles para navegación
type NavItemType = "superAdmin" | "user";

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
  const isMobile = useIsMobile();
  const { session } = useAuthSession();

  // Determinar si el usuario es superAdmin
  const isAdmin = session?.user?.role === "superAdmin";

  useEffect(() => {
    const activePath = items.find((item) => item.url === pathname);
    setActiveItem(activePath?.title || null);
  }, [pathname, items]);

  // Filtrar ítems de navegación según tipo de usuario
  const filteredItems = items.filter((item) => {
    if (!item.type) return true; // Mostrar a todos si no tiene tipo
    if (item.type === "superAdmin") return isAdmin; // Solo si el usuario es superAdmin
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

// "use client";

// import { MailIcon, PlusCircleIcon, type LucideIcon } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import { useEffect, useState } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { NavUser } from "@/components/dashboard/nav-user";
// import { User } from "next-auth";
// import { useAuthSession } from "@/hooks/use-auth-session";
// import { useIsMobile } from "@/hooks/use-mobile";

// export function NavMain({
//   items,
// }: {
//   items: {
//     title: string;
//     url: string;
//     icon?: LucideIcon;
//     isActive?: boolean;
//     type?: "superAdmin" | "user";
//   }[];
// }) {
//   const [activeItem, setActiveItem] = useState<string | null>(null);
//   const pathname = usePathname();
//   const router = useRouter();
//   const isMobile = useIsMobile();
//   const { session } = useAuthSession();
//   const isAdmin = session?.user?.role === "superAdmin";

//   useEffect(() => {
//     const activePath = items.find((item) => item.url === pathname);
//     setActiveItem(activePath?.title || null);
//   }, [pathname]);

//   // Filter items based on user role
//   const filteredItems = items.filter((item) => {
//     if (!item.type) return true; // Show items without type restriction
//     if (item.type === "superAdmin" && isAdmin) return true; // Show superAdmin items only to admins
//     if (item.type === "user") return true; // Show user items to everyone
//     return false;
//   });

//   return (
//     <SidebarGroup>
//       <SidebarGroupContent className="flex flex-col gap-2">
//         <SidebarMenu>
//           {/* TODO: Add create campaign button when the information is available */}
//           {/* <SidebarMenuItem className="flex items-center gap-2">
//             <SidebarMenuButton
//               tooltip="Quick Createeeee"
//               className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
//             >
//               <PlusCircleIcon />
//               <span>Create Campaign</span>
//             </SidebarMenuButton> */}
//           {/* <Button
//               size="icon"
//               className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
//               variant="outline"
//             >
//               <MailIcon />
//               <span className="sr-only">Inbox</span>
//             </Button> */}
//           {/* </SidebarMenuItem> */}
//         </SidebarMenu>
//         <SidebarMenu>
//           {filteredItems.map((item) => (
//             <SidebarMenuItem
//               key={item.title}
//               onClick={() => {
//                 setActiveItem(item.title);
//                 router.push(item.url);
//               }}
//             >
//               <SidebarMenuButton
//                 tooltip={item.title}
//                 isActive={activeItem === item.title}
//                 className=" data-[active=true]:text-[#698D8B] text-[#2F4858] hover:text-[#698D8B] data-[active=true]:bg-[#88b6b43c] hover:bg-[#698d8b25] transition-colors duration-200 ease-linear"
//               >
//                 {item.icon && <item.icon className="size-7" />}
//                 <span className="text-base transition-colors duration-200 ease-linear">
//                   {item.title}
//                 </span>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           ))}
//         </SidebarMenu>
//       </SidebarGroupContent>
//     </SidebarGroup>
//   );
// }
