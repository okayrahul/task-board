
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Board from './components/Board'
import Dashboard from './components/Dashboard'
import TaskFilter from './components/TaskFilter'
import { useTheme } from './context/ThemeContext'
import { FaPlus, FaTasks, FaChartBar, FaSun, FaMoon } from 'react-icons/fa'

const API_URL = 'http://localhost:8000'

export default function App() {
  const { theme, toggleTheme } = useTheme()
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    status: 'todo', 
    priority: 'medium',
    due_date: '',
    tags: []
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('board') // 'board' or 'dashboard'
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })
  const [tagInput, setTagInput] = useState('')
  
  const fetchTasks = async () => {
    setLoading(true)
    try {
      // Build query parameters for filtering
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      
      const { data } = await axios.get(`${API_URL}/tasks?${params.toString()}`)
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [])

  // Listen for task update and delete events
  useEffect(() => {
    const handleTaskUpdated = (event) => {
      // Check if we have the detail data in the event
      if (event && event.detail && event.detail.taskId) {
        console.log(`Task updated: ${event.detail.taskId}`);
      }
      fetchTasks();
    };
    
    const handleTaskDeleted = (event) => {
      // Check if we have the detail data in the event
      if (event && event.detail && event.detail.taskId) {
        console.log(`Task deleted: ${event.detail.taskId}`);
        // You could also do an optimistic delete here
        // setTasks(tasks => tasks.filter(t => t.id !== event.detail.taskId));
      }
      fetchTasks();
    };
    
    window.addEventListener('taskUpdated', handleTaskUpdated);
    window.addEventListener('taskDeleted', handleTaskDeleted);
    
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdated);
      window.removeEventListener('taskDeleted', handleTaskDeleted);
    };
  }, []);

  const handleUpdate = async (updated) => {
    // optimistic update
    setTasks(updated)
    try {
      await axios.post(`${API_URL}/tasks/bulk`, updated)
    } catch (error) {
      console.error('Error updating tasks:', error)
      // Revert optimistic update on error
      fetchTasks()
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(`${API_URL}/tasks`, newTask)
      setTasks([...tasks, data])
      setNewTask({ 
        title: '', 
        description: '', 
        status: 'todo', 
        priority: 'medium',
        due_date: '',
        tags: []
      })
      setShowForm(false)
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }
  
  const handleSearch = () => {
    fetchTasks()
  }
  
  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: ''
    })
    // Reset to default tasks
    fetchTasks()
  }
  
  const addTag = () => {
    if (tagInput.trim() !== '' && !newTask.tags.includes(tagInput.trim())) {
      setNewTask({
        ...newTask,
        tags: [...newTask.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }
  
  const removeTag = (tagToRemove) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter(tag => tag !== tagToRemove)
    })
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Task Board</h1>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setActiveTab('board')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'board' 
                    ? 'bg-white text-blue-700' 
                    : theme === 'dark' ? 'bg-blue-800 text-white hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaTasks /> Board
              </button>
              
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-blue-700' 
                    : theme === 'dark' ? 'bg-blue-800 text-white hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaChartBar /> Dashboard
              </button>
              
              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`${
              theme === 'dark' 
                ? 'bg-blue-700 hover:bg-blue-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md`}
          >
            <FaPlus /> {showForm ? 'Cancel' : 'Add Task'}
          </button>
          
          <button 
            onClick={fetchTasks} 
            className={`${
              theme === 'dark' 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            } px-4 py-2 rounded-md shadow-sm`}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        {showForm && (
          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-100'
          } p-6 rounded-xl shadow-md mb-8 border`}>
            <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Add New Task</h2>
            <form onSubmit={addTask} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className={`w-full border rounded-md px-3 py-2 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } outline-none transition`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className={`w-full border rounded-md px-3 py-2 h-24 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } outline-none transition`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                    className={`w-full border rounded-md px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } outline-none transition`}
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className={`w-full border rounded-md px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } outline-none transition`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className={`w-full border rounded-md px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } outline-none transition`}
                  />
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newTask.tags.map((tag, index) => (
                    <span key={index} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      theme === 'dark' ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => removeTag(tag)}
                        className="text-xs rounded-full hover:bg-red-200 hover:text-red-800 w-4 h-4 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className={`flex-grow border rounded-l-md px-3 py-2 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'border-gray-300'
                    } outline-none transition`}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button 
                    type="button"
                    onClick={addTag}
                    className={`${
                      theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
                    } text-white px-3 py-2 rounded-r-md`}
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className={`${
                  theme === 'dark' ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'
                } text-white px-6 py-2 rounded-md shadow transition`}
              >
                Create Task
              </button>
            </form>
          </div>
        )}
        
        <TaskFilter 
          filters={filters}
          setFilters={setFilters}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
        />
        
        {activeTab === 'dashboard' ? (
          <Dashboard tasks={tasks} />
        ) : (
          <Board tasks={tasks} setTasks={handleUpdate} />
        )}
      </main>
      
      <footer className={`max-w-7xl mx-auto px-4 py-6 border-t ${
        theme === 'dark' ? 'border-gray-800 mt-12' : 'border-gray-200 mt-12'
      }`}>
        <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
          Task Board Application - Full Stack Demo
        </p>
      </footer>
    </div>
  )
}

