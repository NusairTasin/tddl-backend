'use client'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";
import { checkCookie } from "./actions";

export default function Layout({ children}: { children: React.ReactNode}) {

    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    useEffect(() => {
    const fetchLoginStatus = async () => {
      const loggedIn = await checkCookie()
      setIsLoggedIn(loggedIn!)
    }
        fetchLoginStatus()
    }, [])

    return ( 
        <SidebarProvider>
            <AppSidebar />
            <main className="min-h-screen">
                {/* <div className="flex items-center justify-end p-4 border-b">
                    <ThemeToggle />
                </div> */}
                <SidebarTrigger />
                { children }
            </main>
        </SidebarProvider>
    )
}