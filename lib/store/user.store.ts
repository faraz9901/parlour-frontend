import { create } from "zustand";
import { api } from "../utils";
import { Role } from "../enums";


export interface User {
    _id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
}

interface UserStore {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    checkUserSession: () => Promise<boolean>;
    logout: () => void;
}

const useCurrentUser = create<UserStore>((set) => ({

    user: null,
    isLoading: false,
    isSignedIn: typeof localStorage !== 'undefined' ? Boolean(localStorage.getItem("isSignedIn")) : false,

    checkUserSession: async () => {
        set({ isLoading: true })
        try {
            const response = await api.get('/auth/check-session')
            if (response.data.success) {
                set({ user: response.data.content, isSignedIn: true })
                localStorage.setItem("isSignedIn", "true")
            } else {
                set({ user: null, isSignedIn: false })
                throw new Error("You are not signed in")
            }

            return true;
        } catch {
            set({ user: null, isSignedIn: false })
            localStorage.removeItem("isSignedIn")
            return false;
        } finally {
            set({ isLoading: false })
        }
    },

    logout: async () => {
        await api.post('/auth/logout')
        localStorage.removeItem("isSignedIn")
        set({ user: null, isSignedIn: false })
    }
}))

export default useCurrentUser