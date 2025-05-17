
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Board from './components/Board'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [tasks, setTasks] = useState([])
  const fetchTasks = async () => {
    const { data } = await axios.get(`${API_URL}/tasks`)
    setTasks(data)
  }

  useEffect(() => { fetchTasks() }, [])

  const handleUpdate = async (updated) => {
    // optimistic update
    setTasks(updated)
    await axios.post(`${API_URL}/tasks/bulk`, updated).catch(console.error)
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Task Board</h1>
      <Board tasks={tasks} setTasks={setTasks} />
    </div>
  )
}
