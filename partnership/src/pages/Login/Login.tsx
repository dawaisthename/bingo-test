import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
} from "@mui/material";
import Image from "../../assets/images/bingo.png";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import { MdVisibilityOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";  // Import useNavigate for navigation
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading,setIsLoading] = useState(false)
  const navigate = useNavigate(); // Hook for navigation

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  // Handle the login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault();
    try {
      const response = await axios.post("https://backend-api.hageregnabingo.com/api/partnership-login", {
        username,
        password,
      });

      // On success, extract the token and store it in localStorage
      const { token } = response.data;
      localStorage.setItem("token", token);  // Store the token

      // Show success message and navigate to /dashboard/statistics
      toast.success("Login successful!");
      setTimeout(() => {
        navigate("/dashboard/statistics");
      }, 1500);  // Wait for 1.5 seconds before redirecting
    } catch (error: any) {
      // Handle errors, display the appropriate message
      if (error.response && error.response.status === 401) {
        toast.error("Invalid credentials, please try again.");
      }else if (error.response && error.response.status === 403) {
        toast.error("Your account is deactivated!");
        setTimeout(() => {
          navigate("/login/deactivated");
        }, 1500);
      }  else if (error.response && error.response.status === 404) {
        toast.error("Invalid credentials, please try again.");
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    }
    setIsLoading(false)
  };

  return (
    <div className="flex h-screen items-center px-5 lg:px-10">
      <ToastContainer /> {/* Toast container for displaying messages */}
      <div className="lg:flex flex-1 hidden flex-col justify-center items-center gap-10 ">
        <h1 className="text-3xl font-bold"></h1>
        <img src={Image} alt="" className="w-3/4" />
      </div>
      <div className="flex flex-1 flex-col justify-center items-center">
        <div className="flex lg:px-20 flex-col w-full gap-10">
          <h1 className="text-xl md:text-3xl font-bold text-gray-600">
            Sign in to Speed Games!
          </h1>
          <div className="flex gap-5 justify-center items-center">
            <div className="flex flex-1 w-full h-[1px] bg-gray-300"></div>
            <div className="flex  justify-center items-center text-gray-600">
              Login
            </div>
            <div className="flex flex-1 w-full h-[1px] bg-gray-300"></div>
          </div>
          <form className="flex flex-col w-full gap-5" onSubmit={handleSubmit}>
            <TextField
              id="outlined-basic"
              label="Username"
              variant="outlined"
              className="w-full"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}  // Update username state
            />
            <FormControl variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password" required>
                Password
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}  // Update password state
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                      edge="end"
                    >
                      {showPassword ? <MdVisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                label="Password"
              />
            </FormControl>
            {isLoading ? (
              <Button
                variant="contained"
                size="large"
                className=""
              >
                <div className="h-6 w-6 border-2 rounded-full border-white bg-transparent border-t-0 animate-spin"></div>
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                className=""
                type="submit"
              >
                <h1 className="capitalize font-bold">Login</h1>
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
