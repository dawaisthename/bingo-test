import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaBuildingUser, FaUserGear } from "react-icons/fa6";
import logoIcon from "../../assets/images/bingo.png";
import { IoStatsChartSharp } from "react-icons/io5";
import { MdAddHomeWork } from "react-icons/md";
import { RiVipDiamondFill } from "react-icons/ri";
import { FaUsersGear } from "react-icons/fa6";
import { getUserType } from "../../utils/auth"; 
import { RiUserAddLine } from "react-icons/ri";

const Sidebar: React.FC = () => {
  const pathname = useLocation().pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [userType, setUserType] = useState<number | null>(null);

  useEffect(() => {
    const type = getUserType();
    setUserType(type);
  }, []);

  const handleTabClick = () => {
    // Close the sidebar after selecting a tab on small screens
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define sidebar tabs
  const sidebarTabs = [
    {
      name: "Statistics",
      path: "/dashboard/statistics",
      icon: <IoStatsChartSharp size={24} />,
    },
    {
      name: "Partnership List",
      path: "/dashboard/partnership-list",
      icon: <FaBuildingUser size={24} />,
    },
    {
      name: "Add Partnership",
      path: "/dashboard/add-partnership",
      icon: <MdAddHomeWork size={24} />,
    },
    {
      name: "Packages",
      path: "/dashboard/packages",
      icon: <RiVipDiamondFill size={24} />,
    },
    // Conditionally add "Super Admins" tab
    ...(userType?.toString() === "1"
      ? [
          {
            name: "Add Admin",
            path: "/dashboard/add-super-admin",
            icon: <RiUserAddLine size={24} />,
          },
          {
            name: "Super Admins",
            path: "/dashboard/super-admin-list",
            icon: <FaUsersGear size={24} />,
          },
          
        ]
      : []),
  ];

  const profileTap = [
    {
      name: "Profile",
      path: "/dashboard/profile",
      icon: <FaUserGear size={24} />,
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full justify-between bg-[#F8F8F8] z-40 transform transition-transform border-b-[#e0dede] border-solid border ${
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full"
        } md:translate-x-0 md:w-64 py-4 flex flex-col gap-16`}
      >
        <div className="flex gap-16 flex-col">
          <div className="text-2xl font-bold bg-inherit flex pr-10 justify-center items-center flex-col gap-2">
            <img src={logoIcon} alt="Logo" className="pl-6 w-36" />
            <h1 className="text-md text-blue-500 pl-2">BINGO</h1>
          </div>
          <ul className="space-y-2">
            {sidebarTabs.map((tab, index) => (
              <li
                key={index}
                className={
                  pathname === tab.path
                    ? `border-l-4 rounded-l border-blue-500`
                    : "border-l-4 rounded-l border-transparent"
                }
              >
                <Link
                  to={tab.path}
                  className={`block px-6 py-2 rounded-md cursor-pointer text-gray-700 hover:text-blue-500 ${
                    pathname === tab.path ? "text-blue-500" : ""
                  }`}
                  onClick={handleTabClick}
                >
                  <div className="flex justify-left items-center gap-4">
                    <span>{tab.icon}</span> <span>{tab.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          {profileTap.map((tab, index) => (
            <li
              key={index}
              className={
                pathname === tab.path
                  ? `border-l-4 rounded-l border-blue-500`
                  : "border-l-4 rounded-l border-transparent"
              }
            >
              <Link
                to={tab.path}
                className={`block px-6 py-2 rounded-md cursor-pointer text-gray-700 hover:text-blue-500 ${
                  pathname === tab.path ? "text-blue-500" : ""
                }`}
                onClick={handleTabClick}
              >
                <div className="flex justify-left items-center gap-4">
                  <span>{tab.icon}</span> <span>{tab.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </div>
      </div>

      {/* Overlay for small screens */}
      {isSidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Toggle Button for Mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-4 text-2xl text-gray-700 md:hidden z-50"
      >
        {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
    </>
  );
};

export default Sidebar;
