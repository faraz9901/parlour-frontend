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
        queryKey: ['attendanceLogs'],
        queryFn: attendanceService.getAll,
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
            toast.success('Successfully checked in')
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] })
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error))
        },
    })

    const { mutate: checkOutMutation, isPending: isCheckOutLoading } = useMutation({
        mutationFn: attendanceService.checkOut,
        onSuccess: () => {
            toast.success('Successfully checked out')
            queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] })
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error))
        },
    })

    const handleCheckIn = () => {
        if (!user?._id) return
        checkInMutation(user._id)
    }

    const handleCheckOut = () => {
        if (!user?._id) return
        checkOutMutation(user._id)
    }

    const getStatusBadge = (status: TaskStatus) => {
        const statusMap = {
            [TaskStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
            [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
            [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
        }

        return `px-2 py-1 text-xs font-medium rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                <div className="flex space-x-4">
                    <Button
                        onClick={handleCheckIn}
                        disabled={isLogsLoading || isTasksLoading || isCheckInLoading || isCheckInLoading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        Check In
                    </Button>
                    <Button
                        onClick={handleCheckOut}
                        disabled={isLogsLoading || isTasksLoading || isCheckInLoading || isCheckOutLoading}
                        variant="destructive"
                    >
                        Check Out
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {isLogsLoading || isTasksLoading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : (
                    <>
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Attendance Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {todayLog ? (
                                    <Button
                                        onClick={handleCheckOut}
                                        disabled={isCheckOutLoading || isCheckInLoading}
                                        className="w-full"
                                    >
                                        Check Out
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleCheckIn}
                                        disabled={isCheckInLoading || isCheckOutLoading}
                                        className="w-full"
                                    >
                                        Check In
                                    </Button>
                                )}
                            </CardContent>
                        </Card> */}

                        <Card>
                            <CardHeader>
                                <CardTitle>My Tasks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {tasks && tasks.length ? (
                                    tasks.map((task) => (
                                        <div key={task._id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{task.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {task.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={getStatusBadge(task.status)}>
                                                {task.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No tasks assigned</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Attendance History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendanceHistory && attendanceHistory.length ? (
                                    attendanceHistory.map((log) => (
                                        <div key={log._id} className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">
                                                    {format(new Date(log.checkIn), 'MMM d, yyyy')}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Check-in: {format(new Date(log.checkIn), 'HH:mm')}
                                                </p>
                                                {log.checkOut && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Check-out: {format(new Date(log.checkOut), 'HH:mm')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No attendance history</p>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}