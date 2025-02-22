import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { FaEdit, FaTrash } from "react-icons/fa"; // Importing React icons
import { useState, useEffect } from "react";
import axios from "axios"; // Make sure to install axios

interface Partnership {
  _id: string; // Adding _id field
  username: string; // Added username
  joinedDate: string; // Changed to match your backend
  password: string;
  confirm_password: string;
  type: number;
}

export function SuperAdminsList() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [sortOrder, setSortOrder] = useState("");
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [editingPartnership, setEditingPartnership] = useState<Partnership | null>(null);
  const [partnershipToDelete, setPartnershipToDelete] = useState<string | null>(null);

  // Fetch partnerships data from the backend
  useEffect(() => {
      const fetchPartnerships = async () => {
          const token = localStorage.getItem("token"); // Retrieve token from local storage
          const response = await axios.get("https://backend-api.hageregnabingo.com/api/super-admin-list", {
              headers: {
                  Authorization: token,
              },
          });
          const data = response.data.map((partnership: any) => ({
              _id: partnership._id,
              username: partnership.username,
              joinedDate: new Date(partnership.createdAt).toLocaleDateString(), // Format the date
              type: partnership.type,
          }));
          setPartnerships(data);
      };

      fetchPartnerships();
  }, []);

  // Handle sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const sortValue = e.target.value;
      setSortOrder(sortValue);

      let sortedPartnerships = [...partnerships];
      if (sortValue === "newest") {
          sortedPartnerships.sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime());
      } else if (sortValue === "oldest") {
          sortedPartnerships.sort((a, b) => new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime());
      } else if (sortValue === "alphabetic") {
          sortedPartnerships.sort((a, b) => a.username.localeCompare(b.username));
      }
      setPartnerships(sortedPartnerships);
  };

  // Handle edit click
  const handleEditClick = (partnership: Partnership) => {
      setEditingPartnership(partnership);
      setIsEditPopupVisible(true);
  };

  // Handle input change in the popup form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (editingPartnership) {
          setEditingPartnership({
              ...editingPartnership,
              [e.target.name]: e.target.value,
          });
      }
  };

  // Handle update when form is submitted
  const handleUpdate = async () => {
      if (editingPartnership) {
          try {
              const token = localStorage.getItem("token"); // Retrieve token from local storage
              await axios.post(
                  "https://backend-api.hageregnabingo.com/api/update-super-admin-pwd",
                  {
                      _id: editingPartnership._id,
                      new_password: editingPartnership.password,
                      confirm_password: editingPartnership.confirm_password,
                  },
                  {
                      headers: {
                          Authorization: token, // Include token in request headers
                      },
                  }
              );
              setPartnerships((prevPartnerships) =>
                  prevPartnerships.map((p) => (p._id === editingPartnership._id ? editingPartnership : p))
              );
              setIsEditPopupVisible(false);
          } catch (error) {
              console.error("Error updating partnership:", error);
          }
      }
  };

  // Handle delete confirmation
  const handleDeleteClick = (partnershipId: string) => {
      setPartnershipToDelete(partnershipId);
      setIsDeletePopupVisible(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
      if (partnershipToDelete) {
          try {
              const token = localStorage.getItem("token"); // Retrieve token from local storage
              await axios.post(
                  "https://backend-api.hageregnabingo.com/api/delete-super-admin",
                  { superadmin_id: partnershipToDelete },
                  {
                      headers: {
                          Authorization: token, // Include token in request headers
                      },
                  }
              );
              setPartnerships((prevPartnerships) => prevPartnerships.filter((p) => p._id !== partnershipToDelete));
              setIsDeletePopupVisible(false);
              setPartnershipToDelete(null);
          } catch (error) {
              console.error("Error deleting partnership:", error);
          }
      }
  };

  return (
      <div>
          <div className="flex justify-between items-center mb-4 pt-4">
              <h2 className="text-xl text-blue-500 font-semibold">Partnership List</h2>
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
              <TableCaption>A list of partnerships.</TableCaption>
              <TableHeader>
                  <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Edit</TableHead>
                      <TableHead>Delete</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {partnerships.map((partnership) => (
                      <TableRow key={partnership._id}>
                          <TableCell>{partnership.username}</TableCell> {/* Displaying Username */}
                          <TableCell>{partnership.joinedDate}</TableCell>
                          <TableCell className={partnership.type === 1 ? "text-green-500" : "text-blue-500"}>
                              {partnership.type.toString() === "1" ? "Owner" : "super-admin"}
                          </TableCell>
                          <TableCell>
                              <FaEdit className="cursor-pointer hover:text-blue-500 hover:text-[15px]" onClick={() => handleEditClick(partnership)} />
                          </TableCell>
                          <TableCell>
                              <FaTrash className="cursor-pointer hover:text-red-500 hover:text-[15px]" onClick={() => handleDeleteClick(partnership._id)} />
                          </TableCell>
                      </TableRow>
                  ))}
              </TableBody>
              <TableFooter>
                  <TableRow>
                      <TableCell colSpan={10}>Total Super Admins: {partnerships.length}</TableCell>
                  </TableRow>
              </TableFooter>
          </Table>

          {/* Edit Popup Modal */}
          {isEditPopupVisible && editingPartnership && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-7 rounded-md w-96">
                      <h3 className="text-xl mb-4">Change password</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-md">Username</label>
                              <input
                                  name="username"
                                  value={editingPartnership.username}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                                  disabled={true}
                              />
                          </div>
                          <div>
                              <label className="block text-md">Password</label>
                              <input
                                  name="confirm_password"
                                  value={editingPartnership.confirm_password}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              />
                          </div>
                      </div>
                      <div className="flex justify-end mt-4">
                          <button onClick={handleUpdate} className="bg-blue-500 text-white py-1 px-4 rounded mr-2">Update</button>
                          <button onClick={() => setIsEditPopupVisible(false)} className="bg-gray-300 text-black py-1 px-4 rounded">Cancel</button>
                      </div>
                  </div>
              </div>
          )}

          {/* Delete Confirmation Popup */}
          {isDeletePopupVisible && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-7 rounded-md w-96">
                      <h3 className="text-xl mb-4">Confirm Delete</h3>
                      <p>Are you sure you want to delete this partnership?</p>
                      <div className="flex justify-end mt-4">
                          <button onClick={confirmDelete} className="bg-red-500 text-white py-1 px-4 rounded mr-2">Yes</button>
                          <button onClick={() => setIsDeletePopupVisible(false)} className="bg-gray-300 text-black py-1 px-4 rounded">No</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
}
