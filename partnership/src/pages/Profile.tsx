import { useState, useEffect } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { jwtDecode } from "jwt-decode"; // Use named import
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate(); // Used for navigation after logout

  useEffect(() => {
    const token = localStorage.getItem("token"); // Assuming the token is stored under "token"
    if (token) {
      try {
        const decodedToken: { username: string } = jwtDecode(token); // Decode token with correct method
        setUsername(decodedToken.username);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    navigate("/"); // Redirect to the homepage
  };

  return (
    <>
      <div className="">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold">Profile</h1>
          <div
            onClick={() => setIsVisible(true)}
            className="px-4 py-2 rounded-lg flex font-bold justify-center items-center gap-1 cursor-pointer hover:text-blue-600"
          >
            <h1>Logout</h1> <MdLogout />
          </div>
        </div>
        <div className="flex w-full">
          <form action="" className="w-full flex flex-col gap-10">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-20">
              <div className="flex flex-col w-full gap-3">
                <div className="flex flex-col gap-3 items-center justify-center">
                  <FaRegUserCircle className="text-[100px]" />
                  <p>@{username ? username : "username"}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {isVisible && (
        <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
            <svg
              onClick={() => setIsVisible(false)}
              xmlns="http://www.w3.org/2000/svg"
              className="w-3 cursor-pointer shrink-0 fill-gray-400 hover:fill-red-500 float-right"
              viewBox="0 0 320.591 320.591"
            >
              <path
                d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                data-original="#000000"
              ></path>
              <path
                d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                data-original="#000000"
              ></path>
            </svg>

            <div className="my-8 text-center">
              <h4 className="text-gray-800 text-lg font-semibold mt-4">
                Are you sure you want to Logout?
              </h4>
              <p className="text-sm text-gray-600 mt-4">
                Logging out will clear your session.
              </p>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleLogout} // Call handleLogout on Yes
                className="px-4 py-2 rounded-lg text-white text-sm tracking-wide bg-red-500 hover:bg-red-600 active:bg-red-500"
              >
                Yes
              </button>
              <button
                onClick={() => setIsVisible(false)} // Close the modal on No
                type="button"
                className="px-4 py-2 rounded-lg text-gray-800 text-sm tracking-wide bg-gray-200 hover:bg-gray-300 active:bg-gray-200"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
