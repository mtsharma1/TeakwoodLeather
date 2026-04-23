"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./ui/button"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  const activeTeam = teams[0]

  return (
    <Button
      size={'lg'}
      className="h-auto w-full justify-start gap-3 rounded-lg border border-[#dde3ec] bg-white px-3 py-3 text-[#2d3445] hover:bg-[#f7f9fc]"
    >
      <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#edf2f8]">
        <Image src={'/logo.jpg'} height={100} width={100} alt="Logo" className="h-full w-full object-cover" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate text-sm font-semibold uppercase tracking-[0.06em] text-[#3c4457]">
          {activeTeam.name}
        </span>
        <span className="truncate text-xs text-[#8c95a6]">{activeTeam.plan}</span>
      </div>
    </Button>
  )
}
