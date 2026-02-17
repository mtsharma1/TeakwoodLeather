import { SettingsUrl } from "@/components/settings/settings-url";
import prisma from "@/lib/prisma";
import { Settings2Icon } from "lucide-react";

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
    <div className="container max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 underline flex items-center gap-2"><Settings2Icon size={24} /> Settings</h1>
      <div className="mx-auto">
        <SettingsUrl recentJobs={recentJobs} />
      </div>
    </div>
  )
}

