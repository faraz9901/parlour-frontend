"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, ClipboardList, Clock, LogOut } from "lucide-react"
import { Button } from "./ui/button"
import useCurrentUser from "@/lib/store/user.store"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Role } from "@/lib/enums"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const { logout, user, isLoading } = useCurrentUser()

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/')
    } else if (user && user.role === Role.EMPLOYEE) {
      router.replace('/attendance')
    }
  }, [user, isLoading])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  ]

  return (
    <div className="hidden border-r bg-gray-50 md:block w-64">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <h1 className="text-xl font-semibold">Parlour Admin</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isActive ? 'bg-gray-100 text-primary' : 'text-gray-500 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="p-4">
          <Button variant="outline" className="w-full gap-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
