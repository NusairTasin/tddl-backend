'use client'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useEffect, useState } from "react";

export default function Layout({ children}: { children: React.ReactNode}) {

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