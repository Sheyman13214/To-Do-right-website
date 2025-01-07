import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Eye, Edit2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Task {
  id: number
  title: string
  items: string[]
  description: string
}

interface TaskDetailsProps {
  tasks: Task[]
  updateTaskDescription: (taskId: number, description: string) => void
}

export default function TaskDetails({ tasks, updateTaskDescription }: TaskDetailsProps) {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === Number(taskId))
    if (foundTask) {
      setTask(foundTask)
      setDescription(foundTask.description)
    }
  }, [taskId, tasks])

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value
    if (countWords(newDescription) <= 250) {
      setDescription(newDescription)
      if (task) {
        updateTaskDescription(task.id, newDescription)
      }
    }
  }

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word !== '').length
  }

  const togglePreview = () => {
    setIsPreview(!isPreview)
  }

  if (!task) {
    return <div>Task not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Button onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tasks
      </Button>
      <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Task Items:</h2>
        <ul className="list-disc pl-5">
          {task.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Task Description:</h2>
          <Button onClick={togglePreview} variant="outline" size="sm">
            {isPreview ? <Edit2 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {isPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
        {isPreview ? (
          <div className="border rounded p-4 min-h-[150px] prose">
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>
        ) : (
          <>
            <Textarea
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Write about your task (up to 250 words)"
              rows={6}
              className="w-full p-2 border rounded"
            />
            <div className="text-sm text-gray-500 mt-2">
              Words: {countWords(description)} / 250
            </div>
          </>
        )}
      </div>
    </div>
  )
}
