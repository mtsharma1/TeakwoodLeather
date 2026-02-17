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
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [hoverStyle, setHoverStyle] = useState({})
  const [activeStyle, setActiveStyle] = useState({})
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  const updateActiveIndex = useCallback(() => {
    const index = tabs.findIndex((tab) => tab.href === pathname)
    if (index !== -1) {
      setActiveIndex(index)
      // Only update the active style immediately on first render
      if (isFirstRender.current) {
        const activeElement = tabRefs.current[index]
        if (activeElement) {
          const { offsetLeft, offsetWidth } = activeElement
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        }
        isFirstRender.current = false
      }
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

  // Separate effect for updating active style with a slight delay
  useEffect(() => {
    if (activeIndex !== null && !isFirstRender.current) {
      const activeElement = tabRefs.current[activeIndex]
      if (activeElement) {
        const { offsetLeft, offsetWidth } = activeElement
        // Use requestAnimationFrame to ensure the transition happens after the route change
        requestAnimationFrame(() => {
          setActiveStyle({
            left: `${offsetLeft}px`,
            width: `${offsetWidth}px`,
          })
        })
      }
    }
  }, [activeIndex])

  return (
    <Card className="w-full h-[50px] pb-3 border-none shadow-none relative flex items-center justify-start">
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

