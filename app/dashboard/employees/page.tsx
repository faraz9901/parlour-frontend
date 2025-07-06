"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>


      {isLoading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 bg-white w-full" />
          <Skeleton className="h-10 bg-white w-full" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee: Employee) => (
                <TableRow key={employee._id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="text-center"><Badge variant="default">{employee.role.toUpperCase()}</Badge></TableCell>
                  <TableCell className="text-center">
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
      )
      }


      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={() => deleteUser(currentEmployee ? currentEmployee._id : '')}
        isLoading={deleteUserPending}
        description="Are you sure you want to delete this employee? This action cannot be undone."
        itemToDelete={currentEmployee?.name}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'update' ? 'Edit' : 'Add'} Employee</DialogTitle>
            <DialogDescription>
              {mode === 'update' ? 'Update' : 'Add new'} employee details
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
            <Button disabled={updateUserPending || createUserPending} type="submit" onClick={handleSaveEmployee}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
