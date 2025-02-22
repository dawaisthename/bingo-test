import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosResponse } from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// load API_URL
let API_URL: string = 'https://backend-api.hageregnabingo.com';


// Define the Package interface
interface Package {
  packageName: string;
  balance: number;
  percent: number;
}

const SelectCartella: React.FC = () => {
  // State variables for fetched data
  const [packages, setPackages] = useState<Package[]>([]);
  const [cartellaNumbers, setCartellaNumbers] = useState<number[]>([]);
  // const [cartellaNumbers, setCartellaNumbers]: any = useState([])
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State variables for user interactions
  const [selectedBoxes, setSelectedBoxes] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [inputValue2, setInputValue2] = useState<string>("");
  const [cartellaPrice, setCartellaPrice] = useState<string>("");
  const [percent, setPercent] = useState<string>("");
  const [players, setPlayers] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>("");

  const navigate = useNavigate();

  /**
   * Fetch packages and cartella numbers from the backend.
   * This effect runs once when the component mounts.
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null); // Reset error state before fetching

      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        // Make both requests in parallel
        const [packagesResponse, cartellaResponse]: AxiosResponse[] = await Promise.all([
          axios.get<Package[]>(`${API_URL}/api/packages-list`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
          axios.get<number[]>(`${API_URL}/api/cartella-numbers`, {
            headers: {
              Authorization: `${token}`,
            },
          }),
        ]);

        // Validate and set packages
        if (Array.isArray(packagesResponse.data)) {
          setPackages(packagesResponse.data);
        } else {
          throw new Error('Invalid data format for packages.');
        }

        // Validate and set cartellaNumbers
        if (Array.isArray(cartellaResponse.data.cartellaNumberArray)) {
          setCartellaNumbers(cartellaResponse.data.cartellaNumberArray);
        } else {
          throw new Error('Invalid data format for cartella numbers.');
        }
      } catch (err: any) {
        // Handle errors appropriately
        if (err.response) {
          // Server responded with a status other than 2xx
          setError(err.response.data.message || 'An error occurred while fetching data.');
        } else if (err.request) {
          // Request was made but no response received
          setError('No response received from the server.');
        } else {
          // Something else happened
          setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Load data from localStorage when the component mounts.
   */
  useEffect(() => {
    const savedBoxes = JSON.parse(localStorage.getItem("selectedBoxes") || "[]") as number[];
    const savedPrice = localStorage.getItem("cartellaPrice") || "";
    const savedPercent = localStorage.getItem("percent") || "";
    const savedPlayers = Number(localStorage.getItem("players") || "0");
    const savedPackage = localStorage.getItem("selectedPackage") || "";

    // Update state only if we have saved values
    if (savedBoxes.length > 0) setSelectedBoxes(savedBoxes);
    if (savedPrice) setCartellaPrice(savedPrice);
    if (savedPercent) setPercent(savedPercent);
    if (savedPackage) setSelectedPackage(savedPackage);
    setPlayers(savedPlayers);
  }, []);

  /**
   * Save selected boxes and players to localStorage whenever selectedBoxes state changes.
   */
  useEffect(() => {
    if (selectedBoxes.length > 0) {
      localStorage.setItem("selectedBoxes", JSON.stringify(selectedBoxes));
      localStorage.setItem("players", selectedBoxes.length.toString());
      setPlayers(selectedBoxes.length); // Update players count
    } else {
      // If no boxes are selected, remove from localStorage
      localStorage.removeItem("selectedBoxes");
      localStorage.setItem("players", "0");
      setPlayers(0);
    }
  }, [selectedBoxes]);

  /**
   * Handler when a box is clicked.
   * Toggles the selection of a cartella number.
   */
  const handleBoxClick = (boxNumber: number) => {
    setSelectedBoxes((prevSelectedBoxes) =>
      prevSelectedBoxes.includes(boxNumber)
        ? prevSelectedBoxes.filter((num) => num !== boxNumber) // Remove if already selected
        : [...prevSelectedBoxes, boxNumber] // Add if not selected
    );
  };

  /**
   * Handler for input value changes.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue2(e.target.value);
  };

  /**
   * Handler for cartella price input changes.
   */
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCartellaPrice(e.target.value);
  };

  /**
   * Handler for percentage selection changes.
   */
  const handlePercentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPercent(e.target.value);
  };

  /**
   * Handler for package selection changes.
   */
  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPackageName = e.target.value;
    setSelectedPackage(selectedPackageName);

    // Find the selected package
    const selectedPkg = packages.find((pkg) => pkg.packageName === selectedPackageName);

    if (selectedPkg) {
      // Save selected package and balance to localStorage
      localStorage.setItem("selectedPackage", selectedPackageName);
      localStorage.setItem("selectedPackageBalance", selectedPkg.balance.toString());
    } else {
      // If no package is selected, remove related items from localStorage
      localStorage.removeItem("selectedPackage");
      localStorage.removeItem("selectedPackageBalance");
    }
  };

  /**
   * Handler to save cartella settings.
   * Validates inputs and navigates to the dashboard if successful.
   */
  const handleSave = () => {
    const price = parseFloat(cartellaPrice);
    const percentage = parseFloat(percent);

    // Input validations
    if (isNaN(price) || price <= 0) {
      toast.error("Please enter a valid cartella price.");
      return;
    }

    if (isNaN(percentage) || percentage <= 0) {
      toast.error("Please select a valid percentage.");
      return;
    }

    // Get the selected package's balance
    const selectedPkg = packages.find((pkg) => pkg.packageName === selectedPackage);

    if (selectedPkg) {
      const requiredBalance = price * (percentage / 100);

      // Check if the selected package's balance is enough
      if (selectedPkg.balance >= requiredBalance) {
        // Save to localStorage
        localStorage.setItem("cartellaPrice", cartellaPrice);
        localStorage.setItem("percent", percent);
        localStorage.setItem("players", selectedBoxes.length.toString());
        toast.success("Cartella settings saved!");
        navigate('/dashboard/bingo');
      } else {
        toast.error(
          `Insufficient balance! The selected package (${selectedPkg.packageName}) has a balance of ${selectedPkg.balance}, but ${requiredBalance} is needed.`
        );
      }
    } else {
      toast.error("Please select a package.");
    }
  };

  /**
   * Handler to clear all selected cartellas and form data.
   */
  const clearCartella = () => {
    setSelectedBoxes([]);
    setCartellaPrice("");
    setPercent("");
    setSelectedPackage("");
    localStorage.removeItem("selectedBoxes");
    localStorage.removeItem("cartellaPrice");
    localStorage.removeItem("percent");
    localStorage.removeItem("players");
    localStorage.removeItem("selectedPackage");
    localStorage.removeItem("selectedPackageBalance");
  };

  /**
   * Handler to add a new cartella from the input field.
   */
  const handleAddCartella = (e: React.FormEvent) => {
      e.preventDefault();
    
    const newCartella = parseInt(inputValue, 10);

    if (isNaN(newCartella)) {
      toast.error("Please enter a valid cartella number.");
      return;
    }

    if (!cartellaNumbers.includes(newCartella)) {
      toast.error(`Cartella number ${newCartella} is not in the cartella list!`);
      return;
    }

    if (selectedBoxes.includes(newCartella)) {
      toast.error(`Cartella number ${newCartella} is already selected!`);
      return;
    }

    setSelectedBoxes([...selectedBoxes, newCartella]);
    setInputValue("");
  };

  /**
   * Handler to remove a cartella from the input field.
   */
  const handleRemoveCartella = (e: React.FormEvent) => {
    e.preventDefault();
  
    const cartellaToRemove = parseInt(inputValue2, 10); // Parse the input to get the cartella number
  
    if (isNaN(cartellaToRemove)) {
      toast.error("Please enter a valid cartella number.");
      return;
    }
  
    if (!selectedBoxes.includes(cartellaToRemove)) {
      toast.error(`Cartella number ${cartellaToRemove} is not currently selected!`);
      return;
    }
  
    // Filter out the cartella number from selectedBoxes
    const updatedSelectedBoxes = selectedBoxes.filter(
      (number) => number !== cartellaToRemove
    );
  
    setSelectedBoxes(updatedSelectedBoxes); // Update the selectedBoxes state
    setInputValue2(""); // Clear the input field
  };
  



  /**
   * Render loading state.
   */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading data...</p>
      </div>
    );
  }

  /**
   * Render error state.
   */
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  /**
   * Main render of the component.
   */
  return (
    <div className="flex flex-col items-left gap-4 p-4">
      <ToastContainer />
      {/* Controls Section */}
      <div className="flex justify-evenly w-full items-center gap-2 flex-wrap">
        {/* Package Selection */}
        <div>
          <select
            id="package"
            name="package"
            className="block w-40 p-2 text-base bg-gray-900 text-white rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={selectedPackage}
            onChange={handlePackageChange}
          >
            <option value="" className="bg-gray-200 text-black" disabled>
              Select a package
            </option>
            {packages.map((pkg) => (
              <option
                key={pkg.packageName}
                value={pkg.packageName}
                className="bg-gray-200 text-black"
              >
                {`${pkg.packageName} (${pkg.balance})`}
              </option>
            ))}
          </select>
        </div>

        {/* Percentage Selection */}
        <select
          name="percent"
          className="w-28 p-2 text-sm text-center border bg-inherit rounded"
          value={percent}
          onChange={handlePercentChange}
        >
          <option value="">Percent</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
        </select>

        {/* Cartella Price Input */}
        <input
          type="number"
          placeholder="Cartella price"
          className="border text-center w-28 p-2 rounded"
          value={cartellaPrice}
          onChange={handlePriceChange}
          min="0"
        />

        {/* Players Count */}
        <p className="border p-2 text-sm w-28 text-center rounded">
          Players: {players}
        </p>

        {/* Add Cartella Input */}
        <form onSubmit={handleAddCartella}>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Add Cartella"
          className="w-28 text-center border p-2 rounded"
        />
        </form>

         {/* Remove Cartella Input */}
         <form onSubmit={handleRemoveCartella}>
        <input
          type="number"
          value={inputValue2}
          onChange={handleInputChange2}
          placeholder="Remove Cartella"
          className="w-28 text-center border p-2 rounded"
        />
        </form>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 w-24"
        >
          Save
        </button>

        {/* Clear Button */}
        <button
          onClick={clearCartella}
          className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 w-24"
        >
          Clear
        </button>
      </div>

      {/* Cartella Numbers Selection */}
      <div className="flex gap-2 flex-wrap justify-center">
        {cartellaNumbers.sort().map((number) => (
          <div
            key={number}
            className={`h-24 w-36 flex items-center justify-center bg-gray-900 text-white rounded-md cursor-pointer transition-colors duration-300 ${
              selectedBoxes.includes(number) ? "border-4 border-green-400" : ""
            }`}
            onClick={() => handleBoxClick(number)}
          >
            <p
              className={`w-16 h-16 text-2xl flex items-center justify-center rounded-full transition-colors duration-300 ${
                selectedBoxes.includes(number)
                  ? "bg-green-400 text-gray-900"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {number}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectCartella;

