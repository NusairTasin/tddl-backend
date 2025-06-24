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
import { Building2, FileText, LogOut, User2, ChevronUp, X, PhoneCall } from "lucide-react"
import { logout, fetchUsername } from "@/app/dashboard/actions"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useSidebar } from "@/components/ui/sidebar"

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
    },
    {
        title: "Contact",
        url: "/dashboard/contact",
        icon: PhoneCall
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [userN, setUserN] = useState<string | null>(null)
    const [loadingUser, setLoadingUser] = useState(true)
    const [isMobile, setIsMobile] = useState(false)
    const { openMobile, setOpenMobile } = useSidebar()

    useEffect(() => {
        const getUsername = async () => {
            setLoadingUser(true)
            const name = await fetchUsername()
            setUserN(name)
            setLoadingUser(false)
        }
        getUsername()

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth >= 768) {
                setOpenMobile(false)
            }
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [router, setOpenMobile])

    return (
        <Sidebar className={`border-r h-screen ${isMobile ? 'fixed inset-0 z-40 bg-background' : ''}`}>
            {/* Mobile Close Button */}
            {isMobile && openMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-50 md:hidden w-10 h-10 flex items-center justify-center"
                    onClick={() => setOpenMobile(false)}
                >
                    <X className="h-6 w-6" />
                </Button>
            )}
            {/* Sidebar Content: Always Rendered */}
            <SidebarHeader className="border-b p-4">
                <div className="flex items-center justify-start">
                    <span className="text-lg md:text-xl lg:text-2xl text-primary font-bold">TDDL</span>
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
                                            <span className="text-md sm:text-sm md:text-md lg:text-lg font-medium">{item.title}</span>
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
                                        {loadingUser ? (
                                            <Skeleton className="h-6 w-32" />
                                        ) : (
                                            <span className="sm:text-sm md:text-md lg:text-lg font-medium truncate">{userN ? userN.split('@')[0] : 'No email'}</span>
                                        )}
                                    </div>
                                    <ChevronUp className="h-4 w-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="center"
                                className="w-[--radix-popper-anchor-width] min-w-40"
                            >
                                <DropdownMenuItem 
                                    onClick={logout} 
                                    className="cursor-pointer focus:font-bold focus:text-primary text-primary font-semibold sm:text-sm md:text-md"
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