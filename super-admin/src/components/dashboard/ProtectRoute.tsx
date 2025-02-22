import React from "react";
import { Navigate } from "react-router-dom";
import { getUserType } from "../../utils/auth";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredType: number; // e.g., 1 for super admins
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredType,
}) => {
  const userType = getUserType()?.toString();

  if (userType?.toString() === requiredType.toString()) {
    // console.log(userType, requiredType)
    return children;
  } else {
    return <Navigate to="/404" replace />; // Redirect to 404 page
  }
};

export default ProtectedRoute;