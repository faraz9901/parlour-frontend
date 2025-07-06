"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import attendanceService from '@/lib/services/attendance.service'
import taskService from '@/lib/services/task.service'
import { Task, AttendanceLog } from '@/lib/types'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Role, TaskStatus } from '@/lib/enums'
import useCurrentUser from '@/lib/store/user.store'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import { getErrorMessage } from '@/lib/utils'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, CheckCircle, AlertCircle, Users, Calendar, TrendingUp, LogIn, LogOut } from 'lucide-react'

export default function AttendancePage() {
    const { user, isLoading } = useCurrentUser()
    const router = useRouter()

    useEffect(() => {
        if (!user && !isLoading) {
            router.replace('/')
        } else if (user && user.role === Role.EMPLOYEE) {
            router.replace('/attendance')
        }
    }, [user, isLoading])

    // Query for attendance logs
    const { data: logs, isLoading: isLogsLoading } = useQuery<AttendanceLog[]>({
        queryKey: ['attendanceLogs', user?._id],
        queryFn: attendanceService.getEmployeeLogs,
    })

    // Query for employee tasks
    const { data: tasks, isLoading: isTasksLoading } = useQuery<Task[]>({
        queryKey: ['tasks', user?._id],
        queryFn: taskService.getEmployeeTasks,
    })

    const attendanceHistory = logs
        ?.filter((log: AttendanceLog) => log.employee === user?._id)
        .sort((a: AttendanceLog, b: AttendanceLog) =>
            new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
        )
        .slice(0, 5)

    // Mutations for check-in and check-out
    const { mutate: checkInMutation, isPending: isCheckInLoading } = useMutation({
        mutationFn: attendanceService.checkIn,
        onSuccess: () => {
            toast.success('Successfully checked in! Welcome to work.')
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs', user?._id] })
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error))
        },
    })

    const { mutate: checkOutMutation, isPending: isCheckOutLoading } = useMutation({
        mutationFn: attendanceService.checkOut,
        onSuccess: () => {
            toast.success('Successfully checked out! Have a great day.')
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs', user?._id] })
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleCheckIn = () => {
        if (!user?._id) return
        checkInMutation()
    }

    const handleCheckOut = () => {
        if (!user?._id) return
        checkOutMutation()
    }

    const getStatusBadge = (status: TaskStatus) => {
        const statusMap = {
            [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        }

        return `px-2 py-1 text-xs font-medium rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`
    }

    const getAttendanceStats = () => {
        const totalDays = logs?.length || 0;
        const presentDays = logs?.filter(log => log.checkIn && log.checkOut).length || 0;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        const pendingTasks = tasks?.filter(task => task.status === TaskStatus.PENDING).length || 0;
        const completedTasks = tasks?.filter(task => task.status === TaskStatus.COMPLETED).length || 0;

        return { totalDays, presentDays, attendanceRate, pendingTasks, completedTasks };
    }

    const stats = getAttendanceStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                            <Users className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                                Employee Dashboard
                            </h1>
                            <p className="text-muted-foreground">Welcome back, {user?.name}! Manage your attendance and tasks.</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Clock className="h-5 w-5" />
                            <span>Quick Actions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleCheckIn}
                                disabled={isLogsLoading || isTasksLoading || isCheckInLoading || isCheckOutLoading}
                                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Check In
                            </Button>
                            <Button
                                onClick={handleCheckOut}
                                disabled={isLogsLoading || isTasksLoading || isCheckInLoading || isCheckOutLoading}
                                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <LogOut className="mr-2 h-5 w-5" />
                                Check Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Days</p>
                                    <p className="text-2xl font-bold">{stats.totalDays}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                                    <p className="text-2xl font-bold">{stats.presentDays}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                                    <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardContent className="p-6">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <AlertCircle className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                                    <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* My Tasks */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <AlertCircle className="h-5 w-5" />
                                <span>My Tasks</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLogsLoading || isTasksLoading ? (
                                <div className="text-center p-4">
                                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                                    <p className="text-muted-foreground mt-2">Loading tasks...</p>
                                </div>
                            ) : tasks && tasks.length > 0 ? (
                                <div className="space-y-4">
                                    {tasks.map((task) => (
                                        <div key={task._id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-foreground">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={getStatusBadge(task.status)}>
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No tasks assigned yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Check back later for new assignments</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Attendance History */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Calendar className="h-5 w-5" />
                                <span>Recent Attendance</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLogsLoading || isTasksLoading ? (
                                <div className="text-center p-4">
                                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
                                    <p className="text-muted-foreground mt-2">Loading history...</p>
                                </div>
                            ) : attendanceHistory && attendanceHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {attendanceHistory.map((log) => (
                                        <div key={log._id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-foreground">
                                                    {format(new Date(log.checkIn), 'MMM d, yyyy')}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        <Clock className="inline h-3 w-3 mr-1" />
                                                        In: {format(new Date(log.checkIn), 'HH:mm')}
                                                    </p>
                                                    {log.checkOut && (
                                                        <p className="text-sm text-muted-foreground">
                                                            <LogOut className="inline h-3 w-3 mr-1" />
                                                            Out: {format(new Date(log.checkOut), 'HH:mm')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge className={log.checkOut ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"}>
                                                {log.checkOut ? 'Complete' : 'Partial'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">No attendance history</p>
                                    <p className="text-sm text-muted-foreground mt-1">Your attendance records will appear here</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}