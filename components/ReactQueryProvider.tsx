"use client"
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";
import { queryClient } from "@/lib/react-query";
import useCurrentUser from "@/lib/store/user.store";

interface ReactQueryProviderProps {
    children: ReactNode;
}


const Loader = () => {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-gray-900"></div>
        </div>
    )
}


const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {

    const { checkUserSession, isLoading } = useCurrentUser()

    useEffect(() => {
        checkUserSession()
    }, [])

    return (
        <QueryClientProvider client={queryClient}>
            {isLoading ? <Loader /> : children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;