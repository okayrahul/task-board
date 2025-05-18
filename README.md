# Task Board Application

A modern task management board application built with React (frontend) and FastAPI (backend). This application allows users to organize tasks by dragging and dropping them between different status columns (To Do, In Progress, Done).

![Task Board](./assets/preview%201.png)

![Dashboard](./assets/preview%202.png)

## Features

- **Drag-and-Drop Task Management**: Move tasks between status columns
- **Task CRUD Operations**: Create, read, update, and delete tasks
- **Task Prioritization**: Assign low, medium, or high priority to tasks
- **Due Dates**: Set and track task deadlines
- **Task Tags**: Categorize tasks with custom tags
- **Dark/Light Mode**: Toggle between dark and light themes
- **Dashboard View**: Visualize task statistics
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- React (with Vite)
- Tailwind CSS for styling
- @dnd-kit for drag-and-drop functionality
- React Icons
- Axios for API requests

### Backend
- FastAPI (Python)
- SQLite for local development

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- npm

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/task-board.git
cd task-board
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install required packages:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn main:app --reload
```

The backend will be available at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will be available at http://localhost:5173 (or similar port).

## Deployment

### Backend Deployment with Railway

1. Create an account on [Railway](https://railway.app/) if you don't have one already.

2. Create a new project and select "Deploy from GitHub repo".

3. Connect your GitHub repository and select the task-board repository.

4. Configure the deployment settings:
   - Service: Select Python
   - Root Directory: `/backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Set environment variables as needed in the Railway dashboard.

Railway will automatically deploy your backend and provide you with a URL to access it.

### Frontend Deployment with Vercel

1. Create an account on [Vercel](https://vercel.com/) if you don't have one already.

2. Create a new project and import your GitHub repository.

3. Configure the build settings:
   - Framework Preset: Vite
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Set the environment variable `VITE_API_URL` to your Railway backend URL.

5. Deploy the application.

Vercel will build and deploy your frontend application, providing you with a URL to access it.

## API Documentation

The backend API is documented with OpenAPI and can be accessed at http://localhost:8000/docs when the backend server is running.

Key endpoints:
- `GET /tasks` - List all tasks with optional filtering
- `POST /tasks` - Create a new task
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task
- `POST /tasks/{id}/move/{status}` - Move a task to a different status

## Configuration

### Environment Variables

#### Frontend
Create a `.env` file in the frontend directory to configure the API URL:
```
VITE_API_URL=http://localhost:8000
```

For production deployment on Vercel, set the environment variable through the Vercel dashboard:
```
VITE_API_URL=https://your-railway-app-url.railway.app
```

## Known Issues and Troubleshooting

- If you encounter CORS issues, ensure the backend has proper CORS middleware configured.
- The application uses SQLite for simplicity in development; consider using a more robust database for production.

## License

This project is licensed under the MIT License.

## Contributors

- Rahul Ajith Kumar
