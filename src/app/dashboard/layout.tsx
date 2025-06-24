'use client'

import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

function MobileMenuButton() {
  const { setOpenMobile } = useSidebar()
  return (
    <div className="md:hidden w-full h-14 flex items-center justify-center border-b-1 bg-background relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2"
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-col md:flex-row min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 w-full overflow-y-auto">
          <MobileMenuButton />
          <div className="w-full p-2 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}