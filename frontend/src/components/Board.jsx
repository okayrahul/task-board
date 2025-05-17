import React, { useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Column from './Column'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'
import TaskCard from './TaskCard'

const statuses = [
  { key: 'todo', title: 'To Do', color: 'bg-red-200' },
  { key: 'inProgress', title: 'In Progress', color: 'bg-yellow-200' },
  { key: 'done', title: 'Done', color: 'bg-green-200' }
]

const API_URL = 'http://localhost:8000'

export default function Board({ tasks, setTasks }) {
  const { theme } = useTheme();
  const [activeId, setActiveId] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  function findContainer(id) {
    if (id in ['todo', 'inProgress', 'done']) return id;
    
    const task = tasks.find(task => task.id === id);
    return task ? task.status : null;
  }

  function findTaskById(id) {
    return tasks.find(task => task.id === id);
  }
  
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    const task = findTaskById(active.id);
    if (task) {
      setActiveTask(task);
    }
  };
  
  const handleDragOver = (event) => {
    // No implementation needed for this simple case
  };
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    
    // If dropping on a task, use its container
    if (!statuses.find(s => s.key === overContainer)) {
      const overTask = findTaskById(over.id);
      if (overTask) {
        // Use the status of the task we're dropping on
        const overContainer = overTask.status;
        
        // If dropping in same container, do nothing
        if (activeContainer === overContainer) {
          setActiveId(null);
          setActiveTask(null);
          return;
        }
        
        // Update the task's status
        const updatedTasks = tasks.map(t =>
          t.id === active.id ? { ...t, status: overContainer } : t
        );
        
        // Call parent setter for optimistic update
        setTasks(updatedTasks);
        
        // Also call API to ensure it's updated
        try {
          await axios.post(`${API_URL}/tasks/${active.id}/move/${overContainer}`);
        } catch (error) {
          console.error('Error moving task:', error);
        }
      }
    } else if (overContainer && activeContainer !== overContainer) {
      // Dropping directly in a different column
      const updatedTasks = tasks.map(t =>
        t.id === active.id ? { ...t, status: overContainer } : t
      );
      
      // Call parent setter for optimistic update
      setTasks(updatedTasks);
      
      // Also call API to ensure it's updated
      try {
        await axios.post(`${API_URL}/tasks/${active.id}/move/${overContainer}`);
      } catch (error) {
        console.error('Error moving task:', error);
      }
    }
    
    setActiveId(null);
    setActiveTask(null);
  };

  // Calculate counts for task stats
  const counts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'inProgress').length,
    done: tasks.filter(t => t.status === 'done').length,
    total: tasks.length
  }

  // Theme-based styles
  const statBg = theme === 'dark' ? {
    todo: 'bg-red-900/30',
    inProgress: 'bg-yellow-900/30',
    done: 'bg-green-900/30',
    total: 'bg-blue-900/30'
  } : {
    todo: 'bg-red-200',
    inProgress: 'bg-yellow-200',
    done: 'bg-green-200',
    total: 'bg-blue-200'
  };

  const statText = theme === 'dark' ? {
    todo: 'text-red-200',
    inProgress: 'text-yellow-200',
    done: 'text-green-200',
    total: 'text-blue-200'
  } : {
    todo: 'text-red-800',
    inProgress: 'text-yellow-800',
    done: 'text-green-800',
    total: 'text-blue-800'
  };

  return (
    <div className="space-y-6">
      <div className="stats grid grid-cols-4 gap-4">
        {statuses.map(s => (
          <div key={s.key} className={`${statBg[s.key]} p-4 rounded-lg shadow text-center`}>
            <div className={`stat-title text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {s.title}
            </div>
            <div className={`stat-value text-2xl font-bold ${statText[s.key]}`}>
              {counts[s.key]}
            </div>
          </div>
        ))}
        <div className={`${statBg.total} p-4 rounded-lg shadow text-center`}>
          <div className={`stat-title text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Total
          </div>
          <div className={`stat-value text-2xl font-bold ${statText.total}`}>
            {counts.total}
          </div>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statuses.map(s => (
            <Column
              key={s.key}
              id={s.key}
              status={s.key}
              title={s.title}
              color={s.color}
              tasks={tasks.filter(t => t.status === s.key)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId && activeTask ? (
            <div className="opacity-80">
              <TaskCard task={activeTask} isDragging={true} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
