'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Task } from '@/db/schema'
import { cn } from '@/lib/utils'

interface TaskFormProps {
  onSubmit: (title: string) => Promise<Task>
  placeholder?: string
  className?: string
}

export function TaskForm({
  onSubmit,
  placeholder = 'Add a new task...',
  className,
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(title.trim())
      setTitle('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 fade-in',
        className,
      )}
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        disabled={isSubmitting}
        className="input-modern focus-ring flex-1 h-12 sm:h-14 text-base transition-all duration-300"
        maxLength={100}
      />
      <Button
        type="submit"
        disabled={!title.trim() || isSubmitting}
        className={cn(
          'btn-primary-modern h-12 sm:h-14 px-6 sm:shrink-0 hover-lift focus-ring transition-all duration-300',
          !title.trim() && 'opacity-50 cursor-not-allowed',
          isSubmitting && 'pulse-ring',
        )}
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        ) : (
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Plus
              className={cn(
                'h-5 w-5 transition-transform duration-200',
                title.trim() && 'sm:hover:rotate-90',
              )}
            />
            <span>Add Task</span>
          </div>
        )}
      </Button>
    </form>
  )
}
