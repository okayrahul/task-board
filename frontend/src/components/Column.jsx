import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'
import { useTheme } from '../context/ThemeContext'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

export default function Column({ id, status, title, color, tasks }) {
  const { theme } = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });
  
  // Map status to color information based on theme
  const statusInfo = {
    todo: {
      bgLight: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50',
      border: theme === 'dark' ? 'border-red-800' : 'border-red-200',
      textColor: theme === 'dark' ? 'text-red-200' : 'text-red-800',
      hoverBg: theme === 'dark' ? 'bg-red-900/50' : 'bg-red-100/50'
    },
    inProgress: {
      bgLight: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50',
      border: theme === 'dark' ? 'border-yellow-800' : 'border-yellow-200',
      textColor: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800',
      hoverBg: theme === 'dark' ? 'bg-yellow-900/50' : 'bg-yellow-100/50'
    },
    done: {
      bgLight: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50',
      border: theme === 'dark' ? 'border-green-800' : 'border-green-200',
      textColor: theme === 'dark' ? 'text-green-200' : 'text-green-800',
      hoverBg: theme === 'dark' ? 'bg-green-900/50' : 'bg-green-100/50'
    }
  };
  
  const info = statusInfo[status];
  const countBadgeBg = theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-700';
  const emptyStateBg = theme === 'dark' 
    ? 'text-gray-500 border-gray-700' 
    : 'text-gray-400 border-gray-200';
  
  return (
    <div className={`rounded-lg shadow-md ${info.bgLight} border ${info.border} transition-all duration-300 hover:shadow-lg`}>
      <div className={`p-3 border-b ${info.border} flex justify-between items-center`}>
        <h2 className={`text-lg font-semibold ${info.textColor}`}>{title}</h2>
        <span className={`${countBadgeBg} text-sm py-1 px-2 rounded-full shadow-sm`}>
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`p-3 space-y-3 min-h-[50vh] transition-colors ${
          isOver ? info.hoverBg : ''
        }`}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className={`text-center py-8 italic border-2 border-dashed rounded-lg ${emptyStateBg}`}>
              No tasks yet
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} id={task.id} task={task} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
