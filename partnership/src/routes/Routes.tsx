import React from 'react';
import { Route, Routes} from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../pages/Login/Login';
import { Statistics } from '../pages/Statistics';
import { Users } from '../pages/Users';
import { AddUser } from '../pages/AddUser';
import { Sales } from '../pages/Sales';
import { Cartella } from '../pages/Cartella';
import Profile from '../pages/Profile';
import ProtectedRoute from '../components/dashboard/ProtectedRoute';
import { Deactivated } from '../pages/Login/Deactivated';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Page Not Found</p>
      <a href="/" className="mt-6 px-4 py-2 bg-blue-500 text-white rounded">
        Go to Home
      </a>
    </div>
  );
};

const Router: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/login/deactivated" element={<Deactivated />} />
      {/* <Route path="/cartella" element={<><Cartella/></>} /> */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route path="statistics" element={<><Statistics/></>} />
              <Route path="users-list" element={<><Users/></>} />
              <Route path="add-user" element={<><AddUser/></>} />
              <Route path="sales" element={<><Sales/></>} />
              <Route path="cartella" element={<><Cartella/></>} />
              <Route path="profile" element={<><Profile/></>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      {/* 404 Not Found Page Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
