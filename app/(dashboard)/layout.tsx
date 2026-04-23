import { auth } from "@/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import UserAvatar from "@/components/user-avatar"
import { Bell, Search, Settings } from "lucide-react"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar variant="sidebar" className="hidden md:flex" />
        <SidebarInset className="flex w-full flex-col overflow-hidden">
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-3 border-b border-[#2a6fda] bg-[#2f7ae5] px-5 transition-[width,height] ease-linear justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger className="-ml-1 text-white hover:bg-white/15 hover:text-white" />
              <Separator orientation="vertical" className="mr-2 h-4 bg-white/25" />
              <h1 className="hidden md:block text-sm md:text-base font-semibold tracking-[0.08em] text-white uppercase">
                TEAKWOOD ORDER MANAGEMENT SYSTEM
              </h1>
              <div className="hidden md:block text-white/90 [&_*]:text-white/90">
                <Breadcrumbs />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="h-8 w-8 rounded-md bg-transparent text-white/90 hover:bg-white/15 hover:text-white">
                <Bell className="h-4 w-4 mx-auto" />
              </button>
              <button className="h-8 w-8 rounded-md bg-transparent text-white/90 hover:bg-white/15 hover:text-white">
                <Search className="h-4 w-4 mx-auto" />
              </button>
              <Link
                href="/settings"
                className="grid h-8 w-8 place-items-center rounded-md bg-transparent text-white/90 hover:bg-white/15 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Link>
              <div className="hidden sm:block">
                <UserAvatar userData={{
                  name: session?.user?.name ?? "Guest",
                  email: session?.user?.email ?? "guest@example.com",
                  image: session?.user?.image ?? "/default-avatar.png"
                }} />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-[#dfe4ea]">
            <div className="mx-auto p-4 md:p-6">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>

  )
}
