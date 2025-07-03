"use client"

import { useState } from "react"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
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

type Task = {
    id: string
    title: string
    description: string
    assignedTo: string
    dueDate: string
    status: 'pending' | 'in_progress' | 'completed'
    priority: 'low' | 'medium' | 'high'
}

export default function TasksPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [tasks, setTasks] = useState<Task[]>([
        {
            id: "1",
            title: "Complete client consultation forms",
            description: "Fill out all consultation forms for tomorrow's appointments.",
            assignedTo: "John Doe",
            dueDate: "2025-07-05",
            status: "pending",
            priority: "high"
        },
        {
            id: "2",
            title: "Restock inventory",
            description: "Order new hair color and styling products.",
            assignedTo: "Jane Smith",
            dueDate: "2025-07-10",
            status: "in_progress",
            priority: "medium"
        }
    ])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null)

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddTask = () => {
        setCurrentTask({
            id: Date.now().toString(),
            title: "",
            description: "",
            assignedTo: "",
            dueDate: format(new Date(), 'yyyy-MM-dd'),
            status: "pending",
            priority: "medium"
        })
        setIsDialogOpen(true)
    }

    const handleEditTask = (task: Task) => {
        setCurrentTask({ ...task })
        setIsDialogOpen(true)
    }

    const handleDeleteTask = (id: string) => {
        if (confirm("Are you sure you want to delete this task?")) {
            setTasks(tasks.filter(task => task.id !== id))
        }
    }

    const handleSaveTask = () => {
        if (!currentTask) return

        if (currentTask.id && tasks.some(task => task.id === currentTask.id)) {
            // Update existing task
            setTasks(tasks.map(task =>
                task.id === currentTask.id ? currentTask as Task : task
            ))
        } else {
            // Add new task
            setTasks([...tasks, currentTask as Task])
        }

        setIsDialogOpen(false)
        setCurrentTask(null)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500">Completed</Badge>
            case 'in_progress':
                return <Badge className="bg-blue-500">In Progress</Badge>
            default:
                return <Badge variant="outline">Pending</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge variant="destructive">High</Badge>
            case 'medium':
                return <Badge className="bg-yellow-500">Medium</Badge>
            default:
                return <Badge>Low</Badge>
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
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell className="font-medium">{task.title}</TableCell>
                                <TableCell>{task.assignedTo}</TableCell>
                                <TableCell>{format(new Date(task.dueDate), 'MMM dd, yyyy')}</TableCell>
                                <TableCell>{getStatusBadge(task.status)}</TableCell>
                                <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditTask(task)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteTask(task.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{currentTask?.id ? 'Edit' : 'Add'} Task</DialogTitle>
                        <DialogDescription>
                            {currentTask?.id ? 'Update' : 'Create a new'} task and assign it to a team member.
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
                            <Input
                                id="assignedTo"
                                value={currentTask?.assignedTo || ''}
                                onChange={(e) => setCurrentTask({ ...currentTask, assignedTo: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">
                                Due Date
                            </Label>
                            <Input
                                id="dueDate"
                                type="date"
                                value={currentTask?.dueDate || ''}
                                onChange={(e) => setCurrentTask({ ...currentTask, dueDate: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Status
                            </Label>
                            <Select
                                value={currentTask?.status || 'pending'}
                                onValueChange={(value: 'pending' | 'in_progress' | 'completed') =>
                                    setCurrentTask({ ...currentTask, status: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="priority" className="text-right">
                                Priority
                            </Label>
                            <Select
                                value={currentTask?.priority || 'medium'}
                                onValueChange={(value: 'low' | 'medium' | 'high') =>
                                    setCurrentTask({ ...currentTask, priority: value })}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSaveTask}>
                            {currentTask?.id ? 'Update' : 'Create'} Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
