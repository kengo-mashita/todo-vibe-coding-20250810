'use client'

import { Check, Edit2, MoreHorizontal, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Task } from '@/db/schema'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggle?: (id: string) => Promise<Task>
  onUpdate?: (id: string, title: string) => Promise<Task>
  onDelete?: (id: string) => Promise<void>
  onRestore?: (id: string) => Promise<Task>
}

export function TaskItem({ task, onToggle, onUpdate, onDelete, onRestore }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isLoading, setIsLoading] = useState(false)

  const isDeleted = !!task.deletedAt
  const canToggle = !isDeleted && onToggle
  const canEdit = !isDeleted && onUpdate
  const canDelete = !isDeleted && onDelete
  const canRestore = isDeleted && onRestore

  const handleToggle = async () => {
    if (!canToggle || isLoading) return
    setIsLoading(true)
    try {
      await onToggle(task.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!canEdit || !editTitle.trim() || isLoading) return
    setIsLoading(true)
    try {
      await onUpdate(task.id, editTitle.trim())
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditTitle(task.title)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!canDelete || isLoading) return
    setIsLoading(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!canRestore || isLoading) return
    setIsLoading(true)
    try {
      await onRestore(task.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div
      className={cn(
        'task-card-modern group flex items-center space-x-3 sm:space-x-4 slide-in hover-lift',
        task.isCompleted && !isDeleted && 'completed',
        isDeleted && 'deleted',
        isLoading && 'animate-pulse',
      )}
    >
      {canToggle && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 w-8 rounded-full p-0 shrink-0 transition-all duration-300 hover-scale focus-ring',
            task.isCompleted
              ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg bounce-in hover-glow'
              : 'border-2 border-neutral-300 hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-md',
            isLoading && 'pulse-ring',
          )}
          onClick={handleToggle}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            task.isCompleted && <Check className="h-4 w-4 bounce-in" />
          )}
        </Button>
      )}

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="input-modern focus-ring h-10 text-base scale-in"
            autoFocus
            disabled={isLoading}
            maxLength={100}
          />
        ) : (
          <div className="space-y-1">
            <p
              className={cn(
                'text-base font-medium cursor-pointer transition-all duration-300',
                task.isCompleted && !isDeleted && 'line-through text-neutral-500',
                isDeleted && 'text-neutral-400',
                !task.isCompleted &&
                  !isDeleted &&
                  'text-neutral-800 hover:text-indigo-600 hover:translate-x-1',
                canEdit &&
                  'hover:bg-white/50 hover:px-2 hover:py-1 hover:rounded-md hover:-mx-2 hover:-my-1',
              )}
              onClick={() => canEdit && setIsEditing(true)}
            >
              {task.title}
            </p>
            <p className="text-sm text-neutral-500 fade-in">
              {isDeleted
                ? `Deleted ${new Date(task.deletedAt!).toLocaleDateString()}`
                : task.updatedAt !== task.createdAt
                  ? `Updated ${new Date(task.updatedAt).toLocaleDateString()}`
                  : `Created ${new Date(task.createdAt).toLocaleDateString()}`}
            </p>
          </div>
        )}
      </div>

      <div className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 sm:group-hover:translate-x-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 sm:h-9 w-8 sm:w-9 p-0 rounded-xl hover:bg-white/50 hover-scale focus-ring transition-all duration-200"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card border-white/20 scale-in">
            {canEdit && (
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 hover:bg-white/20 transition-colors duration-200"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
            )}
            {canRestore && (
              <DropdownMenuItem
                onClick={handleRestore}
                className="flex items-center space-x-2 hover:bg-white/20 transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restore</span>
              </DropdownMenuItem>
            )}
            {canDelete && (
              <>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600 flex items-center space-x-2 hover:bg-red-50/50 transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4 wiggle" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
