import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../pages/Login/Login';
import { Statistics } from '../pages/Statistics';
import { Partnership } from '../pages/Partnership';
import { AddPartnership } from '../pages/AddPartnership';
import Profile from '../pages/Profile';
import Package from '../pages/Package';
import ProtectedRoute from '../components/dashboard/ProtectRoute';
import { SuperAdminsList } from '../components/dashboard/SuperAdminList';
import AddSuperAdmin from '../components/dashboard/AddSuperAdmin';
import ProtectEndPoint from '../components/dashboard/ProtectEndPoint';

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
      <Route
        path="/dashboard/*"
        element={
          <ProtectEndPoint>
          <DashboardLayout>
            <Routes>
              <Route path="statistics" element={<><Statistics/></>} />
              <Route path="partnership-list" element={<><Partnership/></>} />
              <Route path="add-partnership" element={<><AddPartnership/></>} />
              <Route path="profile" element={<><Profile/></>} />
              <Route path="packages" element={<><Package/></>} />
              <Route path="*" element={<NotFound />} />
              {/* Protected Route for Super Admins */}
              <Route
                path="super-admin-list"
                element={
                  <ProtectedRoute requiredType={1}>
                    <SuperAdminsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="add-super-admin"
                element={
                  <ProtectedRoute requiredType={1}>
                    <AddSuperAdmin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </DashboardLayout>
          </ProtectEndPoint>
        }
      />
      
      {/* 404 Not Found Page Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
