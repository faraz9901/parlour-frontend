"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Pencil, Trash2, LoaderCircle, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { api, getErrorMessage } from "@/lib/utils"
import { AxiosError } from "axios"
import { TaskStatus } from "@/lib/enums"
import userService from "@/lib/services/user.service"
import { Employee, Task, TaskWithUser } from "@/lib/types"
import { validation } from "@/lib/validations"
import { Card, CardContent } from "@/components/ui/card"
import TaskBadge from "@/components/TaskBadge"

// API Service
const API_BASE_URL = '/tasks';

const fetchTasks = async () => {
    const response = await api.get(API_BASE_URL)

    if (!response.data.success) {
        throw new Error('Failed to fetch tasks')
    }

    return response.data.content;
};

const createTask = async (task: Omit<Task, '_id'>) => {
    const response = await api.post(`${API_BASE_URL}/create`, task)

    if (!response.data.success) {
        throw new Error('Failed to create task')
    }

    return response.data.content;
};

const updateTask = async (task: Task) => {
    const response = await api.put(`${API_BASE_URL}/update/${task._id}`, task)

    if (!response.data.success) {
        throw new Error('Failed to update task')
    }

    return response.data.content;
};

const deleteTask = async (id: string) => {
    const response = await api.delete(`${API_BASE_URL}/delete/${id}`)

    if (!response.data.success) {
        throw new Error('Failed to delete task')
    }

    return id;
};

export default function TasksPage() {
    const queryClient = useQueryClient()

    // Fetch tasks with React Query
    const { data: tasks = [], isLoading, isError, error } = useQuery<TaskWithUser[]>({
        queryKey: ['tasks'],
        queryFn: fetchTasks,
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: userService.getAll,
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success("Task created successfully");
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error));
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success("Task updated successfully");
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            toast.success("Task deleted successfully");
        },
        onError: (error: AxiosError) => {
            toast.error(getErrorMessage(error));
        },
    });

    const [searchTerm, setSearchTerm] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
    const [currentTask, setCurrentTask] = useState<Omit<Task, '_id'>>({
        title: "",
        description: "",
        assignedTo: "",
        status: TaskStatus.PENDING,
    })
    const [mode, setMode] = useState<'create' | 'edit'>('create')

    const filteredTasks = tasks?.filter(task =>
        task?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.assignedTo?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const handleAddTask = () => {
        setCurrentTask({
            title: "",
            description: "",
            assignedTo: "",
            status: TaskStatus.PENDING,
        })
        setMode('create')
        setIsDialogOpen(true)
    }

    const handleEditTask = (task: TaskWithUser) => {
        setCurrentTask({ ...task, assignedTo: task.assignedTo._id })
        setMode('edit')
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (id: string) => {
        setTaskToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            deleteMutation.mutate(taskToDelete);
            setIsDeleteDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    const handleSaveTask = () => {
        const titleValidation = validation.empty(currentTask.title, "Title");
        const descriptionValidation = validation.empty(currentTask.description, "Description");
        const assignedToValidation = validation.empty(currentTask.assignedTo, "Assigned To");
        const statusValidation = validation.status(currentTask.status);

        if (!titleValidation.valid) {
            toast.error(titleValidation.message);
            return;
        }
        if (!descriptionValidation.valid) {
            toast.error(descriptionValidation.message);
            return;
        }
        if (!assignedToValidation.valid) {
            toast.error(assignedToValidation.message);
            return;
        }
        if (!statusValidation.valid) {
            toast.error(statusValidation.message);
            return;
        }

        const taskData = {
            ...currentTask,
            status: currentTask.status || TaskStatus.PENDING,
        };

        if (mode === 'edit') {
            updateMutation.mutate(taskData as Task);
        } else {
            createMutation.mutate(taskData as Omit<Task, '_id'>);
        }

        setIsDialogOpen(false);
        setCurrentTask({
            title: "",
            description: "",
            assignedTo: "",
            status: TaskStatus.PENDING,
        });
    };

    const getStatusCount = (status: TaskStatus) => {
        return tasks.filter(task => task.status === status).length;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                        <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold">{getStatusCount(TaskStatus.PENDING)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60">
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                                <p className="text-2xl font-bold">{getStatusCount(TaskStatus.IN_PROGRESS)}</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold">{getStatusCount(TaskStatus.COMPLETED)}</p>
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
                                placeholder="Search tasks..."
                                className="pl-10 bg-background/50 border-muted-foreground/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleAddTask}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 bg-white/60 backdrop-blur-sm dark:bg-slate-900/60 overflow-hidden">
                <div className="rounded-md border-0 w-[90vw] md:w-full  overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="text-center font-semibold">Title</TableHead>
                                <TableHead className="text-center font-semibold">Assigned To</TableHead>
                                <TableHead className="text-center font-semibold">Status</TableHead>
                                <TableHead className="text-center font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex justify-center">
                                            <LoaderCircle className="h-8 w-8 animate-spin" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                                        Error loading tasks: {error?.message}
                                    </TableCell>
                                </TableRow>
                            ) : filteredTasks.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No tasks found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredTasks.map((task) => (
                                    <TableRow key={task._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-center font-medium">{task.title}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{task.assignedTo.name}</TableCell>
                                        <TableCell className=" flex justify-center">
                                            <TaskBadge status={task.status} />
                                        </TableCell>
                                        <TableCell className="text-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditTask(task)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(task._id)}
                                                disabled={deleteMutation.isPending}
                                            >
                                                {deleteMutation.variables === task._id && deleteMutation.isPending ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Task</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
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
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Task Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <ClipboardList className="h-5 w-5" />
                            <span>{mode === 'edit' ? 'Edit' : 'Add'} Task</span>
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'edit' ? 'Update' : 'Create a new'} task and assign it to a team member.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                value={currentTask?.title || ''}
                                onChange={(e) => setCurrentTask({ ...currentTask, title: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="description" className="text-right pt-2">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={currentTask?.description || ''}
                                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                                className="col-span-3"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assignedTo" className="text-right">
                                Assigned To
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={currentTask?.assignedTo || ""}
                                    onValueChange={(value: string) =>
                                        setCurrentTask({ ...currentTask, assignedTo: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select assigned to" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((employee: Employee) => (
                                            <SelectItem key={employee._id} value={employee._id}>
                                                {employee.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <div className="col-span-3">
                                <Select
                                    value={currentTask?.status || TaskStatus.PENDING}
                                    onValueChange={(value: TaskStatus) =>
                                        setCurrentTask({ ...currentTask, status: value })}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                                        <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                                        <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveTask}
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                            {(createMutation.isPending || updateMutation.isPending) ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === 'edit' ? 'Updating...' : 'Creating...'}
                                </>
                            ) : mode === 'edit' ? 'Update Task' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
