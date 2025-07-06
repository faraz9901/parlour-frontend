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

    async checkIn(employeeId: string) {
        const response = await api.post(`${API_BASE_URL}/check-in`, { employeeId })
        if (!response.data.success) {
            throw new Error('Failed to check in')
        }
        return response.data.content
    }

    async checkOut(employeeId: string) {
        const response = await api.post(`${API_BASE_URL}/check-out`, { employeeId })
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
}

const attendanceService = new AttendanceService()

export default attendanceService