"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Spinner from "@/components/ui/spinner"
import useAttendanceListner from "@/hooks/useAttendanceListner"
import attendanceService from "@/lib/services/attendance.service"
import taskService from "@/lib/services/task.service"
import userService from "@/lib/services/user.service"
import { AttendanceLogWithUser, Employee, TaskWithUser } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { Users, ClipboardList, Clock, Activity } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {

  useAttendanceListner()

  // Fetch attendance records with React Query
  const { data: attendanceLogs = [], isLoading: isAttendanceLoading } = useQuery<AttendanceLogWithUser[]>({
    queryKey: ['employees-logs'],
    queryFn: attendanceService.getEmployeesLogs
  })

  // Query for attendance logs
  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: userService.getEmployees,
  })

  const { data: tasks = [], isLoading: isTasksLoading } = useQuery<TaskWithUser[]>({
    queryKey: ['tasks'],
    queryFn: taskService.getAll,
  })



  const stats = [
    {
      title: "Total Employees",
      icon: Users,
      value: employees.length,
      href: "/dashboard/employees",
      description: "Active team members",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Active Tasks",
      icon: ClipboardList,
      value: tasks.length,
      href: "/dashboard/tasks",
      description: "Tasks in progress",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Today's Attendance",
      icon: Clock,
      value: `${attendanceLogs.length} / ${employees.length}`,
      href: "/dashboard/attendance",
      description: "Present today",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    }
  ]

  const quickActions = [
    {
      title: "Add Employee",
      description: "Register new team member",
      icon: Users,
      href: "/dashboard/employees",
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Create Task",
      description: "Assign new task",
      icon: ClipboardList,
      href: "/dashboard/tasks",
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "View Reports",
      description: "Check attendance reports",
      icon: Activity,
      href: "/dashboard/attendance",
      color: "from-emerald-500 to-teal-500"
    }
  ]



  if (isAttendanceLoading || isEmployeesLoading || isTasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size={24} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your parlour today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 hover:bg-white/80 dark:hover:bg-slate-900/80 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} shadow-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
