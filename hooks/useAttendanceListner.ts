import { queryClient } from '@/lib/react-query';
import { useEffect } from 'react';
import io from 'socket.io-client';

export default function useAttendanceListner() {

    useEffect(() => {
        const link = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '');

        if (!link) {
            console.warn('NEXT_PUBLIC_API_URL is not defined');
            return;
        }

        const socketIo = io(link, {
            withCredentials: true,
            transports: ['websocket']
        });

        socketIo.on("attendance-update", () => {
            queryClient.invalidateQueries({ queryKey: ['employees-logs'] })
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
        });

        return () => {
            socketIo.disconnect();
        }
    }, []);
}
