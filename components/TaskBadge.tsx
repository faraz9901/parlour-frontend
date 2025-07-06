import { TaskStatus } from '@/lib/enums'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'

function TaskBadge({ status }: { status: TaskStatus }) {

    switch (status) {
        case TaskStatus.COMPLETED:
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Completed
            </Badge>
        case TaskStatus.IN_PROGRESS:
            return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                In Progress
            </Badge>
        default:
            return <Badge variant="outline" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Pending
            </Badge>
    }
}

export default TaskBadge