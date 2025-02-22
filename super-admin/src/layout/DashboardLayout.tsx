import TopBar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";


// Dashboard Layout with Sidebar
interface ChildrenProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: ChildrenProps) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
        <TopBar />
        {/* Main Content */}
        <div className="p-4 pt-5 overflow-y-auto h-[calc(100vh-64px)]">
          <div className="flex flex-col">
            {/* Centered Infinite Scroll Animation */}
            
            {/* Children content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
