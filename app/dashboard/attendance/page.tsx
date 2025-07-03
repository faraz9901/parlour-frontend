"use client"

import { useState } from "react"
import { Search, Calendar as CalendarIcon, Download } from "lucide-react"
import { format, subDays, isToday, isYesterday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

type AttendanceLog = {
  id: string
  employeeName: string
  date: string
  checkIn: string
  checkOut: string
  status: 'present' | 'absent' | 'late' | 'half_day' | 'on_leave'
}

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const attendanceLogs: AttendanceLog[] = [
    {
      id: "1",
      employeeName: "John Doe",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "09:00 AM",
      checkOut: "06:00 PM",
      status: "present"
    },
    {
      id: "2",
      employeeName: "Jane Smith",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "09:30 AM",
      checkOut: "06:30 PM",
      status: "late"
    },
    {
      id: "3",
      employeeName: "Mike Johnson",
      date: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
      checkIn: "09:15 AM",
      checkOut: "05:45 PM",
      status: "present"
    },
    {
      id: "4",
      employeeName: "Sarah Williams",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "-",
      checkOut: "-",
      status: "absent"
    },
    {
      id: "5",
      employeeName: "David Brown",
      date: format(new Date(), 'yyyy-MM-dd'),
      checkIn: "09:00 AM",
      checkOut: "01:00 PM",
      status: "half_day"
    }
  ]

  const filteredLogs = attendanceLogs.filter(log => {
    const matchesSearch = log.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDate = date ? log.date === format(date, 'yyyy-MM-dd') : true
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    
    return matchesSearch && matchesDate && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500">Present</Badge>
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>
      case 'late':
        return <Badge className="bg-yellow-500">Late</Badge>
      case 'half_day':
        return <Badge className="bg-blue-500">Half Day</Badge>
      case 'on_leave':
        return <Badge className="bg-purple-500">On Leave</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return 'Today'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'MMM dd, yyyy')
  }

  const handleExport = () => {
    // In a real app, this would generate and download a CSV/Excel file
    alert('Exporting attendance data...')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Logs</h1>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="half_day">Half Day</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.employeeName}</TableCell>
                  <TableCell>{getFormattedDate(log.date)}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
