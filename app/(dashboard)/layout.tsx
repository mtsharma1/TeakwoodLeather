import { auth } from "@/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import UserAvatar from "@/components/user-avatar"

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
          <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumbs />
            </div>

            {/* Right Section (UserAvatar aligned right) */}
            <div className="ml-auto">
              <UserAvatar userData={{
                name: session?.user?.name ?? "Guest",
                email: session?.user?.email ?? "guest@example.com",
                image: session?.user?.image ?? "/default-avatar.png"
              }} />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="mx-auto p-4">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>

  )
}