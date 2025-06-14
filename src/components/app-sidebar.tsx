'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSubItem,
  } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { ChevronUp, Home, LogOutIcon, Settings, User2 } from "lucide-react"

import { logout, fetchUsername } from "@/app/dashboard/actions"
import { useEffect, useState } from "react"

import { usePathname } from "next/navigation"


  const items = [
    {
        title: "Home",
        url: '/dashboard/home',
        icon: Home
    },
    {
        title: "Settings",
        url: "/dashboard/settings",
        icon: Settings
    }
  ]
   
  
  export function AppSidebar() {
    const pathname = usePathname()
    const [userN, setUserN] = useState<string | null>("")
    useEffect(() => {
        async function getUsername() {
            const name = await fetchUsername()
            setUserN(name)
        }
        getUsername()
    }, [])

    return (
      <Sidebar>
        <SidebarHeader>
            <span className="text-xl lg:text-3xl font-bold flex items-center justify-center">TDDL</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroupContent>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = pathname === item.url
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url} className={"flex items-center justify-center md:justify-start gap-3" + (isActive ? "border-3 !bg-primary !text-primary-foreground dark:!--primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                                    <item.icon className="icon-responsive"/>
                                    <span className="text-xl md:text-2xl">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )
                } 
                )}
            </SidebarMenu>
          </SidebarGroupContent>
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between">
                                <div className="flex items-center gap-2">
                                    <User2 className="icon-responsive"/>
                                    <span className="text-sm md:text-base lg:text-md font-medium truncate">{userN}</span>
                                    </div>
                                <ChevronUp className="ml-auto" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            side="top"
                            className="w-[--radix-popper-anchor-width] px-1 py-1"
                        >
                            <DropdownMenuItem onClick={logout} className="cursor-pointer">
                                <LogOutIcon className="icon-responsive"/>
                                <span className="text-sm md:text-base lg:text-md">Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    )
  }