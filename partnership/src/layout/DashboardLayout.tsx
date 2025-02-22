import TopBar from "../components/dashboard/Topbar";
import Sidebar from "../components/dashboard/Sidebar";

interface ChildrenProps{
    children:React.ReactNode
}
const DashboardLayout = ({children}:ChildrenProps) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64">
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
