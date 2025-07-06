import { Task } from "../types"
import { api } from "../utils"

const API_BASE_URL = '/tasks'

class TaskService {
    async getEmployeeTasks() {
        const response = await api.get(`${API_BASE_URL}/employee`)
        if (!response.data.success) {
            throw new Error('Failed to fetch employee tasks')
        }
        return response.data.content
    }

    async getAll() {
        const response = await api.get(API_BASE_URL)
        if (!response.data.success) {
            throw new Error('Failed to fetch tasks')
        }
        return response.data.content
    }

    async create(task: Omit<Task, '_id'>) {
        const response = await api.post(`${API_BASE_URL}/create`, task)
        if (!response.data.success) {
            throw new Error('Failed to create task')
        }
        return response.data.content
    }

    async update(task: Task) {
        const response = await api.put(`${API_BASE_URL}/update/${task._id}`, task)
        if (!response.data.success) {
            throw new Error('Failed to update task')
        }
        return response.data.content
    }

    async delete(id: string) {
        const response = await api.delete(`${API_BASE_URL}/delete/${id}`)
        if (!response.data.success) {
            throw new Error('Failed to delete task')
        }
        return id
    }
}

const taskService = new TaskService()

export default taskService
