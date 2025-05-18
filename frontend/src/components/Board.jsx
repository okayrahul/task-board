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

const API_URL = import.meta.env.VITE_API_URL;

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
    if (['todo', 'inProgress', 'done'].includes(id)) return id;
    
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
    
    if (!active || !over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const activeId = active.id;
    const overId = over.id;
    
    if (!activeId || !overId) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    const activeTask = findTaskById(activeId);
    if (!activeTask) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }
    
    // If dropping on a column directly (todo, inProgress, done)
    if (['todo', 'inProgress', 'done'].includes(overId)) {
      if (activeTask.status !== overId) {
        // Update the task's status
        const updatedTasks = tasks.map(t =>
          t.id === activeId ? { ...t, status: overId } : t
        );
        
        // Call parent setter for optimistic update
        setTasks(updatedTasks);
        
        // Also call API to ensure it's updated
        try {
          await axios.post(`${API_URL}/tasks/${activeId}/move/${overId}`);
        } catch (error) {
          console.error('Error moving task:', error);
        }
      }
    } else {
      // Dropping on another task - use the target task's status
      const overTask = findTaskById(overId);
      if (overTask && activeTask.status !== overTask.status) {
        // Update the task's status
        const updatedTasks = tasks.map(t =>
          t.id === activeId ? { ...t, status: overTask.status } : t
        );
        
        // Call parent setter for optimistic update
        setTasks(updatedTasks);
        
        // Also call API to ensure it's updated
        try {
          await axios.post(`${API_URL}/tasks/${activeId}/move/${overTask.status}`);
        } catch (error) {
          console.error('Error moving task:', error);
        }
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

      <div className={`${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-blue-50 text-blue-800'} p-3 rounded-md text-sm mb-2 flex items-center`}>
        <div className="mr-2">💡</div>
        <div>Drag and drop tasks between columns to update their status. Grab a task card and drop it on any column.</div>
      </div>

      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        collisionDetection={(args) => {
          // Enhanced collision detection to prioritize columns
          const { active, droppableContainers, droppableRects } = args;
          
          // Safety check to avoid errors from undefined values
          if (!active || !active.rect || !active.rect.current || !droppableRects || !droppableContainers) {
            return [];
          }
          
          // Check if translated exists and has needed properties
          const translated = active.rect.current.translated;
          if (!translated) {
            return [];
          }
          
          // First check if we're directly over a column (todo, inProgress, done)
          for (const containerId of ['todo', 'inProgress', 'done']) {
            const container = droppableContainers.find(c => c.id === containerId);
            if (container) {
              const rect = droppableRects.get(containerId);
              // Ensure all properties needed exist before using them
              if (rect && 
                  rect.right !== undefined && translated.left !== undefined &&
                  rect.left !== undefined && translated.right !== undefined &&
                  rect.bottom !== undefined && translated.top !== undefined &&
                  rect.top !== undefined && translated.bottom !== undefined &&
                  translated.left < rect.right &&
                  translated.right > rect.left &&
                  translated.top < rect.bottom &&
                  translated.bottom > rect.top) {
                return [{ id: containerId }];
              }
            }
          }
          
          // If not over a column, use default collision detection from DndKit
          const closestDraggables = [];
          
          for (const droppableContainer of droppableContainers) {
            if (!droppableContainer || !droppableContainer.id) continue;
            
            const rect = droppableRects.get(droppableContainer.id);
            
            if (rect && rect.width !== undefined && rect.height !== undefined && 
                rect.left !== undefined && rect.top !== undefined && 
                translated && translated.left !== undefined && translated.top !== undefined &&
                active.rect.current.width !== undefined && active.rect.current.height !== undefined) {
              
              // All needed properties are available, calculate distance
              const distanceFromCenter = Math.sqrt(
                Math.pow(translated.left + active.rect.current.width / 2 - (rect.left + rect.width / 2), 2) +
                Math.pow(translated.top + active.rect.current.height / 2 - (rect.top + rect.height / 2), 2)
              );
              
              closestDraggables.push({
                id: droppableContainer.id,
                distance: distanceFromCenter,
              });
            }
          }
          
          // Sort by distance
          closestDraggables.sort((a, b) => a.distance - b.distance);
          
          return closestDraggables.map(d => ({ id: d.id }));
        }}
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
