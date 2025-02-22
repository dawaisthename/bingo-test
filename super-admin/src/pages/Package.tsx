import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Package {
  id: string; // Add id field
  packageName: string;
  packageAmount: string;
  percent: number; // Keep percent as a number
}

const Package = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [sortOrder, setSortOrder] = useState("");
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [isAddPopupVisible, setIsAddPopupVisible] = useState(false); // State for add popup
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newPackage, setNewPackage] = useState<Package>({
    id: "0",
    packageName: "",
    packageAmount: "",
    percent: 0,
  }); 
  const [isTransferPopupVisible, setIsTransferPopupVisible] = useState(false); // Transfer popup state
  const [transferData, setTransferData] = useState({
    phonenumber: "",
    packageType: "",
  });

  useEffect(() => {
    // Fetch packages from the backend
    const fetchPackages = async () => {
      const token = localStorage.getItem('token');
      const headers = {
        Authorization: `${token}`, // Add the token to the Authorization header
        'Content-Type': 'application/json', // Ensure the content type is set
      };
      try {
        const response = await axios.get('https://backend-api.hageregnabingo.com/api/package-list', {headers});
        setPackages(response.data);
      } catch (error) {
        console.error("Error fetching package data:", error);
      }
    };

    fetchPackages();
  }, []);

  // Handle sorting
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sortValue = e.target.value;
    setSortOrder(sortValue);

    let sortedPackages = [...packages];
    if (sortValue === "alphabetic") {
      sortedPackages.sort((a, b) => a.packageName.localeCompare(b.packageName));
    } else if (sortValue === "amount") {
      sortedPackages.sort(
        (a, b) =>
          parseInt(a.packageAmount.replace(/,/g, "")) -
          parseInt(b.packageAmount.replace(/,/g, ""))
      );
    } else if (sortValue === "percent") {
      sortedPackages.sort((a, b) => a.percent - b.percent);
    }
    setPackages(sortedPackages);
  };

  const handleTransferInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setTransferData({ ...transferData, [name]: value });
  };

  // const handleTransfer = async () => {
  //   try {
  //     const transfer = await axios.post('https://backend-api.hageregnabingo.com/api/transfer-package', transferData);
  //     setIsTransferPopupVisible(false);
  //     if(transfer.status === 200){
  //       toast.success('package transfered successfuly')
  //     }else if(transfer.status === 404){
  //       toast.error('Package not found!')
  //     }
  //      else{
  //       toast.error('Unable to transfer a package.')
  //     }
  //   } catch (error) {
  //     console.error("Error transferring package:", error);
  //   }
  // };

  const handleTransfer = async () => {
    try {
      // Retrieve the token from local storage
      const token = localStorage.getItem('token');
  
      // Set up the headers for the request
      const headers = {
        Authorization: `${token}`, // Add the token to the Authorization header
        'Content-Type': 'application/json', // Ensure the content type is set
      };
  
      // Make the API request with the token in the headers
      const transfer = await axios.post('https://backend-api.hageregnabingo.com/api/transfer-package', transferData, { headers });
  
      // Close the popup
      setIsTransferPopupVisible(false);
  
      // Handle the response based on the status
      if (transfer.status === 200) {
        toast.success('Package transferred successfully');
      } else if (transfer.status === 404) {
        toast.error('Package not found!');
      } else {
        toast.error('Unable to transfer the package.');
      }
    } catch (error) {
      // Handle errors here
      if (axios.isAxiosError(error)) {
        // If the error is an Axios error, check for response
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error("Error transferring package:", error.response.data);
          toast.error(`Error: ${error.response.data.message || 'An error occurred.'}`);
        } else {
          // The request was made but no response was received
          console.error("No response from server:", error);
          toast.error('No response from server. Please try again later.');
        }
      } else {
        // Handle unexpected errors
        console.error("Unexpected error:", error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };
  
  // Handle edit click
  const handleEditClick = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsEditPopupVisible(true);
  };


  // Handle input change in the edit popup form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingPackage) {
      setEditingPackage({
        ...editingPackage,
        [name]: name === "percent" ? Number(value) : value, // Convert percent to a number
      });
    }
  };

  // Handle input change in the add popup form
  const handleNewInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPackage({
      ...newPackage,
      [name]: name === "percent" ? Number(value) : value, // Convert percent to a number
    });
  };

  // Handle update when form is submitted
  const handleUpdate = async () => {
    if (editingPackage) {
      try {
        // Retrieve the token from local storage
        const token = localStorage.getItem('token');
      
        // Set up the headers for the request
        const headers = {
          Authorization: `${token}`, // Add the token to the Authorization header
          'Content-Type': 'application/json', // Ensure the content type is set
        };
        await axios.post(`https://backend-api.hageregnabingo.com/api/update-package`, editingPackage, {headers});
        setIsEditPopupVisible(false);
        window.location.reload();
      } catch (error) {
        console.error("Error updating package:", error);
      }
    }
  };

  // Handle add new package
  const handleAdd = async () => {
     // Retrieve the token from local storage
     const token = localStorage.getItem('token');
  
     // Set up the headers for the request
     const headers = {
       Authorization: `${token}`, // Add the token to the Authorization header
       'Content-Type': 'application/json', // Ensure the content type is set
     };
    if (newPackage.packageName && newPackage.packageAmount) {
      try {
        const response = await axios.post('https://backend-api.hageregnabingo.com/api/add-package', newPackage, {headers});
        setPackages([...packages, response.data]); // Assume the response contains the added package
        setIsAddPopupVisible(false);
        setNewPackage({ id: "0", packageName: "", packageAmount: "", percent: 0 }); // Reset new package state
        window.location.reload();
      } catch (error) {
        toast.error('Unable to add package.')
      }
    }
  };

  return (
    <>
      <div>
        <ToastContainer />
        <div className="flex justify-between items-center mb-4 pt-4">
          <h2 className="text-xl text-blue-500 font-semibold">Package List</h2>
          <div className="flex gap-5">
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="border p-2 rounded-md text-sm text-gray-700"
            >
              <option value="">Sort By</option>
              <option value="alphabetic">Alphabetic</option>
              <option value="amount">Amount</option>
              <option value="percent">Percent</option>
            </select>
            <button
              onClick={() => setIsAddPopupVisible(true)} // Show add package popup
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add New Package
            </button>
            <button
              onClick={() => setIsTransferPopupVisible(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Transfer Package
            </button>
          </div>
        </div>

        <Table>
          <TableCaption>A list of packages.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Package Name</TableHead>
              <TableHead>Package Amount</TableHead>
              <TableHead>Percent</TableHead>
              <TableHead>Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg, index) => (
              <TableRow key={pkg.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-medium">{pkg.packageName}</TableCell>
                <TableCell>{pkg.packageAmount}</TableCell>
                <TableCell>{pkg.percent}</TableCell>
                <TableCell>
                  <FaEdit
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => handleEditClick(pkg)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                Total Packages: {packages.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Edit Popup Modal */}
      {isEditPopupVisible && editingPackage && (
        <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
            <h3 className="text-xl mb-4">Edit Package</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="packageName"
                value={editingPackage.packageName}
                onChange={handleInputChange}
                placeholder="Package Name"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="packageAmount"
                value={editingPackage.packageAmount}
                onChange={handleInputChange}
                placeholder="Package Amount"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="number"
                name="percent"
                value={editingPackage.percent}
                onChange={handleInputChange}
                placeholder="Percent"
                className="border p-2 rounded-md w-full"
              /> 
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Update
              </button>
              <button
                onClick={() => setIsEditPopupVisible(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Package Popup Modal */}
      {isAddPopupVisible && (
        <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
            <h3 className="text-xl mb-4">Add New Package</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="packageName"
                value={newPackage.packageName}
                onChange={handleNewInputChange}
                placeholder="Package Name"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="packageAmount"
                value={newPackage.packageAmount}
                onChange={handleNewInputChange}
                placeholder="Package Amount"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="number"
                name="percent"
                value={newPackage.percent}
                onChange={handleNewInputChange}
                placeholder="Percent"
                className="border p-2 rounded-md w-full"
              /> 
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleAdd}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add Package
              </button>
              <button
                onClick={() => setIsAddPopupVisible(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Package Popup Modal */}
      {isTransferPopupVisible && (
        <div className="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] overflow-auto font-[sans-serif]">
          <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 relative">
            <h3 className="text-xl mb-4">Transfer Package</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="phonenumber"
                value={transferData.phonenumber}
                onChange={handleTransferInputChange}
                placeholder="Recipient Phone Number"
                className="border p-2 rounded-md w-full"
              />
              <input
                type="text"
                name="packageType"
                value={transferData.packageType}
                onChange={handleTransferInputChange}
                placeholder="Package Type"
                className="border p-2 rounded-md w-full"
              />
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={handleTransfer}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Transfer
              </button>
              <button
                onClick={() => setIsTransferPopupVisible(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Package;
