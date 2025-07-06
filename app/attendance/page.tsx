"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import attendanceService from '@/lib/services/attendance.service'
import { AttendanceLog, Employee } from '@/lib/types'
import { useQuery, useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/react-query'
import { getErrorMessage } from '@/lib/utils'
import { AxiosError } from 'axios'

import userService from '@/lib/services/user.service'
import AttendanceBadge from '@/components/AttendanceBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

export default function AttendancePage() {

  // Query for attendance logs of today
  const { data: logs, isLoading: isLogsLoading } = useQuery<AttendanceLog[]>({
    queryKey: ['employees-logs'],
    queryFn: attendanceService.getEmployeesLogs,
  })

  // Query for attendance logs
  const { data: employees, isLoading: isEmployeesLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: userService.getEmployees,
  })

  // Mutations for check-in and check-out
  const { mutate: checkInMutation, isPending: isCheckInLoading } = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      toast.success('Successfully checked in! Welcome to work.')
      queryClient.invalidateQueries({ queryKey: ['employees-logs'] })
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    },
  })

  const { mutate: checkOutMutation, isPending: isCheckOutLoading } = useMutation({
    mutationFn: attendanceService.checkOut,
    onSuccess: () => {
      toast.success('Successfully checked out! Have a great day.')
      queryClient.invalidateQueries({ queryKey: ['employees-logs'] })
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    },
  })


  if (isLogsLoading || isEmployeesLoading) {
    return (
      <div className='flex flex-col gap-4 p-3'>
        <Skeleton className="h-16 bg-blue-200" />
        <Skeleton className="h-16 bg-blue-200" />
      </div>
    )

  }

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
            </div>
          </div>
        </div>

        <div className='grid-cols-4 grid gap-4'>
          {employees?.map((employee) => {
            const employeeLog = logs?.find((log) => log.employee === employee._id)

            return (
              <Card key={employee._id}>
                <CardHeader>
                  <CardTitle>{employee.name}</CardTitle>
                </CardHeader>
                <CardContent className='flex flex-col gap-4'>
                  <div className="flex justify-between items-center">

                    <p>{employee.email}</p>

                    <AttendanceBadge checkedOut={!!employeeLog?.checkOut} checkIn={!!employeeLog?.checkIn} />
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      disabled={isCheckInLoading || !!employeeLog?.checkIn}
                      onClick={() => checkInMutation(employee._id)}
                    >
                      Check In
                    </Button>
                    <Button
                      disabled={isCheckOutLoading || !!employeeLog?.checkOut}
                      onClick={() => checkOutMutation(employee._id)}
                    >
                      Check Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}