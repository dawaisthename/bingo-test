import React, { useState } from 'react';

interface BingoInputCardProps {
  onSubmit: (numbers: (number | string)[]) => void;
}

const CartellaInputBoard: React.FC<BingoInputCardProps> = ({ onSubmit }) => {
  const [inputs, setInputs] = useState<(number | string)[]>(Array(25).fill('')); // Initialize 25 inputs including the center "Free"
  const [duplicateIndices, setDuplicateIndices] = useState<number[]>([]); // Tracks indices of duplicate numbers
  const [emptyIndices, setEmptyIndices] = useState<number[]>([]); // Tracks indices of empty fields

  const handleChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value ? parseInt(value) : '';
    setInputs(newInputs);

    // Validate for unique numbers and empty fields
    const duplicates = findDuplicates(newInputs);
    const empties = findEmptyFields(newInputs);
    setDuplicateIndices(duplicates);
    setEmptyIndices(empties);
  };

  // Function to find duplicates in the input array
  const findDuplicates = (arr: (number | string)[]) => {
    const seen = new Set();
    const duplicates: number[] = [];
    arr.forEach((item, index) => {
      if (typeof item === 'number' && seen.has(item)) {
        duplicates.push(index);
      }
      seen.add(item);
    });
    return duplicates;
  };

  // Function to find empty fields
  const findEmptyFields = (arr: (number | string)[]) => {
    return arr.reduce((emptyIndices: number[], input, index) => {
      if (index !== 12 && input === '') {
        emptyIndices.push(index); // Track empty fields except the center "Free" field
      }
      return emptyIndices;
    }, []);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all inputs are filled (except for the center 'Free' space)
    if (emptyIndices.length > 0) {
      return; // If any fields are empty, do not submit
    }

    // Check for duplicate numbers
    if (duplicateIndices.length > 0) {
      return; // If duplicates are present, do not submit
    }

    // If no issues, proceed with submission
    onSubmit(inputs);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent non-numeric input
    const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className='w-64 bg-red-400 flex flex-col justify-center items-center p-3'>
      {/* BINGO Text */}
      <h1
        className='text-4xl text-white font-bold pt-2'
        style={{
          fontFamily: 'Bangers',
          color: 'white',
          WebkitTextStroke: 'black',
          textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black`,
        }}
      >
        BINGO
      </h1>

      {/* Bingo Card Grid with Input Fields */}
      <form onSubmit={handleSubmit} className="grid grid-cols-5 w-60 p-2">
        {Array(25).fill(null).map((_, index) => (
          <div key={index} className="h-12 w-12 flex items-center justify-center border-[1px]">
            {/* Center square (Free) */}
            {index === 12 ? (
              <input
                type="text"
                value="Free"
                disabled
                className="bg-green-300 font-bold h-full w-full text-center"
                style={{ fontFamily: 'Bangers, cursive' }}
              />
            ) : (
              <input
                type="number"
                className={`h-full w-full text-center bg-white ${
                  duplicateIndices.includes(index) ? 'bg-red-300' : '' // Highlight duplicates
                } ${
                  emptyIndices.includes(index) ? 'bg-zinc-300' : '' // Highlight empty fields
                }`}
                value={inputs[index] as string | number}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={handleKeyDown}
                min={1}
                max={75}
                style={{
                  fontFamily: 'Bangers, cursive',
                  fontSize: '1.2rem',
                  MozAppearance: 'textfield', // Removes arrows in Firefox
                }}
                // Removes arrows in Chrome and Safari
                onWheel={(e) => e.currentTarget.blur()} // Prevent scrolling from changing values
              />
            )}
          </div>
        ))}
      </form>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        className="mt-4 bg-blue-500 text-white py-1 px-4 rounded-lg"
      >
        Submit
      </button>
    </div>
  );
};

export default CartellaInputBoard;
