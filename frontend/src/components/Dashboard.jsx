import React, { useEffect, useState } from 'react';
import { 
  FaCheckCircle, 
  FaClock, 
  FaListUl, 
  FaChartBar,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaTag
} from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard({ tasks }) {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    total: 0,
    by_status: { todo: 0, inProgress: 0, done: 0 },
    by_priority: { low: 0, medium: 0, high: 0 },
    due_today: 0,
    overdue: 0
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/stats`);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Calculate stats from tasks if API fails
        calculateStats();
      }
    };

    fetchStats();
  }, [tasks]);

  // Calculate stats from tasks
  const calculateStats = () => {
    // Calculate basic stats from tasks
    const statusCounts = {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'inProgress').length,
      done: tasks.filter(t => t.status === 'done').length
    };
    
    const priorityCounts = {
      low: tasks.filter(t => t.priority === 'low').length,
      medium: tasks.filter(t => t.priority === 'medium' || !t.priority).length,
      high: tasks.filter(t => t.priority === 'high').length
    };
    
    // Calculate completion rate
    const completionRate = tasks.length > 0 
      ? Math.round((statusCounts.done / tasks.length) * 100) 
      : 0;
    
    setStats({
      total: tasks.length,
      by_status: statusCounts,
      by_priority: priorityCounts,
      completion_rate: completionRate
    });
  };
  
  // Export tasks to CSV
  const exportToCSV = () => {
    // Create CSV header
    const csvHeader = ["ID", "Title", "Description", "Status", "Priority", "Due Date", "Tags"];
    
    // Format tasks data
    const csvRows = tasks.map(task => [
      task.id,
      `"${task.title?.replace(/"/g, '""') || ''}"`, // Escape quotes in title
      `"${task.description?.replace(/"/g, '""') || ''}"`, // Escape quotes in description
      task.status || '',
      task.priority || 'medium',
      task.due_date || '',
      task.tags ? `"${task.tags.join(',')}"` : '' // Join tags with comma
    ]);
    
    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].map(row => row.join(',')).join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tasks-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    // Calculate completion rate
  const completionRate = stats.by_status && stats.total > 0 
    ? Math.round((stats.by_status.done / stats.total) * 100) 
    : 0;
  
  // Calculate task distribution for chart
  const getBarHeight = (count) => {
    const maxHeight = 150; // max height in pixels
    const percentage = stats.total > 0 ? (count / stats.total) : 0;
    return Math.max(percentage * maxHeight, 10); // at least 10px height
  };

  // Use a safer approach instead of alerts
  const handleCardClick = (message) => {
    console.log(message); // Just log to console instead of alert
    // In the future, you could implement a toast notification here
  };

  // Theme-dependent styles
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const statBg = {
    blue: theme === 'dark' ? 'bg-blue-900' : 'bg-blue-50',
    red: theme === 'dark' ? 'bg-red-900' : 'bg-red-50',
    yellow: theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-50',
    green: theme === 'dark' ? 'bg-green-900' : 'bg-green-50',
  };
  const iconBg = {
    blue: theme === 'dark' ? 'bg-blue-800' : 'bg-blue-100',
    red: theme === 'dark' ? 'bg-red-800' : 'bg-red-100',
    yellow: theme === 'dark' ? 'bg-yellow-800' : 'bg-yellow-100',
    green: theme === 'dark' ? 'bg-green-800' : 'bg-green-100',
  };
  const iconColor = {
    blue: theme === 'dark' ? 'text-blue-200' : 'text-blue-600',
    red: theme === 'dark' ? 'text-red-200' : 'text-red-600',
    yellow: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-600',
    green: theme === 'dark' ? 'text-green-200' : 'text-green-600',
  };
  const textColor = {
    header: theme === 'dark' ? 'text-white' : 'text-gray-800',
    subheader: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    highlight: theme === 'dark' ? 'text-white' : 'text-gray-800',
  };
  const chartBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50';  return (
    <div className={`${cardBg} rounded-xl shadow-lg p-6 mb-8`}>      <h2 className={`text-2xl font-bold mb-6 ${textColor.header} flex justify-between items-center`}>
        <span>Task Dashboard</span>
        <div className="flex space-x-2">
          <button 
            onClick={exportToCSV} 
            className={`text-sm px-3 py-1 rounded-md flex items-center ${theme === 'dark' ? 'bg-green-700 hover:bg-green-600' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            <FaDownload className="mr-1" /> Export Tasks
          </button>
          <button 
            onClick={(e) => { 
              e.preventDefault();
              const fetchStats = async () => {
                try {
                  const { data } = await axios.get(`${API_URL}/stats`);
                  setStats(data);
                } catch (error) {
                  calculateStats();
                }
              };
              fetchStats();
            }} 
            className={`text-sm px-3 py-1 rounded-md ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            Refresh Data
          </button>
        </div>
      </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Tasks Card */}
        <div className={`${statBg.blue} rounded-lg p-4 flex items-center cursor-pointer transform transition-transform hover:scale-105`}
             onClick={() => handleCardClick(`You have ${stats.total} total tasks`)}>
          <div className={`rounded-full ${iconBg.blue} p-3 mr-4`}>
            <FaListUl className={`${iconColor.blue} text-xl`} />
          </div>
          <div>
            <p className={`text-sm ${textColor.subheader}`}>Total Tasks</p>
            <p className={`text-2xl font-bold ${textColor.highlight}`}>{stats.total}</p>
          </div>
        </div>
        
        {/* To Do Card */}
        <div className={`${statBg.red} rounded-lg p-4 flex items-center cursor-pointer transform transition-transform hover:scale-105`}
             onClick={() => handleCardClick(`You have ${stats.by_status?.todo || 0} tasks to do`)}>
          <div className={`rounded-full ${iconBg.red} p-3 mr-4`}>
            <FaListUl className={`${iconColor.red} text-xl`} />
          </div>
          <div>
            <p className={`text-sm ${textColor.subheader}`}>To Do</p>
            <p className={`text-2xl font-bold ${textColor.highlight}`}>{stats.by_status?.todo || 0}</p>
          </div>
        </div>
        
        {/* In Progress Card */}
        <div className={`${statBg.yellow} rounded-lg p-4 flex items-center cursor-pointer transform transition-transform hover:scale-105`}
             onClick={() => handleCardClick(`You have ${stats.by_status?.inProgress || 0} tasks in progress`)}>
          <div className={`rounded-full ${iconBg.yellow} p-3 mr-4`}>
            <FaClock className={`${iconColor.yellow} text-xl`} />
          </div>
          <div>
            <p className={`text-sm ${textColor.subheader}`}>In Progress</p>
            <p className={`text-2xl font-bold ${textColor.highlight}`}>{stats.by_status?.inProgress || 0}</p>
          </div>
        </div>
        
        {/* Done Card */}
        <div className={`${statBg.green} rounded-lg p-4 flex items-center cursor-pointer transform transition-transform hover:scale-105`}
             onClick={() => handleCardClick(`You have completed ${stats.by_status?.done || 0} tasks`)}>
          <div className={`rounded-full ${iconBg.green} p-3 mr-4`}>
            <FaCheckCircle className={`${iconColor.green} text-xl`} />
          </div>
          <div>
            <p className={`text-sm ${textColor.subheader}`}>Done</p>
            <p className={`text-2xl font-bold ${textColor.highlight}`}>{stats.by_status?.done || 0}</p>
          </div>
        </div>
      </div>
      
      {/* Additional info row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Due Today & Overdue */}
        <div className={`${cardBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-3 ${textColor.header} flex items-center`}>
            <FaCalendarAlt className="mr-2" /> Deadlines
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`flex items-center ${textColor.subheader}`}>
                <FaCalendarAlt className="mr-2" /> Due Today
              </span>
              <span className={`font-bold ${textColor.highlight}`}>{stats.due_today || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`flex items-center ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                <FaExclamationTriangle className="mr-2" /> Overdue
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>{stats.overdue || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Priority Distribution */}
        <div className={`${cardBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-3 ${textColor.header} flex items-center`}>
            <FaArrowUp className="mr-2" /> Priority
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`flex items-center ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                <FaArrowUp className="mr-2" /> High
              </span>
              <span className={`font-bold ${textColor.highlight}`}>{stats.by_priority?.high || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`flex items-center ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
                <FaTag className="mr-2" /> Medium
              </span>
              <span className={`font-bold ${textColor.highlight}`}>{stats.by_priority?.medium || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`flex items-center ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
                <FaArrowDown className="mr-2" /> Low
              </span>
              <span className={`font-bold ${textColor.highlight}`}>{stats.by_priority?.low || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className={`${cardBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-4 shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-3 ${textColor.header} flex items-center`}>
            <FaChartBar className="mr-2" /> Completion Rate
          </h3>
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'}
                  strokeWidth="10"
                />
                
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    completionRate < 30 
                      ? theme === 'dark' ? '#b91c1c' : '#ef4444' 
                      : completionRate < 70 
                        ? theme === 'dark' ? '#b45309' : '#f59e0b'
                        : theme === 'dark' ? '#15803d' : '#22c55e'
                  }
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - completionRate / 100)}`}
                  transform="rotate(-90 50 50)"
                />
                
                {/* Percentage text */}
                <text
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill={theme === 'dark' ? '#ffffff' : '#374151'}
                >
                  {completionRate}%
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task Distribution Chart */}
      <div className={`${cardBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} rounded-lg p-6 shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor.header} flex items-center`}>
          <FaChartBar className="mr-2" /> Task Distribution
        </h3>
        <div className="flex h-40 items-end justify-around mt-4">
          <div className="flex flex-col items-center">
            <div 
              className={`w-16 ${theme === 'dark' ? 'bg-red-700' : 'bg-red-400'} rounded-t-lg transition-all duration-500`}
              style={{ height: `${getBarHeight(stats.by_status?.todo || 0)}px` }}
            ></div>
            <p className={`mt-2 text-sm ${textColor.subheader}`}>To Do</p>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className={`w-16 ${theme === 'dark' ? 'bg-yellow-700' : 'bg-yellow-400'} rounded-t-lg transition-all duration-500`}
              style={{ height: `${getBarHeight(stats.by_status?.inProgress || 0)}px` }}
            ></div>
            <p className={`mt-2 text-sm ${textColor.subheader}`}>In Progress</p>
          </div>
          <div className="flex flex-col items-center">
            <div 
              className={`w-16 ${theme === 'dark' ? 'bg-green-700' : 'bg-green-400'} rounded-t-lg transition-all duration-500`}
              style={{ height: `${getBarHeight(stats.by_status?.done || 0)}px` }}
            ></div>
            <p className={`mt-2 text-sm ${textColor.subheader}`}>Done</p>
          </div>
        </div>
      </div>

      {/* Export to CSV Button */}
      <div className="mt-4">
        <button 
          onClick={exportToCSV} 
          className={`flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          <FaDownload className="mr-2" /> Export to CSV
        </button>
      </div>
    </div>
  );
}
