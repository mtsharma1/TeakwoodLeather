"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

type TabsI = {
  name: string
  href: string
}[]

export default function AnimatedTabs({ tabs }: { tabs: TabsI }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const pathname = usePathname()

  const updateActiveIndex = useCallback(() => {
    const index = tabs.findIndex((tab) => tab.href === pathname)
    if (index !== -1) {
      setActiveIndex(index)
    }
  }, [pathname, tabs])

  useEffect(() => {
    updateActiveIndex()
  }, [updateActiveIndex])

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex]
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    }
  }, [hoveredIndex])

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [activeIndex])

  return (
    <Card className="w-full h-[100px] border-none shadow-none relative flex items-center justify-center">
      <CardContent className="p-0">
        <div className="relative">
          {/* Hover Highlight */}
          <div
            className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
            style={{
              ...hoverStyle,
              opacity: hoveredIndex !== null ? 1 : 0,
            }}
          />

          {/* Active Indicator */}
          <div
            className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
            style={activeStyle}
          />

          {/* Tabs */}
          <div className="relative flex space-x-[6px] items-center">
            {tabs.map((tab, index) => (
              <Link
                key={index}
                href={tab.href}
                className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                  index === activeIndex ? "text-[#0e0e10] dark:text-white" : "text-[#0e0f1199] dark:text-[#ffffff99]"
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setActiveIndex(index)}
              >
                <div
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  className="text-sm font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap flex items-center justify-center h-full"
                >
                  {tab.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

