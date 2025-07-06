"use client"
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { queryClient } from "@/lib/react-query";

interface ReactQueryProviderProps {
    children: ReactNode;
}

const ReactQueryProvider = ({ children }: ReactQueryProviderProps) => {

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;