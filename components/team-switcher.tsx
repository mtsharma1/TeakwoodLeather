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
      className="p-2 bg-inherit hover:bg-inherit"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
        <Image src={'/logo.jpg'} height={100} width={100} alt="Logo" className="rounded-md" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {activeTeam.name}
        </span>
        <span className="truncate text-xs">{activeTeam.plan}</span>
      </div>
    </Button>
  )
}