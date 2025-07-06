import React from 'react'
import { Badge } from './ui/badge'

function AttendanceBadge({ checkedOut, checkIn }: { checkedOut: boolean, checkIn: boolean }) {
    return (
        <Badge className={checkedOut ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : checkIn ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"}>
            {checkedOut ? 'Checked Out' : checkIn ? 'Checked In' : 'Not checked in'}
        </Badge>
    )
}

export default AttendanceBadge