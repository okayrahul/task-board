# Task Board Application

A modern task management board application built with React (frontend) and FastAPI (backend). This application allows users to organize tasks by dragging and dropping them between different status columns (To Do, In Progress, Done).

![Task Board](https://via.placeholder.com/800x400?text=Task+Board+Screenshot)

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
- SQLite for data storage

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- npm or yarn

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

2. Create a virtual environment (optional but recommended):

```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
```

3. Install required packages:

```bash
pip install -r requirements.txt
```

4. Run the server:

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

### Backend Deployment

The FastAPI backend can be deployed to various platforms:

#### Heroku
1. Create a `Procfile` in the backend directory with the following content:
```
web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

2. Add `gunicorn` to `requirements.txt`

3. Deploy using Heroku CLI:
```bash
heroku create your-app-name
git push heroku main
```

#### Docker
1. Create a Dockerfile in the backend directory:
```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Build and run the Docker image:
```bash
docker build -t task-board-backend .
docker run -p 8000:8000 task-board-backend
```

### Frontend Deployment

The React application can be deployed to:

#### Netlify/Vercel
1. Build the production version:
```bash
npm run build
```

2. Deploy the `dist` directory to Netlify or Vercel using their CLI or web interface.

#### Docker
1. Create a Dockerfile in the frontend directory:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Build and run the Docker image:
```bash
docker build -t task-board-frontend .
docker run -p 80:80 task-board-frontend
```

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

#### Backend
Create a `.env` file in the backend directory with the following variables:
```
DATABASE_URL=sqlite:///./tasks.db
DEBUG=True
```

#### Frontend
Create a `.env` file in the frontend directory to configure the API URL:
```
VITE_API_URL=http://localhost:8000
```

For production deployment, create a `.env.production` file:
```
VITE_API_URL=https://your-api-domain.com
```

Make sure to replace `https://your-api-domain.com` with your actual backend API URL in production.

## Known Issues and Troubleshooting

- If you encounter CORS issues, ensure the backend has proper CORS middleware configured.
- For database connection problems, check that the database file has proper write permissions.

## Any additional details, feedback you want to express

During the development of this project, I encountered several challenges that led to architectural decisions I'd like to highlight:

1. **Drag and Drop Implementation**: The project requirements suggested using `react-beautiful-dnd`, but this library is no longer actively maintained and has compatibility issues with React 18. Instead, I implemented drag-and-drop functionality using the modern `@dnd-kit` library, which provides better performance, accessibility, and is actively maintained.

2. **State Management**: Rather than introducing a complex state management library for this relatively small application, I opted to use React's built-in Context API and prop drilling where appropriate. This keeps the codebase simpler and more maintainable.

3. **Error Handling**: I've added comprehensive error handling throughout the application, especially in the drag-and-drop implementation, to prevent common issues like null reference errors that occur in many drag-and-drop implementations.

4. **Mobile Responsiveness**: While the application works on mobile devices, the drag-and-drop interaction could be further optimized for touch interfaces in a future iteration.

The migration from `react-beautiful-dnd` to `@dnd-kit` required a significant rewrite of the drag-and-drop logic, but resulted in a more stable application with better performance and fewer edge cases.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributors

- Rahul Ajith Kumar
