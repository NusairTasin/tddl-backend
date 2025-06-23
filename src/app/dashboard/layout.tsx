'use client'

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

function MobileMenuButton() {
  const { setOpenMobile } = useSidebar()
  return (
    <div className="md:hidden w-full h-14 flex items-center px-4 border-b bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="mr-2"
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
      <span className="text-lg font-bold">Menu</span>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row h-screen">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <MobileMenuButton />
          <div className="container mx-auto p-2 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}