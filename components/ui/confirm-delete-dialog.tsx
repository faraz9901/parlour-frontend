"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ConfirmDeleteDialogProps {
    isOpen: boolean
    onClose: () => void
    onDelete: () => void
    isLoading?: boolean
    title?: string
    description?: string
    itemToDelete?: string
}

export function ConfirmDeleteDialog({
    isOpen,
    onClose,
    onDelete,
    isLoading = false,
    title = "Confirm Delete",
    description = "Are you sure you want to delete this item? This action cannot be undone.",
    itemToDelete = "this item",
}: ConfirmDeleteDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-between">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Delete {itemToDelete}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
