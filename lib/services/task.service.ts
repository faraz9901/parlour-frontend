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
}

const taskService = new TaskService()

export default taskService
