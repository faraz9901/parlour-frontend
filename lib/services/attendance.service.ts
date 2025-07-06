import { api } from "../utils"

// API Service
const API_BASE_URL = '/attendance'

class AttendanceService {

    async getAll() {
        const response = await api.get(API_BASE_URL)
        if (!response.data.success) {
            throw new Error('Failed to fetch attendance')
        }
        return response.data.content
    }

    async checkIn() {
        const response = await api.post(`${API_BASE_URL}/check-in`)
        if (!response.data.success) {
            throw new Error('Failed to check in')
        }
        return response.data.content
    }

    async checkOut() {
        const response = await api.post(`${API_BASE_URL}/check-out`)
        if (!response.data.success) {
            throw new Error('Failed to check out')
        }
        return response.data.content
    }

    async delete(id: string) {
        const response = await api.delete(`${API_BASE_URL}/delete/${id}`)
        if (!response.data.success) {
            throw new Error('Failed to delete attendance record')
        }
        return id
    }

    async getEmployeeLogs() {
        const response = await api.get(`${API_BASE_URL}/employee`)
        if (!response.data.success) {
            throw new Error('Failed to fetch attendance')
        }
        return response.data.content
    }
}

const attendanceService = new AttendanceService()

export default attendanceService