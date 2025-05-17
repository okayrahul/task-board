
import React from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import Column from './Column'

const statuses = [
  { key: 'todo', title: 'To Do', color: 'bg-red-200' },
  { key: 'inProgress', title: 'In Progress', color: 'bg-yellow-200' },
  { key: 'done', title: 'Done', color: 'bg-green-200' }
]

export default function Board({ tasks, setTasks }) {
  const onDragEnd = (result) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return
    const updated = tasks.map(t =>
      t.id === draggableId ? { ...t, status: destination.droppableId } : t
    )
    setTasks(updated)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.map(s => (
          <Column
            key={s.key}
            status={s.key}
            title={s.title}
            color={s.color}
            tasks={tasks.filter(t => t.status === s.key)}
          />
        ))}
      </div>
    </DragDropContext>
  )
}
