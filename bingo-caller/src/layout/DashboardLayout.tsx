import { useState, useEffect } from "react";
import TopBar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";
import {jwtDecode} from 'jwt-decode';


// get username and branch
interface TokenPayload {
  username: string;
  branch: string;
}

interface ChildrenProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: ChildrenProps) => {
  const [username, setUsername] = useState<string>('guest');
  const [branch, setBranch] = useState<string>('guest');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);
        setUsername(decoded.username);
        setBranch(decoded.branch);
      } catch (error) {
        console.error("Failed to decode token", error);
      }
    } else {
      // Reset to guest when logged out
      setUsername('guest');
      setBranch('guest');
    }
  }, [localStorage.getItem('token')]); // this ensures re-render when token changes

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar username={username} branch={branch} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-56">
        <TopBar />

        {/* Main Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
