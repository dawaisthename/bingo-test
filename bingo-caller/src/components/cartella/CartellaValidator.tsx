import React, { useEffect, useState } from "react";
import axios from "axios";
import CartellaWonChecker from "./CartellaWonChecker";


// load API_URL
let API_URL: string = 'https://backend-api.hageregnabingo.com';

interface CartellaValidatorProps {
  cartellaNumber: number;
  selected_cartellas: number[];
  isVisible: boolean;
  onClose: () => void;
}

const CartellaValidator: React.FC<CartellaValidatorProps> = ({
  cartellaNumber,
  selected_cartellas,
  isVisible,
  onClose,
}) => {
  const [cartellaData, setCartellaData] = useState<(number | string)[][] | null>(null);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [winningCells, setWinningCells] = useState<number[]>([]);

  // Function to validate if a cell is part of the selected numbers or 'Free'
  const isCellValid = (cell: number | string): boolean => {
    return cell === "Free" || selected_cartellas.includes(Number(cell));
  };

  // Function to check rows for a win
  const checkRows = (cartella: (number | string)[][]): number[] | null => {
    for (let rowIndex = 0; rowIndex < cartella.length; rowIndex++) {
      const row = cartella[rowIndex];
      if (row.every((cell) => isCellValid(cell))) {
        return row.map((_, colIndex) => rowIndex * 5 + colIndex); // Collect winning cells
      }
    }
    return null;
  };

  // Function to check columns for a win
  const checkColumns = (cartella: (number | string)[][]): number[] | null => {
    const numCols = cartella[0]?.length || 0;
    for (let col = 0; col < numCols; col++) {
      let win = true;
      const winningColCells: number[] = [];
      for (let row = 0; row < cartella.length; row++) {
        const cell = cartella[row][col];
        if (!isCellValid(cell)) {
          win = false;
          break;
        }
        winningColCells.push(row * 5 + col);
      }
      if (win) return winningColCells;
    }
    return null;
  };

  // Function to check diagonals for a win
  const checkDiagonals = (cartella: (number | string)[][]): number[] | null => {
    const size = cartella.length;
    let diagonal1 = true;
    let diagonal2 = true;
    const winningDiagonal1Cells: number[] = [];
    const winningDiagonal2Cells: number[] = [];

    for (let i = 0; i < size; i++) {
      const diag1Cell = cartella[i][i];
      const diag2Cell = cartella[i][size - i - 1];

      if (!isCellValid(diag1Cell)) {
        diagonal1 = false;
      }
      if (!isCellValid(diag2Cell)) {
        diagonal2 = false;
      }

      if (diagonal1) winningDiagonal1Cells.push(i * 5 + i);
      if (diagonal2) winningDiagonal2Cells.push(i * 5 + (size - i - 1));
    }

    if (diagonal1) return winningDiagonal1Cells;
    if (diagonal2) return winningDiagonal2Cells;
    return null;
  };


  const checkWin = (cartella: (number | string)[][]): number[] | null => {
    if(checkRows(cartella) || checkColumns(cartella) || checkDiagonals(cartella)){
      const winnersString = localStorage.getItem('winners') || '';
      const winnersArray = winnersString.split(',').map(winner => winner.trim()).filter(winner => winner !== '');
    
      if (!winnersArray.includes(cartellaNumber.toString())) {
        winnersArray.push(cartellaNumber.toString());
      }
    
      const newWinners = winnersArray.join(', ');
      localStorage.setItem('winners', newWinners);
    
    }
    
    // Return the result of checking rows, columns, or diagonals
    return checkRows(cartella) || checkColumns(cartella) || checkDiagonals(cartella);
  };
  
  
  // Fetch cartella data when the modal becomes visible or cartellaNumber changes
  useEffect(() => {
    const fetchCartellaData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await axios.post(
          `${API_URL}/api/cartella-cell`,
          { cartellaNumber },
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data.cartella)) {
          setCartellaData(response.data.cartella);
        } else {
          throw new Error("Cartella not found.");
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Error fetching cartella data.");
        setCartellaData(null);
        setLoading(false);
      }
    };

    if (isVisible) {
      fetchCartellaData();
    } else {
      setCartellaData(null);
      setHasWon(false);
      setWinningCells([]);
      setError(null);
      setLoading(false);
    }
  }, [cartellaNumber, isVisible]);

  // Check for a win whenever cartellaData or selected_cartellas change
  useEffect(() => {
    if (cartellaData && selected_cartellas.length > 0) {
      const winCells = checkWin(cartellaData);
      if (winCells) {
        setHasWon(true);
        setWinningCells(winCells);
      } else {
        setHasWon(false);
        setWinningCells([]);
      }
    } else {
      setHasWon(false);
      setWinningCells([]);
    }
  }, [cartellaData, selected_cartellas]);

  if (!isVisible) return null;


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-gray-400 shadow-lg gap-2 flex flex-col p-4 items-center rounded">
        {loading && (
          <div className="flex items-center justify-center w-full h-full">
            <p>Loading...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 text-white bg-red-500 hover:bg-red-600 rounded-sm w-24 py-2 text-md"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && cartellaData && (
          <div className="flex flex-col p-10">
            {/* <div className="flex flex-col items-center">
              <h1 className="text-4xl text-white font-bold" style={{ fontFamily: "Bangers, cursive", fontSize: "3rem" }}>
                {hasWon ? <CartellaWon cartellaNumber={cartellaNumber}/> : <CartellaNotWon cartellaNumber={cartellaNumber} />}
              </h1>
              {hasWon && (
                // won calculation;
                <h2 className="text-2xl text-white font-bold mt-2">
                  <CartellaWon cartellaNumber={cartellaNumber}/>
                </h2>
              )}
            </div> */}
            <div className="flex flex-col p-10">
              <div className="flex flex-col items-center">
                <h1 className="text-4xl text-white font-bold" style={{ fontFamily: "Bangers, cursive", fontSize: "3rem" }}>
                  <CartellaWonChecker cartellaNumber={cartellaNumber} hasWon={hasWon} />
                </h1>
              </div>
            </div>

            <div className="flex mt-4 flex-col">

              <div className="grid grid-cols-5 justify-center items-center" style={{ fontFamily: "Bangers, cursive", fontSize: "2rem" }}>
                <span className="flex justify-center font-bold text-white">B</span>
                <span className="flex justify-center font-bold text-white">I</span>
                <span className="flex justify-center font-bold text-white">N</span>
                <span className="flex justify-center font-bold text-white">G</span>
                <span className="flex justify-center font-bold text-white">O</span>
              </div>
              <div className="grid grid-cols-5">
                {cartellaData.flat().map((cell, index) => (
                  <div
                    key={index}
                    className={`h-20 w-20 flex items-center justify-center border-[1px] ${
                      cell === "Free"
                        ? "bg-green-300 font-bold"
                        : winningCells.includes(index)
                        ? "bg-green-400"
                        : "bg-white"
                    }`}
                    style={{ fontFamily: "Bangers, cursive", fontSize: "2rem" }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 text-white bg-red-500 hover:bg-red-600 rounded-sm w-24 py-2 text-md"
            >
              Close
            </button>
          </div>
        )}

        {!loading && !error && !cartellaData && (
          <div className="flex flex-col items-center">
            <p className="text-yellow-500">Cartella data is unavailable.</p>
            <button
              onClick={onClose}
              className="mt-4 text-white bg-red-500 hover:bg-red-600 rounded-sm w-24 py-2 text-md"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartellaValidator;
