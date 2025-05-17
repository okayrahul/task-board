
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import uuid
import os

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

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/tasks", response_model=List[Task])
def get_tasks():
    return load_tasks()

@app.post("/tasks", response_model=Task, status_code=201)
def create_task(task: TaskCreate):
    tasks = load_tasks()
    new_task = Task(id=str(uuid.uuid4()), **task.dict())
    tasks.append(new_task.dict())
    save_tasks(tasks)
    return new_task

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
