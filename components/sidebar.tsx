"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, ClipboardList, Clock, LogOut, Menu, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import useCurrentUser from "@/lib/store/user.store"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { logout, isSignedIn } = useCurrentUser()

  useEffect(() => {
    if (!isSignedIn) {
      router.replace('/')
    }

  }, [isSignedIn])

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Employees', href: '/dashboard/employees', icon: Users },
    { name: 'Tasks', href: '/dashboard/tasks', icon: ClipboardList },
    { name: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  ]

  const handleLogout = () => {
    logout()
    setIsMobileMenuOpen(false)
  }

  const SidebarContent = () => (
    <div className="flex fixed h-screen w-64 flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-white">Parlour Admin</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-3 text-sm font-medium space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${isActive
                  ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-600 border-r-2 border-blue-600'
                  : 'text-muted-foreground'
                  }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full gap-2 h-10 bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block border-r bg-card w-64 shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-2 left-2 z-50 lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
