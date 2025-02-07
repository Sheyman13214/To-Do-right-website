"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom"
import styles from "./ToDoRight.module.css"
import Auth from "./Auth"
import LandingPage from "./LandingPage"
import TaskDetails from "./TaskDetails"
import { Plus, ChevronDown, ChevronUp, Mic, Eye, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

const ToDoRight: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [user, setUser] = useState<User | null>(null)
  const [showLanding, setShowLanding] = useState(true)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const port = 3003
  const baseUrl = `http://localhost:${port}`

  useEffect(() => {
    renderCalendar()
  }, [currentDate, tasks])

  const addTask = () => {
    const newTask: Task = {
      id: Date.now(),
      title: "New Task",
      items: [],
      description: "",
      createdAt: new Date(),
    }
    setTasks([...tasks, newTask])
    setCurrentTaskId(newTask.id)
  }

  const addItemToTask = (taskId: number, item: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, items: [...task.items, item] } : task)))
    setInputValue("")
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    if (currentTaskId === taskId) {
      setCurrentTaskId(null)
    }
    if (editingTaskId === taskId) {
      setEditingTaskId(null)
    }
  }

  const updateTaskDescription = (taskId: number, description: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, description } : task)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && currentTaskId !== null) {
      addItemToTask(currentTaskId, inputValue)
    }
  }

  const handleVoiceInput = (targetField: "item" | "description") => {
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = "en-US"

    recognition.start()

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      if (targetField === "item") {
        setInputValue(text)
      } else if (targetField === "description" && editingTaskId !== null) {
        updateTaskDescription(editingTaskId, text)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
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
      const tasksForDay = tasks.filter(
        (task) =>
          task.createdAt.getDate() === day &&
          task.createdAt.getMonth() === month &&
          task.createdAt.getFullYear() === year,
      )

      calendarDays.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${selectedDate && selectedDate.getTime() === date.getTime() ? styles.selected : ""}`}
          onClick={() => toggleActiveDay(date)}
        >
          {day}
          {tasksForDay.length > 0 && <div className={styles.taskIndicator}>{tasksForDay.length}</div>}
        </div>,
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
    console.log(`Password reset requested for phone number: ${phone}`)
    alert("Password reset instructions have been sent to your phone.")
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length
  }

  const renderTasks = () => {
    const filteredTasks = selectedDate
      ? tasks.filter(
          (task) =>
            task.createdAt.getDate() === selectedDate.getDate() &&
            task.createdAt.getMonth() === selectedDate.getMonth() &&
            task.createdAt.getFullYear() === selectedDate.getFullYear(),
        )
      : tasks

    return filteredTasks.map((task) => (
      <div key={task.id} className={styles.taskContainer}>
        <h3 onClick={() => setCurrentTaskId(task.id === currentTaskId ? null : task.id)}>
          {task.title}
          {currentTaskId === task.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </h3>
        <div className={styles.taskTimestamp}>Created on: {task.createdAt.toLocaleString()}</div>
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
            <Button onClick={() => handleVoiceInput("item")} variant="outline">
              <Mic size={16} className="mr-2" />
              Voice Input
            </Button>
            <ul>
              {task.items.map((item, index) => (
                <li key={index}>
                  {item}
                  <Button
                    onClick={() => {
                      const updatedItems = task.items.filter((_, i) => i !== index)
                      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, items: updatedItems } : t)))
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
            <div className={styles.taskActions}>
              <Link to={`/task/${task.id}`}>
                <Button variant="outline" size="sm">
                  <Eye size={16} className="mr-2" />
                  View Details
                </Button>
              </Link>
              <Button onClick={() => deleteTask(task.id)} variant="destructive" size="sm">
                <Trash2 size={16} className="mr-2" />
                Delete Task
              </Button>
            </div>
          </>
        )}
        {editingTaskId === task.id && (
          <div className={styles.descriptionEditor}>
            <h4>Task Description:</h4>
            <Textarea
              value={task.description}
              onChange={(e) => {
                const updatedTasks = tasks.map((t) => (t.id === task.id ? { ...t, description: e.target.value } : t))
                setTasks(updatedTasks)
              }}
              rows={5}
              className={styles.descriptionTextarea}
              placeholder="Write about your task (up to 400 words)"
            />
            <div className={styles.descriptionActions}>
              <Button onClick={() => handleVoiceInput("description")} variant="outline" size="sm">
                <Mic size={16} className="mr-2" />
                Voice Input
              </Button>
              <Button
                onClick={() => {
                  updateTaskDescription(task.id, task.description)
                  setEditingTaskId(null)
                }}
                variant="primary"
                size="sm"
              >
                <Save size={16} className="mr-2" />
                Save
              </Button>
            </div>
          </div>
        )}
      </div>
    ))
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/tasks`)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

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
              <path
                d="M30 50L45 65L70 35"
                stroke="white"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
            <Route
              path="/"
              element={
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
                        <h3>{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
                        <Button onClick={nextMonth}>&gt;</Button>
                      </div>
                      <div className={styles.calendarBody}>{renderCalendar()}</div>
                    </div>
                  </section>
                </>
              }
            />
            <Route
              path="/task/:taskId"
              element={<TaskDetails tasks={tasks} updateTaskDescription={updateTaskDescription} />}
            />
          </Routes>
        </main>
        <footer className={styles.footer}>
          <h4>ABOUT APP</h4>
          <p>App created by OLOWOMATIRE OLUWASEYIFUNMI OWOLABI</p>
          <p>App created for ALX final specialization project</p>
          <p>Created on: January 7, 2025</p>
          <p>Running on: {baseUrl}</p>
          <p>You can also try: http://127.0.0.1:{port}</p>
          <p>Server port: {port}</p>
        </footer>
      </div>
    </Router>
  )
}

export default ToDoRight
