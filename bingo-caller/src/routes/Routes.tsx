import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layout/DashboardLayout';
import Login from '../pages/Login/Login';
import { Cartella } from '../pages/Cartella';
import SelectCartella from '../components/cartella/SelectCartella';
import Logout from '../components/cartella/Logout';
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
      <Route path="/" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/login/deactivated" element={<Deactivated />} />

      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="bingo" element={<Cartella />} />
                <Route path="select-cartella" element={<SelectCartella />} />
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
