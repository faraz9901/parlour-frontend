"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Download, Trash2 } from "lucide-react"
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
      return <Badge variant="destructive">Absent</Badge>
    }
    if (log.checkIn && log.checkOut) {
      return <Badge className="bg-green-500">Present</Badge>
    }
  }


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between space-x-2">
        <div className="flex-1 max-w-[400px]">
          <Input
            placeholder="Search attendance logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
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
          <SelectTrigger>
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  Error: {error?.message || 'Failed to fetch attendance records'}
                </TableCell>
              </TableRow>
            ) : attendanceLogs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center"
                >
                  No attendance logs found.
                </TableCell>
              </TableRow>
            ) : (
              attendanceLogs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell className="font-medium">{log.employee.name}</TableCell>
                  <TableCell>{log.checkIn}</TableCell>
                  <TableCell>{log.checkOut}</TableCell>
                  <TableCell>
                    {getStatusBadge(log)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(log)}
                    >
                      <Trash2 className="h-4 w-4" />
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
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Attendance Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this attendance record for {selectedLog?.employee.name}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
