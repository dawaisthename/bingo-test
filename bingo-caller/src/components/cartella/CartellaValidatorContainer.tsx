import React, { useState } from "react";
import CartellaValidator from "./CartellaValidator"; // Assuming CartellaValidator is in a separate file
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const CartellaValidationContainer: React.FC = () => {
  const [cartellaInput, setCartellaInput] = useState<string>(""); // State to manage input
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Handle validate click and fetch fresh data from localStorage
  const handleValidateClick = () => {
    const cartellaNumber = parseInt(cartellaInput, 10); // Convert input to number

    // Fetch fresh data from localStorage on every validation attempt
    const storedBoxes = localStorage.getItem("selectedBoxes");
    const savedPickedNumbers = localStorage.getItem("pickedNumbers");

    const selectedBoxes = storedBoxes ? JSON.parse(storedBoxes) : [];
    const pickedNumbers = savedPickedNumbers
      ? JSON.parse(savedPickedNumbers)
      : [];

    // Check if cartellaNumber is valid
    if (!cartellaNumber) {
      toast.error("Please enter a cartella number."); // Handle empty input
    } else if (!selectedBoxes.includes(cartellaNumber)) {
      toast.error("The number you entered is not valid.");
    } else if (cartellaInput) {
      setIsModalVisible(true); // Show modal if input is valid
    }

    // Pass fresh pickedNumbers directly to the modal
    if (isModalVisible) {
      return (
        <CartellaValidator
          cartellaNumber={cartellaNumber} // Convert string to number
          selected_cartellas={pickedNumbers} // Pass fresh pickedNumbers
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)} // Close modal handler
        />
      );
    }
  };

  return (
    <div className="flex items-center justify-center flex-col gap-2">
      {/* Input for Cartella number */}
      <input
        type="text"
        placeholder="Validate cartella"
        value={cartellaInput}
        onChange={(e) => setCartellaInput(e.target.value)} // Update input state
        className="border p-3"
      />
      <div className="w-full">
        <button
          className="px-2 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700 w-full"
          onClick={handleValidateClick}
        >
          Check
        </button>

        {/* CartellaValidator modal */}
        {isModalVisible && (
          <CartellaValidator
            cartellaNumber={parseInt(cartellaInput, 10)} // Convert string to number
            selected_cartellas={JSON.parse(
              localStorage.getItem("pickedNumbers") || "[]"
            )} // Always fetch fresh pickedNumbers
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)} // Close modal handler
          />
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default CartellaValidationContainer;
