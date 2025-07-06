import { Employee } from "../types";
import { api } from "../utils";

class UserService {
    async getAll() {
        const response = await api.get('/users')

        if (!response.data.success) {
            throw new Error('Failed to fetch users')
        }

        return response.data.content
    }

    async create(user: Employee) {
        const response = await api.post('/users/create', user)

        if (!response.data.success) {
            throw new Error('Failed to create user')
        }

        return response.data.content
    }

    async update({ id, user }: { id: string, user: Employee }) {
        const response = await api.put(`/users/update/${id}`, user)

        if (!response.data.success) {
            throw new Error('Failed to update user')
        }

        return response.data.content
    }

    async delete(id: string) {
        const response = await api.delete(`/users/delete/${id}`)

        if (!response.data.success) {
            throw new Error('Failed to delete user')
        }

        return id
    }

    async getOne(id: string) {
        const response = await api.get(`/users/get/${id}`)

        if (!response.data.success) {
            throw new Error('Failed to fetch user')
        }

        return response.data.content
    }
}

const userService = new UserService();

export default userService;
