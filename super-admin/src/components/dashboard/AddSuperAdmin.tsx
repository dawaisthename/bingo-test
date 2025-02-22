import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddSuperAdmin: React.FC = () => {
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('0'); // Set initial value to '0'

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!username || !password || !email || type === '0') {
      toast.error("All fields are required, including selecting a valid type!");
      return;
    }

    try {
      // POST request to backend
      const token = localStorage.getItem('token');
      const response = await axios.post('https://backend-api.hageregnabingo.com/api/add-super-admin', {
        username,
        password,
        email,
        type
      },
      {
        headers: {
          Authorization: `${token}`, // Add token to Authorization header
        },
      });

      // Display success message
      if (response.data.status === 'accout created successfully') {
        toast.success("Super admin created successfully!");
      }
    } catch (error: any) {
      // Handle errors
      if (error.response && error.response.status === 403) {
        toast.error("Unauthorized to add super admin");
      } else if (error.response && error.response.status === 400) {
        toast.error("Bad request: Unable to create super admin");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Super Admin</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="0">Select Type</option>
              <option value="1">Super Admin(Owner)</option>
              <option value="2">Regular Admin</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg font-semibold hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            Add Super Admin
          </button>
        </form>
        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default AddSuperAdmin;
