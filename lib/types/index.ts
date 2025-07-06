import { Role, TaskStatus } from "../enums"

export interface Employee {
    _id: string
    name: string
    email: string
    password: string
    role: Role
    createdAt?: string
    updatedAt?: string
}

interface BaseTask {
    _id: string
    title: string
    description: string
    assignedTo: string | User
    status: TaskStatus
    createdAt?: string
    updatedAt?: string
}

export interface TaskWithUser extends BaseTask {
    assignedTo: User
}

export interface Task extends BaseTask {
    assignedTo: string
}

export interface User {
    _id: string
    name: string
    email: string
    role: Role
}

export interface AttendanceLog {
    _id: string
    employee: string | User
    checkIn: string
    checkOut: string
    createdAt: string
    updatedAt: string
}

export interface AttendanceLogWithUser extends AttendanceLog {
    employee: User
}

export interface AttendanceLogCreate {
    employee: string
    checkIn: string
    checkOut: string
}
