"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Download, Trash2, Clock, Users, TrendingUp, Filter } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
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
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import attendanceService from "@/lib/services/attendance.service"
import { AttendanceLogWithUser } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<AttendanceLogWithUser | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Fetch attendance records with React Query
  const { data: attendanceLogs = [], isLoading, isError, error } = useQuery<AttendanceLogWithUser[]>({
    queryKey: ['attendance'],
    queryFn: attendanceService.getAll,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceService.delete(id),
    onSuccess: () => {
      toast.success("Attendance record deleted successfully")
      setDeleteDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance record')
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = (log: AttendanceLogWithUser) => {
    setSelectedLog(log)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (selectedLog) {
      deleteMutation.mutate(selectedLog._id)
    }
  }

  const getStatusBadge = (log: AttendanceLogWithUser) => {
    if (!log.checkIn && !log.checkOut) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Absent
      </Badge>
    }
    if (log.checkIn && log.checkOut) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
        <Users className="h-3 w-3" />
        Present
      </Badge>
    }
  }

  const getAttendanceStats = () => {
    const total = attendanceLogs.length;
    const present = attendanceLogs.filter(log => log.checkIn && log.checkOut).length;
    const absent = attendanceLogs.filter(log => !log.checkIn && !log.checkOut).length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, attendanceRate };
  }

  const stats = getAttendanceStats();

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
            <p className="text-muted-foreground">Track employee attendance and manage records</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold">{stats.absent}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Rate</p>
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-muted-foreground/20">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="half_day">Half Day</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 overflow-hidden">
        <div className="rounded-md border-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Employee</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Check In</TableHead>
                <TableHead className="font-semibold">Check Out</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
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
              ) : attendanceLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No attendance logs found.
                  </TableCell>
                </TableRow>
              ) : (
                attendanceLogs.map((log) => (
                  <TableRow key={log._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{log.employee.name}</TableCell>
                    <TableCell className="text-muted-foreground">{log.checkIn}</TableCell>
                    <TableCell className="text-muted-foreground">{log.checkOut}</TableCell>
                    <TableCell>
                      {getStatusBadge(log)}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          // Download attendance record
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5" />
              <span>Delete Attendance Record</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendance record for {selectedLog?.employee.name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
