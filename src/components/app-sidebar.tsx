'use client'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Building2, FileText, LogOut, PlusCircle, User2, ChevronUp } from "lucide-react"
import { logout, fetchUsername } from "@/app/dashboard/actions"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

const items = [
    {
        title: "Listings",
        url: '/dashboard/listings',
        icon: Building2
    },
    {
        title: "Blogs",
        url: "/dashboard/blogs",
        icon: FileText
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [userN, setUserN] = useState<string | null>("")
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const getUsername = async () => {
            const name = await fetchUsername()
            setUserN(name)
        }
        getUsername()

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <Sidebar className="border-r h-screen">
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center justify-between">
                    <span className="text-xl lg:text-3xl font-bold">TDDL</span>
                    {isMobile && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push('/dashboard/listings')}
                        >
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="flex-1 overflow-y-auto">
                <SidebarGroup />
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => {
                            const isActive = pathname === item.url
                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a 
                                            href={item.url} 
                                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                                isActive 
                                                    ? "bg-primary text-primary-foreground" 
                                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                            }`}
                                        >
                                            <item.icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
                <SidebarGroup />
            </SidebarContent>

            <SidebarFooter className="border-t p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full justify-between hover:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <User2 className="h-5 w-5" />
                                        <span className="text-sm font-medium truncate">{userN}</span>
                                    </div>
                                    <ChevronUp className="h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem 
                                    onClick={logout} 
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}