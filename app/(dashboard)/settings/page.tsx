import { SettingsUrl } from "@/components/settings/settings-url";
import prisma from "@/lib/prisma";
import { Bell, CircleUserRound, Globe2, Menu, Search, Settings2Icon } from "lucide-react";

export default async function SettingsPage() {
  const recentJobs = await prisma.jobStatus.findMany({
    select: {
      jobType: true,
      filePath: true,
      status: true,
      message: true,
      updatedAt: true,
      completedAt: true
    },
  })
  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="overflow-hidden rounded-[2rem] border border-[#d4dce9] bg-[#f7f9fc] shadow-[0_25px_60px_-40px_rgba(29,51,98,0.55)]">
        <div className="border-b border-[#dce3ef] bg-white px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-xl border border-[#d7dfea] bg-[#f5f8fd] text-[#5a6782]">
                <Menu className="h-4 w-4" />
              </button>
              <div className="hidden md:flex items-center gap-2 rounded-2xl border border-[#dde4f0] bg-[#f1f5fb] px-4 py-2 min-w-[280px]">
                <Search className="h-4 w-4 text-[#7f8ca5]" />
                <span className="text-sm text-[#7f8ca5]">Search here</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-semibold text-[#303b50]">Settings Workspace</span>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#d7dfea] bg-white text-[#495a78]">
                <Globe2 className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#d7dfea] bg-white text-[#495a78]">
                <Bell className="h-4 w-4" />
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-xl border border-[#d7dfea] bg-white text-[#495a78]">
                <CircleUserRound className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-b border-[#dce3ef] bg-[#f8fbff]">
          <h1 className="text-xl md:text-2xl font-semibold tracking-[0.04em] text-[#364053] flex items-center gap-2">
            <Settings2Icon size={22} />
            General
          </h1>
        </div>

        <div className="p-5">
          <SettingsUrl recentJobs={recentJobs} />
        </div>
      </div>
    </div>
  )
}

