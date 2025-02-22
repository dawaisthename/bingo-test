import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import axios from "axios"; // Import axios for API calls
import { ToastContainer, toast } from "react-toastify"; // To show success/error messages
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles

export function CreateUserTab() {
  const [tabValue, setTabValue] = useState("userinfo");
  const [formData, setFormData] = useState({
    phoneNumber: "",
    branch: "",
    location: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Validation for passwords
  const validatePasswords = () => {
    return formData.password === formData.confirmPassword;
  };

  const handleNext = () => {
    setTabValue("createAccount");
  };

  // Handle form submission to backend
  const handleFinish = async () => {
    // Check if passwords match
    if (!validatePasswords()) {
      toast.error("Passwords do not match!"); // Show error if passwords don't match
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage

      // Send data to backend
      await axios.post(
        "https://backend-api.hageregnabingo.com/api/add-caller",
        {
          username: formData.username,
          phone: formData.phoneNumber,
          branch_name: formData.branch,
          location: formData.location,
          password: formData.password,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      toast.success("User created successfully!"); // Show success message
      // Optionally, reset the form after submission
      setFormData({
        phoneNumber: "",
        branch: "",
        location: "",
        username: "",
        password: "",
        confirmPassword: "",
      });
      setTabValue("userinfo"); // Reset tab to userinfo after success
    } catch (error) {
      toast.error("Failed to create user!"); // Show error message if API fails
    }
  };

  return (
    <Tabs value={tabValue} onValueChange={setTabValue} className="w-full p-5">
      <ToastContainer /> {/* Toast container for displaying messages */}
      <TabsList className="grid w-full grid-cols-2 gap-2">
        <TabsTrigger value="userinfo">User info</TabsTrigger>
        <TabsTrigger value="createAccount">Create account</TabsTrigger>
      </TabsList>

      {/* User Info Tab */}
      <TabsContent value="userinfo">
        <Card>
          <CardHeader>
            <CardTitle>User Info</CardTitle>
            <CardDescription>
              Provide user information. Click next when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-blue-500 hover:bg-blue-600 w-28" onClick={handleNext}>
              Next
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* Create Account Tab */}
      <TabsContent value="createAccount">
        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Create user account. Click finish when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="bg-blue-500 hover:bg-blue-600 w-28"
              onClick={handleFinish}
            >
              Finish
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
