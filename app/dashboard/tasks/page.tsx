"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Pencil, Trash2, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case TaskStatus.COMPLETED:
                return <Badge className="bg-green-500">Completed</Badge>
            case TaskStatus.IN_PROGRESS:
                return <Badge className="bg-blue-500">In Progress</Badge>
            default:
                return <Badge variant="outline">Pending</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                <Button onClick={handleAddTask}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search tasks..."
                        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
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
                                <TableRow key={task._id}>
                                    <TableCell className="font-medium">{task.title}</TableCell>
                                    <TableCell>{task.assignedTo.name}</TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell className="text-right space-x-1">
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
                        <DialogTitle>{mode === 'edit' ? 'Edit' : 'Add'} Task</DialogTitle>
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
