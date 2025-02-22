import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import userLogo from "../../assets/images/userlogo.png";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaGooglePlay } from "react-icons/fa";

const sidebarTabs = [
  {
    name: "Bingo Play",
    path: "bingo",
    icon: <FaGooglePlay size={24} />,
  },
];

const profileTap = [
  {
    name: "Logout",
    path: "/logout",
  },
];

interface TokenPayload {
  username: string;
  branch: string;
}

const Sidebar = ({username, branch}: TokenPayload) => {
  const pathname = useLocation().pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  console.log(pathname);
  const handleTabClick = () => {
    // Close the sidebar after selecting a tab on small screens
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full justify-between bg-[#F8F8F8]  z-40 transform transition-transform border-b-[#e0dede] border-solid border ${
          isSidebarOpen ? "translate-x-0 w-56" : "-translate-x-full"
        } md:translate-x-0 md:w-56 pb-4 flex flex-col gap-16`}
      >
        <div className="flex gap-5 flex-col ">
          <div className="text-2xl font-bold  bg-inherit flex pr-10 justify-center items-center flex-col gap-2"></div>
          <div className="icon w-12 ml-4 mb-10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
              viewBox="0 0 512 512"
            >
              <defs>
                <linearGradient
                  id="BG1"
                  x1="100%"
                  x2="50%"
                  y1="9.946%"
                  y2="50%"
                >
                  <stop offset="0%" stop-color="#103996"></stop>
                  <stop offset="100%" stop-color="#2065D1"></stop>
                </linearGradient>
                <linearGradient id="BG2" x1="50%" x2="50%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#76B0F1"></stop>
                  <stop offset="100%" stop-color="#2065D1"></stop>
                </linearGradient>
                <linearGradient id="BG3" x1="50%" x2="50%" y1="0%" y2="100%">
                  <stop offset="0%" stop-color="#76B0F1"></stop>
                  <stop offset="100%" stop-color="#2065D1"></stop>
                </linearGradient>
              </defs>
              <g
                fill="#2065D1"
                fill-rule="evenodd"
                stroke="none"
                stroke-width="1"
              >
                <path
                  fill="url(#BG1)"
                  d="M183.168 285.573l-2.918 5.298-2.973 5.363-2.846 5.095-2.274 4.043-2.186 3.857-2.506 4.383-1.6 2.774-2.294 3.939-1.099 1.869-1.416 2.388-1.025 1.713-1.317 2.18-.95 1.558-1.514 2.447-.866 1.38-.833 1.312-.802 1.246-.77 1.18-.739 1.111-.935 1.38-.664.956-.425.6-.41.572-.59.8-.376.497-.537.69-.171.214c-10.76 13.37-22.496 23.493-36.93 29.334-30.346 14.262-68.07 14.929-97.202-2.704l72.347-124.682 2.8-1.72c49.257-29.326 73.08 1.117 94.02 40.927z"
                ></path>
                <path
                  fill="url(#BG2)"
                  d="M444.31 229.726c-46.27-80.956-94.1-157.228-149.043-45.344-7.516 14.384-12.995 42.337-25.267 42.337v-.142c-12.272 0-17.75-27.953-25.265-42.337C189.79 72.356 141.96 148.628 95.69 229.584c-3.483 6.106-6.828 11.932-9.69 16.996 106.038-67.127 97.11 135.667 184 137.278V384c86.891-1.611 77.962-204.405 184-137.28-2.86-5.062-6.206-10.888-9.69-16.994"
                ></path>
                <path
                  fill="url(#BG3)"
                  d="M450 384c26.509 0 48-21.491 48-48s-21.491-48-48-48-48 21.491-48 48 21.491 48 48 48"
                ></path>
              </g>
            </svg>
          </div>
          <div className="user flex gap-2 p-2 bg-gray-200 justify-left items-center rounded-md">
            <div className="image rounded-[50%] bg-gray-400 p-2 w-14 h-14">
              <img src={userLogo} alt="" className="h-12 w-12 rounded-full" />
            </div>
            <div className="userinfo">
              <b>@{username}</b>
              <p>{branch}</p>
            </div>
          </div>
          <ul className="space-y-2 pt-4">
            {sidebarTabs.map((tab, index) => (
              <li
                key={index}
                className={
                  pathname === tab.path
                    ? ` border-l-4 rounded-l border-blue-500`
                    : "border-l-4 rounded-l border-transparent"
                }
              >
                <Link
                  to={tab.path}
                  className={`block px-4 py-3 rounded-md cursor-pointer bg-gray-200 text-gray-700 hover:text-blue-500 ${
                    pathname === tab.path ? "text-blue-500" : ""
                  }`}
                  onClick={() => handleTabClick()}
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
                  ? ` border-l-4 rounded-l border-blue-500`
                  : "border-l-4 rounded-l border-transparent"
              }
            >
              <Link
                to={tab.path}
                className={`block px-6 py-2 rounded-md cursor-pointer text-gray-700 hover:text-blue-500 ${
                  pathname === tab.path ? "text-blue-500" : ""
                }`}
                onClick={() => handleTabClick()}
              >
                <div className="flex justify-center items-center gap-4 bg-blue-500 text-white p-1 rounded-sm">
                  <p className="text-center">{tab.name}</p>
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
