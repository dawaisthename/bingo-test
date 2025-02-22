import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "../ui/table";
  import { FaEdit, FaTrash } from "react-icons/fa"; // Importing React edit and delete icons
  import { useEffect, useState } from "react";
  import axios from "axios"; // Axios for API requests
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  
  interface User {
    _id: string;
    username: string;
    createdAt: string;
    branch_name: string;
    location: string;
    phone: string; // Added phone number
  }
  
  export function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [sortOrder, setSortOrder] = useState("");
    const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
      new_username: "",
      new_password: "",
      new_branch_name: "",
      new_location: "",
    });
  
    // Fetch user data from the API
    // Fetch user data from the API
    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage

            const response = await axios.get("https://backend-api.hageregnabingo.com/api/caller-list", {
            headers: {
                Authorization: token,
            },
            });
            setUsers(response.data); // Set the users data from the response
        } catch (error: any) {
            console.error("Error fetching users data:", error);
            toast.error("Failed to fetch users data. " + (error.response?.data?.message || error.message));
        }
        };
        fetchUsers();
    }, []);
  
    // Handle sorting
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const sortValue = e.target.value;
      setSortOrder(sortValue);
  
      let sortedUsers = [...users];
      if (sortValue === "newest") {
        sortedUsers.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (sortValue === "oldest") {
        sortedUsers.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      } else if (sortValue === "alphabetic") {
        sortedUsers.sort((a, b) => a.username.localeCompare(b.username));
      }
      setUsers(sortedUsers);
    };
  
    // Handle edit click
    const handleEditClick = (user: User) => {
      setEditingUser(user);
      setFormData({
        new_username: user.username,
        new_password: "", // leave empty initially
        new_branch_name: user.branch_name,
        new_location: user.location,
      });
      setIsEditPopupVisible(true);
    };
  
    // Handle delete click
    const handleDeleteClick = async (userId: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        try {
          const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  
          await axios.post(
            "https://backend-api.hageregnabingo.com/api/delete-caller",
            { caller_id: userId },
            {
              headers: {
                Authorization: token,
              },
            }
          );
          setUsers(users.filter(user => user._id !== userId)); // Remove the deleted user from the list
          toast.success("User deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete user.");
        }
      }
    };
  
    // Handle input change in the popup form
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };
  
    // Handle update when form is submitted
    const handleUpdate = async () => {
      if (editingUser) {
        try {
          const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
  
          await axios.post(
            "https://backend-api.hageregnabingo.com/api/edit-caller",
            {
              _id: editingUser._id,
              new_username: formData.new_username,
              new_password: formData.new_password,
              new_branch_name: formData.new_branch_name,
              new_location: formData.new_location,
            },
            {
              headers: {
                Authorization: token,
              },
            }
          );
          const updatedUsers = users.map((u) =>
            u._id === editingUser._id
              ? { ...u, ...formData, createdAt: u.createdAt } // Keep createdAt unchanged
              : u
          );
          setUsers(updatedUsers); // Update the state with the modified user
          toast.success("User updated successfully!");
          setIsEditPopupVisible(false); // Hide the popup
        } catch (error) {
          toast.error("Failed to update user.");
        }
      }
    };
  
    return (
      <div>
        <ToastContainer /> {/* Toast container for displaying messages */}
        <div className="flex justify-between items-center mb-4 pt-4">
          <h2 className="text-xl text-blue-500 font-semibold">Users List</h2>
          <select
            className="border px-3 py-1 rounded bg-inherit text-sm"
            value={sortOrder}
            onChange={handleSortChange}
          >
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetic">Alphabetic</option>
          </select>
        </div>
  
        <Table>
          <TableCaption>A list of users.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Branch Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Phone Number</TableHead> {/* Added phone number column */}
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead> {/* Added delete column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{user.branch_name}</TableCell>
                <TableCell>{user.location}</TableCell>
                <TableCell>{user.phone}</TableCell> {/* Displaying phone number */}
                <TableCell>
                  <FaEdit
                    className="cursor-pointer hover:text-blue-500 hover:text-[15px]"
                    onClick={() => handleEditClick(user)}
                  />
                </TableCell>
                <TableCell>
                  <FaTrash
                    className="cursor-pointer hover:text-red-500 hover:text-[15px]"
                    onClick={() => handleDeleteClick(user._id)} // Added delete functionality
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>Total Users: {users.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
  
        {/* Edit Popup Modal */}
        {isEditPopupVisible && editingUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-7 rounded-md w-96">
              <h3 className="text-xl mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-md">Username</label>
                  <input
                    name="new_username"
                    value={formData.new_username}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded-sm text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-md">Branch Name</label>
                  <input
                    name="new_branch_name"
                    value={formData.new_branch_name}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded-sm text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-md">Location</label>
                  <input
                    name="new_location"
                    value={formData.new_location}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded-sm text-sm text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-md">Password</label>
                  <input
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    className="border p-2 w-full rounded-sm text-sm text-gray-700"
                    type="password"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditPopupVisible(false)}
                  className="px-4 py-2 bg-red-500 rounded text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  