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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Partnership {
  _id: string;
  partnership_name: string;
  username: string; 
  joinedDate: string; 
  phone: string;
  location: string;
  currentBalance: string;
  status: number;
  percent: string;
}

export function PartnershipList() {
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
          const response = await axios.get("https://backend-api.hageregnabingo.com/api/partnership-list", {
              headers: {
                  Authorization: token, // Include token in request headers
              },
          });
          const data = response.data.map((partnership: any) => ({
              _id: partnership._id,
              partnership_name: partnership.partnership_name,
              username: partnership.username,
              joinedDate: new Date(partnership.createdAt).toLocaleDateString(), // Format the date
              phone: partnership.phone,
              location: partnership.location,
              percent: partnership.percent,
              currentBalance: partnership.totalBalance,
              status: partnership.status,
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
          sortedPartnerships.sort((a, b) => a.partnership_name.localeCompare(b.partnership_name));
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
                  "https://backend-api.hageregnabingo.com/api/edit-partnership",
                  {
                      _id: editingPartnership._id,
                      new_partnership_name: editingPartnership.partnership_name,
                      new_phone: editingPartnership.phone,
                      new_location: editingPartnership.location,
                      new_status: editingPartnership.status,
                      new_percent: editingPartnership.percent,
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
              toast.success('User updated successfully!')
              window.location.reload();
          } catch (error) {
              toast.error('Unable to update user!')
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
                  "https://backend-api.hageregnabingo.com/api/delete-partnership",
                  { partnership_id: partnershipToDelete },
                  {
                      headers: {
                          Authorization: token, // Include token in request headers
                      },
                  }
              );
              setPartnerships((prevPartnerships) => prevPartnerships.filter((p) => p._id !== partnershipToDelete));
              setIsDeletePopupVisible(false);
              setPartnershipToDelete(null);
              toast.success('User deleted successfully!')
          } catch (error) {
              toast.error("Unable to delete partnership!");
          }
      }
  };

  return (
      <div>
        <ToastContainer />
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
                      <TableHead>Fullname</TableHead>
                      <TableHead>Username</TableHead> {/* New Username Column */}
                      <TableHead>Joined Date</TableHead>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total Balance</TableHead>
                      <TableHead>Percent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Edit</TableHead>
                      <TableHead>Delete</TableHead> {/* New Delete Column */}
                  </TableRow>
              </TableHeader>
              <TableBody>
                  {partnerships.map((partnership) => (
                      <TableRow key={partnership._id}>
                          <TableCell className="font-medium">{partnership.partnership_name}</TableCell>
                          <TableCell>{partnership.username}</TableCell> {/* Displaying Username */}
                          <TableCell>{partnership.joinedDate}</TableCell>
                          <TableCell>{partnership.phone}</TableCell>
                          <TableCell>{partnership.location}</TableCell>
                          <TableCell>{partnership.currentBalance}</TableCell>
                          <TableCell>{partnership.percent}</TableCell>
                          <TableCell className={partnership.status === 1 ? "text-green-500" : "text-red-500"}>
                              {partnership.status === 1 ? "Active" : "Inactive"}
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
                      <TableCell colSpan={10}>Total Partnerships: {partnerships.length}</TableCell>
                  </TableRow>
              </TableFooter>
          </Table>

          {/* Edit Popup Modal */}
          {isEditPopupVisible && editingPartnership && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-7 rounded-md w-96">
                      <h3 className="text-xl mb-4">Edit Partnership</h3>
                      <div className="space-y-4">
                          <div>
                              <label className="block text-md">Fullname</label>
                              <input
                                  name="partnership_name"
                                  value={editingPartnership.partnership_name}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-md">Phone Number</label>
                              <input
                                  name="phone"
                                  value={editingPartnership.phone}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-md">Location</label>
                              <input
                                  name="location"
                                  value={editingPartnership.location}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-md">Percent</label>
                              <input
                                  name="percent"
                                  value={editingPartnership.percent}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              />
                          </div>
                          <div>
                              <label className="block text-md">Status</label>
                              <select
                                  name="status"
                                  value={editingPartnership.status}
                                  onChange={handleInputChange}
                                  className="border p-2 w-full rounded-sm text-sm text-gray-700"
                              >
                                  <option value="1">Active</option>
                                  <option value="0">Inactive</option>
                              </select>
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
