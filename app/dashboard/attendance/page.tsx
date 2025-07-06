"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useQuery } from "@tanstack/react-query"
import attendanceService from "@/lib/services/attendance.service"
import { AttendanceLogWithUser } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import useAttendanceListner from "@/hooks/useAttendanceListner"
import AttendanceBadge from "@/components/AttendanceBadge"

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date>(new Date())

  useAttendanceListner()

  // Fetch attendance records with React Query
  const { data: attendanceLogs = [], isLoading, isError, error } = useQuery<AttendanceLogWithUser[]>({
    queryKey: ['attendance'],
    queryFn: attendanceService.getAll,
  })


  const filteredAttendanceLogs = () => {

    let filteredLogs = attendanceLogs

    if (searchTerm) {
      filteredLogs = filteredLogs.filter(log => log.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || log.employee.email.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (date) {
      filteredLogs = filteredLogs.filter(log => format(log.checkIn, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
    }

    return filteredLogs
  }


  const filterLogs = filteredAttendanceLogs()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder="Search attendance logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background/50 border-muted-foreground/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="bg-background/50 border-muted-foreground/20">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    required
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 overflow-hidden">
        <div className="rounded-md border-0 w-[90vw] md:w-full  overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-center font-semibold">Employee</TableHead>
                <TableHead className="text-center font-semibold">Date</TableHead>
                <TableHead className="text-center font-semibold">Check In</TableHead>
                <TableHead className="text-center font-semibold">Check Out</TableHead>
                <TableHead className="text-center font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-destructive">
                    Error: {error?.message || 'Failed to fetch attendance records'}
                  </TableCell>
                </TableRow>
              ) : filterLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No attendance logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filterLogs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center font-medium">{log.employee.name}</TableCell>
                    <TableCell className="text-center font-medium">{format(log.createdAt, 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{format(log.checkIn, 'hh:mm a')}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{log.checkOut ? format(log.checkOut, 'hh:mm a') : 'Not checked out'}</TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge checkIn={!!log.checkIn} checkedOut={!!log.checkOut} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
