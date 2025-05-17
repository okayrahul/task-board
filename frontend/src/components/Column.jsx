
import React from 'react'
import { Droppable } from 'react-beautiful-dnd'
import TaskCard from './TaskCard'

export default function Column({ status, title, color, tasks }) {
  return (
    <div className={`p-2 rounded-lg shadow ${color}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-[50px]"
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
