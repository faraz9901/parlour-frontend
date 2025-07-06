"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/enums"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { AxiosError } from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { validation } from "@/lib/validations"
import Password from "@/components/ui/password"
import { Badge } from "@/components/ui/badge"
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog"
import userService from "@/lib/services/user.service"
import { Employee } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const queryClient = useQueryClient()

  const { data: employees, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null)
  const [mode, setMode] = useState<'create' | 'update'>('create')

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { mutate: createUser, isPending: createUserPending } = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      setIsDialogOpen(false)
      setCurrentEmployee(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success("Employee created successfully")
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    }
  })

  const { mutate: updateUser, isPending: updateUserPending } = useMutation({
    mutationFn: userService.update,
    onSuccess: () => {
      setIsDialogOpen(false)
      setCurrentEmployee(null)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success("Employee updated successfully")
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    }
  })

  const { mutate: deleteUser, isPending: deleteUserPending } = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setIsDeleteDialogOpen(false)
      setCurrentEmployee(null)
      toast.success("Employee deleted successfully")
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    }
  })

  const filteredEmployees = employees

  const handleDeleteEmployee = (employee: Employee) => {
    setCurrentEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const handleAddEmployee = () => {
    setMode('create')
    setCurrentEmployee({
      _id: "",
      name: "",
      email: "",
      password: "",
      role: Role.EMPLOYEE,
    })
    setIsDialogOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setMode('update')
    setCurrentEmployee({ ...employee, password: "" })
    setIsDialogOpen(true)
  }

  const handleSaveEmployee = () => {
    if (!currentEmployee) return

    const emailValidation = validation.email(currentEmployee.email);
    const passwordValidation = validation.password(currentEmployee.password);
    const nameValidation = validation.name(currentEmployee.name);
    const roleValidation = validation.role(currentEmployee.role);

    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return;
    }
    if (mode === 'create' && !passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    } else if (mode === 'update' && currentEmployee.password && !passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    if (!nameValidation.valid) {
      toast.error(nameValidation.message);
      return;
    }
    if (!roleValidation.valid) {
      toast.error(roleValidation.message);
      return;
    }

    if (mode === 'update') {
      updateUser({ id: currentEmployee._id, user: currentEmployee });
    } else {
      createUser(currentEmployee);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentEmployee) return
    setCurrentEmployee({ ...currentEmployee, [e.target.name]: e.target.value })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">Manage your team members and their roles</p>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees?.length || 0}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{employees?.filter((e: Employee) => e.role === Role.EMPLOYEE).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{employees?.filter((e: Employee) => e.role === Role.ADMIN).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-10 bg-background/50 border-muted-foreground/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddEmployee}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 overflow-hidden">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="text-center font-semibold">Role</TableHead>
                  <TableHead className="text-center font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee: Employee) => (
                  <TableRow key={employee._id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={employee.role === Role.ADMIN ? "default" : "secondary"}
                        className={employee.role === Role.ADMIN ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" : ""}
                      >
                        {employee.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center space-x-1">
                      <Button
                        className="cursor-pointer"
                        variant="ghost"
                        disabled={deleteUserPending}
                        size="icon"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        className="cursor-pointer"
                        variant="ghost"
                        disabled={deleteUserPending}
                        size="icon"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={() => deleteUser(currentEmployee ? currentEmployee._id : '')}
        isLoading={deleteUserPending}
        description="Are you sure you want to delete this employee? This action cannot be undone."
        itemToDelete={currentEmployee?.name}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{mode === 'update' ? 'Edit' : 'Add'} Employee</span>
            </DialogTitle>
            <DialogDescription>
              {mode === 'update' ? 'Update' : 'Add new'} employee details to your team
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                disabled={updateUserPending || createUserPending}
                value={currentEmployee?.name || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                disabled={updateUserPending || createUserPending}
                value={currentEmployee?.email || ''}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <div className="col-span-3">
                <Password
                  id="password"
                  name="password"
                  disabled={updateUserPending || createUserPending}
                  value={currentEmployee?.password || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <div className="col-span-3">
                <Select
                  value={currentEmployee?.role || Role.EMPLOYEE}
                  name="role"
                  disabled={updateUserPending || createUserPending}
                  onValueChange={(value: Role) => {
                    if (!currentEmployee) return
                    setCurrentEmployee({ ...currentEmployee, role: value })
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button disabled={updateUserPending || createUserPending} variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={updateUserPending || createUserPending}
              onClick={handleSaveEmployee}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {updateUserPending || createUserPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
