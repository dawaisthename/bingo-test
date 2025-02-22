import { useState, useEffect } from 'react';

const Twon = () => {
  const [Twon, setTwon] = useState(0); // Initialize Twon with a default value of 0

  // Helper function to calculate total won
  const calculateTotalWon = () => {
    const players = parseInt(localStorage.getItem('players') || '0');
    const cartellaPrice = parseInt(localStorage.getItem('cartellaPrice') || '0');
    const percent = parseInt(localStorage.getItem('percent') || '0');
    
    // Calculate total won based on formula
    const totalWon = (players * cartellaPrice) - (players * cartellaPrice) * ((percent * 5) / 100);
    return totalWon;
  };

  // useEffect to calculate Twon whenever component mounts or updates
  useEffect(() => {
    // Perform the calculation and set Twon
    const totalWon = calculateTotalWon();
    setTwon(totalWon);
  }, []); // Empty dependency array ensures it runs once on mount

  return (
    <div className="flex flex-col">
      Winning Amount
      <input
        type="text"
        className="w-96 text-center border h-10 placeholder:font-bold placeholder:text-black placeholder:text-3xl"
        placeholder={Twon.toString()} // Convert Twon to string for the placeholder
        disabled
      />
    </div>
  );
};

export default Twon;
