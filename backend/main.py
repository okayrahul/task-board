from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import uuid
import os
from datetime import datetime, date

DATA_FILE = os.path.join(os.path.dirname(__file__), "tasks.json")

def load_tasks():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_tasks(tasks):
    with open(DATA_FILE, "w") as f:
        json.dump(tasks, f, indent=2)

class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    status: str  # 'todo', 'inProgress', 'done'
    priority: str = "medium"  # 'low', 'medium', 'high'
    due_date: Optional[str] = None
    created_at: str = datetime.now().isoformat()
    tags: List[str] = []

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[str] = None
    tags: List[str] = []

app = FastAPI(title="Task Board API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Task Board API is running"}


@app.get("/tasks", response_model=List[Task])
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search in title and description")
):
    tasks = load_tasks()
    
    # Apply filters
    if status:
        tasks = [t for t in tasks if t["status"] == status]
    
    if priority:
        tasks = [t for t in tasks if t.get("priority", "medium") == priority]
    
    if search:
        search = search.lower()
        tasks = [t for t in tasks if 
                 search in t["title"].lower() or 
                 search in t.get("description", "").lower()]
    
    return tasks

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate):
    tasks = load_tasks()
    new_task = Task(
        id=str(uuid.uuid4()), 
        created_at=datetime.now().isoformat(),
        **task.dict()
    )
    tasks.append(new_task.dict())
    save_tasks(tasks)
    return new_task

@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: str):
    tasks = load_tasks()
    for task in tasks:
        if task["id"] == task_id:
            return task
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: str, task: TaskCreate):
    tasks = load_tasks()
    for t in tasks:
        if t["id"] == task_id:
            t.update(task.dict())
            save_tasks(tasks)
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: str):
    tasks = load_tasks()
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(tasks) == len(new_tasks):
        raise HTTPException(status_code=404, detail="Task not found")
    save_tasks(new_tasks)
    return

@app.post("/tasks/{task_id}/move/{status}", response_model=Task)
def move_task(task_id: str, status: str):
    if status not in ("todo", "inProgress", "done"):
        raise HTTPException(status_code=400, detail="Invalid status")
    tasks = load_tasks()
    for t in tasks:
        if t["id"] == task_id:
            t["status"] = status
            save_tasks(tasks)
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.post("/tasks/bulk", response_model=List[Task])
def bulk_update_tasks(tasks_data: List[Task]):
    """Update multiple tasks at once, useful for drag and drop operations"""
    tasks = load_tasks()
    
    # Create a map of task IDs to tasks
    task_map = {task["id"]: task for task in tasks}
    
    # Update tasks
    for updated_task in tasks_data:
        if updated_task.id in task_map:
            task_map[updated_task.id].update(updated_task.dict())
        else:
            # If task doesn't exist, add it
            task_map[updated_task.id] = updated_task.dict()
    
    # Convert back to list
    updated_tasks = list(task_map.values())
    save_tasks(updated_tasks)
    return updated_tasks

@app.get("/stats", response_model=dict)
def get_stats():
    """Get task statistics"""
    tasks = load_tasks()
    
    # Count tasks by status
    status_counts = {
        "todo": len([t for t in tasks if t["status"] == "todo"]),
        "inProgress": len([t for t in tasks if t["status"] == "inProgress"]),
        "done": len([t for t in tasks if t["status"] == "done"]),
    }
    
    # Count tasks by priority
    priority_counts = {
        "low": len([t for t in tasks if t.get("priority") == "low"]),
        "medium": len([t for t in tasks if t.get("priority", "medium") == "medium"]),
        "high": len([t for t in tasks if t.get("priority") == "high"]),
    }
    
    # Count tasks due today or overdue
    today = date.today().isoformat()
    due_today = len([t for t in tasks if t.get("due_date") == today])
    overdue = len([t for t in tasks if 
                  t.get("due_date") and t.get("due_date") < today and t["status"] != "done"])
    
    return {
        "total": len(tasks),
        "by_status": status_counts,
        "by_priority": priority_counts,
        "due_today": due_today,
        "overdue": overdue
    }
