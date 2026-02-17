"use client"
import { usePathname } from "next/navigation"
import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbLink,
   BreadcrumbList,
   BreadcrumbPage,
   BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type React from "react"

export function Breadcrumbs() {
   const pathname = usePathname()
   const paths = pathname.split("/").filter(Boolean)

   return (
      <Breadcrumb>
         <BreadcrumbList>
            {paths.map((path, index) => {
               const href = `/${paths.slice(1, index).join("/")}`
               const isLast = index === paths.length - 1

               return (
                  <>
                     <BreadcrumbItem key={path}>
                        {isLast ? (
                           <BreadcrumbPage className="capitalize">{path}</BreadcrumbPage>
                        ) : (
                           <BreadcrumbLink href={href} className="capitalize">{path}</BreadcrumbLink>
                        )}
                     </BreadcrumbItem>
                     {!isLast && <BreadcrumbSeparator />}
                  </>
               )
            })}
         </BreadcrumbList>
      </Breadcrumb>
   )
}