import { create } from "zustand";
import { api } from "../utils";


interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
}

interface UserStore {
    user: User | null;
    isLoading: boolean;
    checkUserSession: () => Promise<boolean>;
    logout: () => void;
}

const useCurrentUser = create<UserStore>((set) => ({

    user: null,
    isLoading: false,

    checkUserSession: async () => {
        set({ isLoading: true })
        try {
            const response = await api.get('/auth/check-session')

            console.log(response.data)

            if (response.data.success) {
                set({ user: response.data.content })
            } else {
                set({ user: null })
            }

            return true;
        } catch {
            set({ user: null })
            return false;
        } finally {
            set({ isLoading: false })
        }
    },

    logout: () => {
        api.post('/auth/logout')
        set({ user: null })
    }
}))

export default useCurrentUser