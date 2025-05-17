import React from 'react';
import { FaSearch, FaFilter, FaSort, FaTag } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

export default function TaskFilter({ 
  filters, 
  setFilters, 
  onSearch,
  onClearFilters
}) {
  const { theme } = useTheme();
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  // Theme-dependent styles
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900';
  const buttonBg = theme === 'dark' ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const iconColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-400';
  const clearBtnBg = theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700';

  return (
    <div className={`${cardBg} rounded-xl shadow-md p-4 mb-6`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="md:w-1/3">
          <form onSubmit={handleSearchSubmit} className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className={iconColor} />
              </div>
              <input
                type="text"
                value={filters.search || ''}
                onChange={handleSearchChange}
                placeholder="Search tasks..."
                className={`${inputBg} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5`}
              />
            </div>
            <button
              type="submit"
              className={`${buttonBg} text-white p-2.5 rounded-lg ml-2`}
            >
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className={`flex items-center text-sm font-medium ${textColor} mb-1`}>
              <FaFilter className="mr-1 text-blue-500" /> Status
            </label>
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleFilterChange}
              className={`${inputBg} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className={`flex items-center text-sm font-medium ${textColor} mb-1`}>
              <FaSort className="mr-1 text-blue-500" /> Priority
            </label>
            <select
              name="priority"
              value={filters.priority || ''}
              onChange={handleFilterChange}
              className={`${inputBg} text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className={`w-full ${clearBtnBg} focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
