import React, { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Cartella {
  partnershipId: string;
  cartellaNumber: number;
  branchName: string;
  cells: (number | string)[][];
}

const CartellaList: React.FC = () => {
  const [cartellas, setCartellas] = useState<Cartella[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState<string[]>([]);
  const [filteredCartellas, setFilteredCartellas] = useState<Cartella[]>([]);
  const [selectedCartella, setSelectedCartella] = useState<Cartella | null>(
    null
  );
  const [inputs, setInputs] = useState<(number | string)[]>(Array(25).fill(""));
  const [isEditing, setIsEditing] = useState(false);
  const [duplicateIndices, setDuplicateIndices] = useState<number[]>([]);
  const [emptyIndices, setEmptyIndices] = useState<number[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [branchesFetched, setBranchesFetched] = useState(false); // Prevents refetching branches

  // Get authorization token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch branches data when the dropdown is clicked
  const fetchBranches = useCallback(async () => {
    if (!branchesFetched) {
      try {
        const token = getToken();
        const response = await axios.get(
          "https://backend-api.hageregnabingo.com/api/branch-list",
          {
            headers: { Authorization: `${token}` },
          }
        );
        setBranches(response.data); // Setting branches directly from the response
        setBranchesFetched(true);
      } catch (error) {
        console.error("Error fetching branch data:", error);
        toast.error("Failed to fetch branches.");
      }
    }
  }, [branchesFetched]);

  // Fetch cartellas when branch is selected
  const fetchCartellas = async (branch: string) => {
    if (!branch) return;
    try {
      const token = getToken();
      const response = await axios.get(
        "https://backend-api.hageregnabingo.com/api/cartella-list",
        {
          headers: { Authorization: `${token}` },
        }
      );
      const fetchedCartellas: Cartella[] = response.data.cartellas;
      setCartellas(fetchedCartellas);
      setFilteredCartellas(
        fetchedCartellas.filter((cartella) => cartella.branchName === branch)
      );
    } catch (error) {
      console.error("Error fetching cartella data:", error);
      toast.error("Failed to fetch cartella data.", { autoClose: 2000 });
    }
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
    if (branch) {
      fetchCartellas(branch);
    } else {
      setFilteredCartellas([]);
    }
  };

  const handleCartellaClick = (cartella: Cartella) => {
    setSelectedCartella(cartella);
    setInputs(cartella.cells.flat());
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleClose = () => {
    setSelectedCartella(null);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value ? (index === 12 ? "Free" : parseInt(value)) : "";
    const duplicates = findDuplicates(newInputs);
    const empties = findEmptyFields(newInputs);
    setDuplicateIndices(duplicates);
    setEmptyIndices(empties);
    setInputs(newInputs);
  };

  const findDuplicates = (arr: (number | string)[]) => {
    const seen = new Set();
    const duplicates: number[] = [];
    arr.forEach((item, index) => {
      if (typeof item === "number" && seen.has(item)) {
        duplicates.push(index);
      }
      seen.add(item);
    });
    return duplicates;
  };

  const findEmptyFields = (arr: (number | string)[]) => {
    return arr.reduce((emptyIndices: number[], input, index) => {
      if (index !== 12 && input === "") {
        emptyIndices.push(index);
      }
      return emptyIndices;
    }, []);
  };

  const handleUpdate = async () => {
    if (emptyIndices.length > 0 || duplicateIndices.length > 0) return;

    const updatedCells = selectedCartella?.cells.map((row, rowIndex) =>
      row.map((_cell: number | string, colIndex: number) =>
        rowIndex === 2 && colIndex === 2
          ? "Free"
          : inputs[rowIndex * 5 + colIndex]
      )
    );

    if (selectedCartella) {
      const updatedCartella = { ...selectedCartella, cells: updatedCells! };
      try {
        const token = getToken();
        await axios.post(
          "https://backend-api.hageregnabingo.com/api/edit-cartella",
          updatedCartella,
          {
            headers: { Authorization: `${token}` },
          }
        );
        setSelectedCartella(updatedCartella);
        toast.success("Cartella updated successfully!");
      } catch (error) {
        console.error("Error updating cartella:", error);
        toast.error("Failed to update cartella.");
      }
    }
    setIsEditing(false);
  };

  const handleAddCartellaPopup = () => {
    if (!selectedBranch) {
      toast.warning("Please select a branch before adding a new cartella.", {
        autoClose: 2000,
      });
      return;
    }

    // Update the board data while keeping 'Free' as unchanged
    //     const updatedBoardData = [...bingoData[selectedBoard!.toString()]].map((row, rowIndex) =>
    //       row.map((_cell, colIndex) => (rowIndex === 2 && colIndex === 2 ? 'Free' : inputs[rowIndex * 5 + colIndex]))
    //     );
    setIsAddingNew(true);
    setInputs(Array(25).fill(""));
    setSelectedCartella(null);
  };

  const getMaxCartellaNumberForBranch = (): number => {
    const cartellasForBranch = cartellas.filter(
      (cartella) => cartella.branchName === selectedBranch
    );
    const maxCartella = Math.max(
      ...cartellasForBranch.map((cartella) => cartella.cartellaNumber),
      0
    );
    return maxCartella + 1;
  };

  const handleAddNewCartella = async () => {
    if (emptyIndices.length > 0 || duplicateIndices.length > 0) return;

    const newCells = [];
    for (let i = 0; i < 25; i += 5) {
      newCells.push(inputs.slice(i, i + 5));
    }

    const newCartella: Cartella = {
      partnershipId: "00000020f51bb4362eee2a4d",
      cartellaNumber: getMaxCartellaNumberForBranch(),
      branchName: selectedBranch,
      cells: newCells,
    };

    try {
      const token = getToken();
      const response = await axios.post(
        "https://backend-api.hageregnabingo.com/api/add-cartella",
        newCartella,
        {
          headers: { Authorization: `${token}` },
        }
      );
      const addedCartella: Cartella = response.data.cartella;
      setCartellas((prev) => [...prev, addedCartella]);
      setFilteredCartellas((prev) => [...prev, addedCartella]);
      setIsAddingNew(false);
      toast.success("New cartella added successfully!", { autoClose: 2000 });
    } catch (error) {
      console.error("Error adding cartella:", error);
      toast.error("Failed to add new cartella.", { autoClose: 2000 });
    }
  };

  const toggleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="flex flex-col items-left">
      <div>
        <select
          value={selectedBranch}
          onClick={fetchBranches}
          onChange={(e) => handleBranchChange(e.target.value)}
          className="mb-4 p-2 bg-white border border-gray-400 rounded w-auto text-sm"
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>

        <button
          onClick={handleAddCartellaPopup}
          className="ml-2 mb-4 bg-blue-500 text-white py-1 px-4 rounded"
          disabled={!selectedBranch}
        >
          Add Cartella
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {filteredCartellas.map((cartella) => (
          <div
            key={cartella.partnershipId}
            className="h-28 w-40 flex text-3xl items-center justify-center bg-gray-700 text-white cursor-pointer rounded-md"
            onClick={() => handleCartellaClick(cartella)}
            style={{
              fontFamily: "Bangers",
              color: "white",
            }}
          >
            <h1 className="bg-gray-100 text-gray-900 cursor-pointer rounded-[50%] w-20 h-20 text-center flex items-center justify-center">
              {cartella.cartellaNumber}
            </h1>
          </div>
        ))}
      </div>

      {(selectedCartella || isAddingNew) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-72 bg-yellow-300 flex flex-col justify-center items-center p-3">
            <h1
              className="text-4xl text-white font-bold pt-4 pb-2"
              style={{
                fontFamily: "Bangers",
                color: "white",
                WebkitTextStroke: "black",
                textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black`,
              }}
            >
              {isAddingNew
                ? "New Cartella"
                : `${selectedCartella?.cartellaNumber}`}
            </h1>
            <div className="grid grid-cols-5 justify-center items-center w-60" style={{ fontFamily: "Bangers, cursive", fontSize: "2rem" }}>
                <span className="flex justify-center font-bold text-white">B</span>
                <span className="flex justify-center font-bold text-white">I</span>
                <span className="flex justify-center font-bold text-white">N</span>
                <span className="flex justify-center font-bold text-white">G</span>
                <span className="flex justify-center font-bold text-white">O</span>
            </div>
            <div className="grid grid-cols-5 w-60 bg-white">
              {inputs.map((cell, index) => (
                <div
                  key={index}
                  className={`h-12 w-12 flex items-center justify-center border-[1px] ${
                    cell === "Free" ? "bg-green-300 font-bold" : ""
                  }`}
                >
                  {isEditing || isAddingNew ? (
                    <input
                      type="number"
                      className={`h-full w-full text-center border-none ${
                        duplicateIndices.includes(index) ? "bg-red-200" : ""
                      } ${emptyIndices.includes(index) ? "bg-yellow-200" : ""}`}
                      value={cell === "Free" ? "" : cell}
                      disabled={index === 12}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                  ) : (
                    <span>{cell}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between w-full mt-2 pl-3 pr-3">
              {!isEditing && !isAddingNew && (
                <button
                  onClick={toggleEdit}
                  className="py-1 px-4 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>
              )}
              {isEditing && !isAddingNew && (
                <button
                  onClick={handleUpdate}
                  className="py-1 px-4 bg-green-500 text-white rounded ml-2"
                >
                  Save
                </button>
              )}
              {isAddingNew && (
                <button
                  onClick={handleAddNewCartella}
                  className="py-1 px-4 bg-green-500 text-white rounded ml-2"
                >
                  Add Cartella
                </button>
              )}
              <button
                onClick={handleClose}
                className="py-1 px-4 bg-gray-500 text-white rounded ml-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartellaList;
