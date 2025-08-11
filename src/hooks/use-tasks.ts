import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import type { Task } from '@/db/schema'

export type TaskStatus = 'active' | 'completed' | 'deleted'

interface TasksResponse {
  tasks: Task[]
  nextCursor: string | null
  hasMore: boolean
}

export function useTasks(status: TaskStatus = 'active', searchQuery: string = '') {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)

  const fetchTasks = useCallback(
    async (cursor?: string, append = false) => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          status,
          ...(searchQuery && { q: searchQuery }),
          ...(cursor && { cursor }),
        })

        const response = await fetch(`/api/tasks?${params}`)
        if (!response.ok) {
          throw new Error('Failed to fetch tasks')
        }

        const data: TasksResponse = await response.json()

        if (append) {
          setTasks((prev) => [...prev, ...data.tasks])
        } else {
          setTasks(data.tasks)
        }

        setHasMore(data.hasMore)
        setNextCursor(data.nextCursor)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    },
    [status, searchQuery],
  )

  const loadMore = () => {
    if (nextCursor && !loading) {
      fetchTasks(nextCursor, true)
    }
  }

  const createTask = async (title: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to create task')
      }

      const newTask: Task = await response.json()

      if (status === 'active') {
        setTasks((prev) => [newTask, ...prev])
      }

      toast.success('Task created successfully')
      return newTask
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      toast.error(message)
      throw err
    }
  }

  const updateTask = async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updatedTask: Task = await response.json()
      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      toast.success('Task updated successfully')
      return updatedTask
    } catch (err) {
      toast.error('Failed to update task')
      throw err
    }
  }

  const toggleTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}/toggle`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle task')
      }

      const updatedTask: Task = await response.json()

      if (status === 'active' && updatedTask.isCompleted) {
        setTasks((prev) => prev.filter((task) => task.id !== id))
      } else if (status === 'completed' && !updatedTask.isCompleted) {
        setTasks((prev) => prev.filter((task) => task.id !== id))
      } else {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      }

      toast.success(`Task ${updatedTask.isCompleted ? 'completed' : 'activated'}`)
      return updatedTask
    } catch (err) {
      toast.error('Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast.success('Task moved to trash')
    } catch (err) {
      toast.error('Failed to delete task')
      throw err
    }
  }

  const restoreTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}/restore`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to restore task')
      }

      const restoredTask: Task = await response.json()
      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast.success('Task restored successfully')
      return restoredTask
    } catch (err) {
      toast.error('Failed to restore task')
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchTasks(),
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    restoreTask,
  }
}
