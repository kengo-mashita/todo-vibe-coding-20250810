'use client'

import { LogOut, Search, Settings, User } from 'lucide-react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

import { TaskForm } from '@/components/task/task-form'
import { TaskItem } from '@/components/task/task-item'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/use-auth'
import { useTasks, type TaskStatus } from '@/hooks/use-tasks'

export default function DashboardPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<TaskStatus>('active')

  const {
    tasks,
    loading,
    hasMore,
    loadMore,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    restoreTask,
  } = useTasks(activeTab, searchQuery)

  const handleTabChange = (value: string) => {
    setActiveTab(value as TaskStatus)
    setSearchQuery('')
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'active':
        return searchQuery
          ? 'No active tasks match your search.'
          : 'No active tasks. Create your first task!'
      case 'completed':
        return searchQuery ? 'No completed tasks match your search.' : 'No completed tasks yet.'
      case 'deleted':
        return searchQuery ? 'No deleted tasks match your search.' : 'Trash is empty.'
      default:
        return 'No tasks found.'
    }
  }

  const getTabLabel = (status: TaskStatus) => {
    const counts = {
      active: tasks.filter((t) => !t.isCompleted && !t.deletedAt).length,
      completed: tasks.filter((t) => t.isCompleted && !t.deletedAt).length,
      deleted: tasks.filter((t) => t.deletedAt).length,
    }

    const labels = {
      active: 'Active',
      completed: 'Completed',
      deleted: 'Trash',
    }

    return `${labels[status]} (${counts[status] || 0})`
  }

  return (
    <div className="dashboard-container">
      <div className="glass-card border-0 border-b border-white/20 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Todo Vibe
              </h1>
              <p className="text-neutral-600 text-base sm:text-lg">
                Welcome back,{' '}
                <span className="font-medium text-neutral-800">{user?.name || user?.email}</span>
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="btn-ghost-modern flex items-center space-x-2 h-12"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:inline font-medium">{user?.name || 'Account'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card border-white/20">
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {activeTab === 'active' && (
          <div className="glass-card floating rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-0">
            <TaskForm onSubmit={createTask} />
          </div>
        )}

        <div className="glass-card rounded-2xl sm:rounded-3xl border-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b border-white/20 px-4 sm:px-6 pt-4 sm:pt-6">
              <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-transparent gap-1 p-1">
                <TabsTrigger
                  value="active"
                  className="tab-modern rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 hover-scale data-[state=active]:bg-white/20 data-[state=active]:text-indigo-600 data-[state=active]:scale-in data-[state=active]:shadow-md"
                >
                  <span className="hidden sm:inline">{getTabLabel('active')}</span>
                  <span className="sm:hidden">
                    Active ({tasks.filter((t) => !t.isCompleted && !t.deletedAt).length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="tab-modern rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 hover-scale data-[state=active]:bg-white/20 data-[state=active]:text-emerald-600 data-[state=active]:scale-in data-[state=active]:shadow-md"
                >
                  <span className="hidden sm:inline">{getTabLabel('completed')}</span>
                  <span className="sm:hidden">
                    Done ({tasks.filter((t) => t.isCompleted && !t.deletedAt).length})
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="deleted"
                  className="tab-modern rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all duration-300 hover-scale data-[state=active]:bg-white/20 data-[state=active]:text-neutral-600 data-[state=active]:scale-in data-[state=active]:shadow-md"
                >
                  <span className="hidden sm:inline">{getTabLabel('deleted')}</span>
                  <span className="sm:hidden">
                    Trash ({tasks.filter((t) => t.deletedAt).length})
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <div className="relative group">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-neutral-400 transition-colors duration-200 group-focus-within:text-indigo-500" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    className="input-modern focus-ring h-12 sm:h-14 pl-10 sm:pl-12 text-base hover:shadow-md transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200 hover-scale"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <TabsContent value="active" className="mt-0">
                <div className="space-y-3">
                  {loading && tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-indigo-300/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-neutral-500 mt-3">Loading tasks...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-indigo-400" />
                      </div>
                      <p className="text-neutral-600 text-lg">{getEmptyMessage()}</p>
                    </div>
                  ) : (
                    <>
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                        />
                      ))}
                      {hasMore && (
                        <div className="text-center pt-6">
                          <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                            className="btn-ghost-modern"
                          >
                            {loading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-indigo-300/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="mt-0">
                <div className="space-y-3">
                  {loading && tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-emerald-300/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-neutral-500 mt-3">Loading completed tasks...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-emerald-400" />
                      </div>
                      <p className="text-neutral-600 text-lg">{getEmptyMessage()}</p>
                    </div>
                  ) : (
                    <>
                      {tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={toggleTask}
                          onUpdate={updateTask}
                          onDelete={deleteTask}
                        />
                      ))}
                      {hasMore && (
                        <div className="text-center pt-6">
                          <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                            className="btn-ghost-modern"
                          >
                            {loading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-emerald-300/30 border-t-emerald-500 rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="deleted" className="mt-0">
                <div className="space-y-3">
                  {loading && tasks.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-3 border-neutral-300/30 border-t-neutral-500 rounded-full animate-spin mx-auto"></div>
                      <p className="text-neutral-500 mt-3">Loading deleted tasks...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-br from-neutral-100 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-neutral-400" />
                      </div>
                      <p className="text-neutral-600 text-lg">{getEmptyMessage()}</p>
                    </div>
                  ) : (
                    <>
                      {tasks.map((task) => (
                        <TaskItem key={task.id} task={task} onRestore={restoreTask} />
                      ))}
                      {hasMore && (
                        <div className="text-center pt-6">
                          <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                            className="btn-ghost-modern"
                          >
                            {loading ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-neutral-300/30 border-t-neutral-500 rounded-full animate-spin"></div>
                                <span>Loading...</span>
                              </div>
                            ) : (
                              'Load More'
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
