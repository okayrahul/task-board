import React, { useState } from 'react'
import axios from 'axios'
import { FaEdit, FaTrash, FaSave, FaTimes, FaCalendarAlt, FaTag, FaExclamationTriangle, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import { useTheme } from '../context/ThemeContext'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const API_URL = 'http://localhost:8000'

export default function TaskCard({ id, task, isDragging = false }) {
  const { theme } = useTheme();
  const [editing, setEditing] = useState(false)
  const [editedTask, setEditedTask] = useState({ ...task })
  const [isDeleting, setIsDeleting] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Priority color mapping based on theme
  const priorityColors = {
    high: theme === 'dark' 
      ? 'bg-red-900 text-red-200 border-red-800' 
      : 'bg-red-100 text-red-700 border-red-200',
    medium: theme === 'dark'
      ? 'bg-blue-900 text-blue-200 border-blue-800'
      : 'bg-blue-100 text-blue-700 border-blue-200',
    low: theme === 'dark'
      ? 'bg-green-900 text-green-200 border-green-800'
      : 'bg-green-100 text-green-700 border-green-200'
  };

  // Priority icon mapping
  const priorityIcons = {
    high: <FaArrowUp className={theme === 'dark' ? "text-red-400" : "text-red-600"} />,
    medium: <FaTag className={theme === 'dark' ? "text-blue-400" : "text-blue-600"} />,
    low: <FaArrowDown className={theme === 'dark' ? "text-green-400" : "text-green-600"} />,
  };
  
  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, {
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority || 'medium',
        due_date: editedTask.due_date,
        tags: editedTask.tags || []
      })
      setEditing(false)
      // Reload tasks to reflect changes
      window.location.reload()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }
  
  const handleDelete = async () => {
    if (isDeleting) {
      try {
        await axios.delete(`${API_URL}/tasks/${task.id}`)
        // Reload tasks to reflect changes
        window.location.reload()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
    } else {
      setIsDeleting(true)
      // Reset after 3 seconds if not confirmed
      setTimeout(() => setIsDeleting(false), 3000)
    }
  }

  // Check if task is due today or overdue
  const isOverdue = () => {
    if (!task.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date < today && task.status !== 'done';
  };
  
  const isDueToday = () => {
    if (!task.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.due_date === today;
  };
  
  // Card background and text colors based on theme
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const descriptionColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const tagBg = theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600';
  const inputBg = theme === 'dark' 
    ? 'bg-gray-700 border-gray-600 text-white' 
    : 'border-gray-300 bg-white';
  
  const renderTaskContent = () => {
    if (editing) {
      return (
        <form onSubmit={handleSave} className="space-y-2">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className={`w-full border rounded px-2 py-1 text-sm mb-1 ${inputBg}`}
            required
          />
          <textarea
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            className={`w-full border rounded px-2 py-1 text-sm h-20 ${inputBg}`}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Priority
              </label>
              <select 
                value={editedTask.priority || 'medium'}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                className={`w-full border rounded text-sm px-2 py-1 ${inputBg}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Due Date
              </label>
              <input 
                type="date"
                value={editedTask.due_date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                className={`w-full border rounded text-sm px-2 py-1 ${inputBg}`}
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-2">
            <button 
              type="submit"
              className="text-green-600 hover:text-green-800"
              title="Save changes"
            >
              <FaSave />
            </button>
            <button 
              type="button"
              onClick={() => setEditing(false)}
              className={theme === 'dark' ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-800"}
              title="Cancel editing"
            >
              <FaTimes />
            </button>
          </div>
        </form>
      )
    } else {
      return (
        <>
          <div className="flex justify-between items-start">
            <h3 className={`font-medium ${textColor}`}>{task.title}</h3>
            <div className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[task.priority || 'medium']}`}>
              {priorityIcons[task.priority || 'medium']}
            </div>
          </div>
          
          {task.description && (
            <p className={`text-sm ${descriptionColor} mt-1`}>{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags && task.tags.map((tag, i) => (
              <span key={i} className={`${tagBg} text-xs rounded px-1.5 py-0.5`}>
                {tag}
              </span>
            ))}
          </div>
          
          {task.due_date && (
            <div className={`flex items-center mt-2 text-xs ${
              isOverdue() 
                ? theme === 'dark' ? 'text-red-400' : 'text-red-600' 
                : isDueToday() 
                  ? theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <FaCalendarAlt className="mr-1" />
              {isOverdue() && <FaExclamationTriangle className="mr-1" />}
              {new Date(task.due_date).toLocaleDateString()}
            </div>
          )}
          
          <div className="flex justify-end mt-2 space-x-2">
            <button 
              onClick={() => setEditing(true)}
              className={theme === 'dark' ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"}
              title="Edit task"
            >
              <FaEdit />
            </button>
            <button 
              onClick={handleDelete}
              className={isDeleting 
                ? theme === 'dark' ? "text-red-400 animate-pulse" : "text-red-500 animate-pulse" 
                : theme === 'dark' ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-700"
              }
              title={isDeleting ? "Click again to confirm" : "Delete task"}
            >
              <FaTrash />
            </button>
          </div>
        </>
      )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 ${cardBg} rounded shadow hover:shadow-md transition-shadow ${
        isDragging 
          ? theme === 'dark' ? 'shadow-lg ring-2 ring-blue-500' : 'shadow-lg ring-2 ring-blue-200' 
          : ''
      } ${isOverdue() ? `border-l-4 ${theme === 'dark' ? 'border-red-700' : 'border-red-500'}` : ''}`}
    >
      {renderTaskContent()}
    </div>
  )
}
