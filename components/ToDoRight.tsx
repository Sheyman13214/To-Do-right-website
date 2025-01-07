"use client"

import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import styles from './ToDoRight.module.css'
import Auth from './Auth'
import LandingPage from './LandingPage'
import TaskDetails from './TaskDetails'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface User {
  name: string
  phone: string
}

interface Task {
  id: number
  title: string
  items: string[]
  description: string
  createdAt: Date
}

export default function ToDoRight() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [user, setUser] = useState<User | null>(null)
  const [showLanding, setShowLanding] = useState(true)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    renderCalendar()
  }, [currentDate, tasks])

  const addTask = () => {
    const newTask: Task = {
      id: Date.now(),
      title: 'New Task',
      items: [],
      description: '',
      createdAt: new Date()
    }
    setTasks([...tasks, newTask])
    setCurrentTaskId(newTask.id)
  }

  const addItemToTask = (taskId: number, item: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, items: [...task.items, item] }
        : task
    ))
    setInputValue('')
  }

  const updateTaskDescription = (taskId: number, description: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, description }
        : task
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && currentTaskId !== null) {
      addItemToTask(currentTaskId, inputValue)
    }
  }

  const handleVoiceInput = () => {
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'en-US'

    recognition.start()

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      setInputValue(text)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const calendarDays = []

    for (let i = 0; i < firstDay.getDay(); i++) {
      calendarDays.push(<div key={`empty-${i}`} className={styles.calendarDay}></div>)
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const tasksForDay = tasks.filter(task => 
        task.createdAt.getDate() === day &&
        task.createdAt.getMonth() === month &&
        task.createdAt.getFullYear() === year
      )
      
      calendarDays.push(
        <div 
          key={day} 
          className={`${styles.calendarDay} ${selectedDate && selectedDate.getTime() === date.getTime() ? styles.selected : ''}`}
          onClick={() => toggleActiveDay(date)}
        >
          {day}
          {tasksForDay.length > 0 && <div className={styles.taskIndicator}>{tasksForDay.length}</div>}
        </div>
      )
    }

    return calendarDays
  }

  const toggleActiveDay = (date: Date) => {
    setSelectedDate(date)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleAuthentication = (authenticatedUser: { name: string; phone: string; password: string }) => {
    setUser({ name: authenticatedUser.name, phone: authenticatedUser.phone })
  }

  const handleSignOut = () => {
    setUser(null)
    setTasks([])
    setShowLanding(true)
  }

  const handleForgotPassword = (phone: string) => {
    // In a real application, you would implement password reset logic here
    console.log(`Password reset requested for phone number: ${phone}`)
    alert('Password reset instructions have been sent to your phone.')
  }

  const renderTasks = () => {
    const filteredTasks = selectedDate
      ? tasks.filter(task => 
          task.createdAt.getDate() === selectedDate.getDate() &&
          task.createdAt.getMonth() === selectedDate.getMonth() &&
          task.createdAt.getFullYear() === selectedDate.getFullYear()
        )
      : tasks

    return filteredTasks.map(task => (
      <div key={task.id} className={styles.taskContainer}>
        <h3 onClick={() => setCurrentTaskId(task.id === currentTaskId ? null : task.id)}>
          {task.title}
          {currentTaskId === task.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </h3>
        <div className={styles.taskTimestamp}>
          Created on: {task.createdAt.toLocaleString()}
        </div>
        {currentTaskId === task.id && (
          <>
            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new item"
                required
              />
              <Button type="submit">Add Item</Button>
            </form>
            <Button onClick={handleVoiceInput} variant="outline">Voice Input</Button>
            <ul>
              {task.items.map((item, index) => (
                <li key={index}>
                  {item}
                  <Button 
                    onClick={() => {
                      const updatedItems = task.items.filter((_, i) => i !== index)
                      setTasks(tasks.map(t => 
                        t.id === task.id ? { ...t, items: updatedItems } : t
                      ))
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                  <Button
                    onClick={() => setEditingTaskId(task.id)}
                    variant="outline"
                    size="sm"
                  >
                    OPEN
                  </Button>
                </li>
              ))}
            </ul>
            <Link to={`/task/${task.id}`}>
              <Button variant="link">View Details</Button>
            </Link>
          </>
        )}
        {editingTaskId === task.id && (
          <div className={styles.descriptionEditor}>
            <h4>Task Description:</h4>
            <textarea
              value={task.description}
              onChange={(e) => {
                const updatedTasks = tasks.map(t =>
                  t.id === task.id ? { ...t, description: e.target.value } : t
                )
                setTasks(updatedTasks)
              }}
              rows={5}
              className={styles.descriptionTextarea}
            />
            <Button
              onClick={() => {
                updateTaskDescription(task.id, task.description)
                setEditingTaskId(null)
              }}
            >
              SAVE
            </Button>
          </div>
        )}
      </div>
    ))
  }

  if (showLanding) {
    return <LandingPage onNext={() => setShowLanding(false)} />
  }

  if (!user) {
    return <Auth onAuthenticate={handleAuthentication} onForgotPassword={handleForgotPassword} />
  }

  return (
    <Router>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#4A90E2" />
              <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1>To-Do Right</h1>
          </div>
          <div className={styles.userInfo}>
            Welcome, {user.name}!
            <Button onClick={handleSignOut} variant="secondary" size="sm">
              Sign Out
            </Button>
          </div>
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={
              <>
                <section className={styles.todoSection}>
                  <h2>Tasks {selectedDate && `for ${selectedDate.toLocaleDateString()}`}</h2>
                  <div className={styles.addTaskContainer} onClick={addTask}>
                    <Plus size={24} />
                    <span>Add your task here</span>
                  </div>
                  {renderTasks()}
                </section>
                <section className={styles.calendarSection}>
                  <h2>Calendar</h2>
                  <div className={styles.calendar}>
                    <div className={styles.calendarHeader}>
                      <Button onClick={prevMonth}>&lt;</Button>
                      <h3>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                      <Button onClick={nextMonth}>&gt;</Button>
                    </div>
                    <div className={styles.calendarBody}>{renderCalendar()}</div>
                  </div>
                </section>
              </>
            } />
            <Route 
              path="/task/:taskId" 
              element={<TaskDetails tasks={tasks} updateTaskDescription={updateTaskDescription} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
