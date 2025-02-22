import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import BingoImage from "../../assets/images/letsplaybingo.png";
import CartellaValidationContainer from "./CartellaValidatorContainer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Twon from "./Twon";


// load API_URL
let API_URL: string = 'https://backend-api.hageregnabingo.com';

// Initialize available numbers array from 1 to 75
let availableNumbers: number[] = Array.from({ length: 75 }, (_, i) => i + 1);

// Function to generate a random number from available numbers and remove it from the array
const generateRandomNumber = (): number | null => {
  if (availableNumbers.length === 0) {
    return null; // If no numbers are left, return null
  }

  const randomIndex = Math.floor(Math.random() * availableNumbers.length); // Get a random index
  const randomNumber = availableNumbers[randomIndex]; // Get the number at that index
  availableNumbers.splice(randomIndex, 1); // Remove the number from the list
  return randomNumber;
};

interface BingoNumberBoardProps {
  pickedNumbers: number[];
  currentNumber: number | null;
  dimmingNumbers: Set<number>;
}


const BingoNumberBoard: React.FC<BingoNumberBoardProps> = ({
  pickedNumbers,
  currentNumber,
  dimmingNumbers,
}) => {
  const bingoLetters = ["B", "I", "N", "G", "O"];
  const bingoNumbers: number[][] = [
    Array.from({ length: 15 }, (_, i) => i + 1),
    Array.from({ length: 15 }, (_, i) => i + 16),
    Array.from({ length: 15 }, (_, i) => i + 31),
    Array.from({ length: 15 }, (_, i) => i + 46),
    Array.from({ length: 15 }, (_, i) => i + 61),
  ];

  return (
    <div className="flex  flex-col items-start bg-slate-100 w-full">
      {bingoLetters.map((letter, index) => (
        <div
          key={letter}
          className="flex items-center pr-5 min-w-full justify-between"
        >
          <span
            className="text-4xl font-bold mr- text-red-500 w-14 text-center py-5"
            style={{ fontFamily: "Orbitron" }}
          >
            {letter}
          </span>
          {bingoNumbers[index].map((number) => (
            <div
              key={number}
              className={`w-10 flex items-center justify-center  text-gray-300 text-5xl
              ${
                dimmingNumbers.has(number)
                  ? "text-gray-900"
                  : pickedNumbers.includes(number)
                  ? "text-gray-900 text-5xl"
                  : "bg-slate-100"
              }
              ${
                currentNumber === number
                  ? " border-blue-500 bg-blue-500 text-gray-900"
                  : ""
              }`}
              style={{ fontFamily: "Teko" }}
            >
              {number}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const BingoBoardApp: React.FC = () => {
  const [pickedNumbers, setPickedNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [totalCalls, setTotalCalls] = useState<number>(0); // Total number of random numbers picked
  const [speed, setSpeed] = useState(3); // Speed in seconds
  const [isPaused, setIsPaused] = useState(true); // Pause state
  const [hasStarted, setHasStarted] = useState(false); // Track if the game has started or not
  const [allPickedNumbers, setAllPickedNumbers] = useState<number[]>([]); // Array to hold all picked numbers
  const [dimmingNumbers, setDimmingNumbers] = useState<Set<number>>(new Set()); // Track dimmed numbers for shuffle
  const [colorMapping, setColorMapping] = useState<
    Map<number, { outerBorderColor: string; innerBorderColor: string }>
  >(new Map());

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // To manage interval

  // Function to start or reset the game
  const handleStartOrReset = async() => {
    // check local storage.
    const sb = localStorage.getItem("selectedBoxes");
    const cp = localStorage.getItem("cartellaPrice");
    const pr = localStorage.getItem("percent");
    const plr = localStorage.getItem("players");
    const sp = localStorage.getItem("selectedPackage");
    const spb = localStorage.getItem("selectedPackageBalance");

    if(sb === null || cp == null || pr == null || plr === null || sp === null || spb === null){
      toast.error('Setup game setting!')
    } else{
      if (hasStarted) {
        // End game
        saveGameInfo();  
      } else {
        // Start the game
        try {
          // Get the token from localStorage
          const token = localStorage.getItem('token');
      
          const data = {
            packageName: sp,
            _percent: pr,
            _players: plr,
            _cartellaPrice: cp,
          };
      
          // Send the data to the backend with authorization
          const response = await axios.post(`${API_URL}/api/start-game`, data, {
            headers: {
              Authorization: `${token}`, // Add the token to the Authorization header
            },
            
          });
      
          if (response.status === 200) {
            setIsPaused(false);
            setHasStarted(true);
            startPickingNumbers();
            const audio = new Audio(`../voices/start.mp3`);
            audio.play();
          } else{
            toast.error('Unable to start the game!');
          }
        } catch (error) {
          toast.error('Check your balance and try again!');
          console.error('Error:', error);
        }
      }
    }
  };

const startPickingNumbers = () => {
  if (intervalRef.current) clearInterval(intervalRef.current); // Clear any previous interval

  intervalRef.current = setInterval(() => {
    if (pickedNumbers.length < 75) {
      const newNumber = generateRandomNumber();
      if (newNumber !== null) {
        setPickedNumbers((prev) => {
          const updatedPickedNumbers = [...prev, newNumber];
          // Store picked numbers in local storage
          localStorage.setItem("pickedNumbers", JSON.stringify(updatedPickedNumbers));
          return updatedPickedNumbers;
        });

        setAllPickedNumbers((prev) => [...prev, newNumber]); // Update the array of all picked numbers
        setTotalCalls((prev) => prev + 1); // Increment the total number of calls
        setCurrentNumber(newNumber); // Set the new random number as the current number

        // Play the audio corresponding to the random number
        const audio = new Audio(`../voices/${newNumber}.mp3`);
        audio.play();

        // Generate and store colors for the new number
        if (!colorMapping.has(newNumber)) {
          const newColor = {
            outerBorderColor: getRandomColor(),
            innerBorderColor: getRandomColor(),
          };
          setColorMapping((prev) => new Map(prev).set(newNumber, newColor));
        }
      }
    } else {
      // If all 75 numbers have been picked, stop the interval
      clearInterval(intervalRef.current!);
    }
  }, speed * 1000); // Set interval based on speed
};



  // Pause the game
  const togglePause = () => {
    const sb = localStorage.getItem("selectedBoxes");
    const cp = localStorage.getItem("cartellaPrice");
    const pr = localStorage.getItem("percent");
    const plr = localStorage.getItem("players");
    const sp = localStorage.getItem("selectedPackage");
    const spb = localStorage.getItem("selectedPackageBalance");

    if(sb === null || cp == null || pr == null || plr === null || sp === null || spb === null){
      toast.error('Setup game setting!')
    } else{
      setIsPaused((prevPaused) => {
        if (prevPaused) {
          startPickingNumbers(); // Resume picking numbers
        } else {
          clearInterval(intervalRef.current!); // Pause picking numbers
        }
        return !prevPaused;
      });
    }
  };


const saveGameInfo = async () => {
  try {
    // const sb = localStorage.getItem('selectedBoxes');
    const cp = localStorage.getItem('cartellaPrice');
    const pr = localStorage.getItem('percent');
    const plr = localStorage.getItem('players');
    const sp = localStorage.getItem('selectedPackage');
    // const spb = localStorage.getItem('selectedPackageBalance');
    const wns = localStorage.getItem('winners');

    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // Create an object with the data to send
    const data = {
      bet: cp,
      players: plr,
      winners: wns,
      call: totalCalls,
      game_type: pr,
      packageName: sp,
    };

    // Send the data to the backend with authorization
    const response = await axios.post(`${API_URL}/api/save-game-info`, data, {
      headers: {
        Authorization: `${token}`, // Add the token to the Authorization header
      },
    });

    if (response.status === 200) {
      resetGame();
      // toast.success('Game ended!');
    }
  } catch (error) {
    // toast.error('Unable to end game!');
    console.error('Error:', error);
  }
};

  // Reset the game
  const resetGame = () => {
    clearInterval(intervalRef.current!);
    setPickedNumbers([]);
    setCurrentNumber(null);
    setTotalCalls(0); // Reset total calls
    setAllPickedNumbers([]); // Reset the array of all picked numbers
    setIsPaused(true);
    setHasStarted(false); // Reset the start state
    setDimmingNumbers(new Set()); // Clear dimming numbers
    setColorMapping(new Map()); // Clear color mapping
    availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1); // Reset available numbers list

    // Clear pickedNumbers from local storage
    localStorage.removeItem("pickedNumbers");
    localStorage.removeItem("winners");
  };

  // Handle changes in speed from the slider
  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(event.target.value));
    if (!isPaused) {
      clearInterval(intervalRef.current!); // Reset interval with new speed
      startPickingNumbers();
    }
  };

  // Utility function to shuffle an array
  const shuffleArray = (array: number[]) => {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  // Shuffle effect with randomized starting point
  const shuffleBoard = () => {
    const audio = new Audio('../voices/shuffle3sec.mp3');
    audio.play();
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const shuffledNumbers = shuffleArray(allNumbers); // Shuffle the numbers

    shuffledNumbers.forEach((number, index) => {
      setTimeout(() => {
        setDimmingNumbers((prev) => new Set(prev).add(number)); // Add number to dim
        setTimeout(() => {
          setDimmingNumbers((prev) => {
            const newSet = new Set(prev);
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            pickedNumbers;
            newSet.delete(number); // Remove number from dim after delay
            return newSet;
          });
        }, 600); // Duration for which the number will stay dimmed (200ms for example)
      }, index * 30); // Stagger the dimming effect (50ms between each cell)
    });
  };

  const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };

  // Get the last 5 picked numbers in reverse order
  const lastFiveNumbers = allPickedNumbers.slice(-5).reverse(); // Get last 5 picked numbers and reverse the order

  const getReady = () =>{
    toast.success('Get ready!')
    const audio = new Audio('../voices/ready.mp3');
    audio.play();
  }

  return (
    <div className="flex flex-col w-full">
      <ToastContainer />
      <div className="flex  justify-evenly w-full">
        <div className=" flex gap-4 border-black border-b-2 p-2 w-full">
          <div className="left flex flex-col gap-2 justify-center items-center">
            {/* Stats: Total Call and Previous Call */}
            <div className="text-center w-full bg-gray-100 rounded-md p-3">
              <div className="calls flex gap-2">
                <div className="total  flex flex-col justify-center items-center">
                  <p
                    style={{ fontFamily: "Digital" }}
                    className="bg-black w-20 text-red-500 h-20 flex justify-center items-center text-6xl"
                  >
                    {totalCalls}
                  </p>
                  <p>Total Calls</p>
                </div>
                <div className="total  flex flex-col justify-center items-center">
                  <p
                    style={{ fontFamily: "Digital" }}
                    className="bg-black w-20 text-red-500 h-20 flex justify-center items-center text-6xl"
                  >
                    {lastFiveNumbers[1]}
                  </p>
                  <p>Previous Call</p>
                </div>
              </div>
              {/* <h3 className="text-2xl">Total Calls: {totalCalls}</h3> */}
            </div>
            {/* Last picked number with colors */}
            {hasStarted ? (
              <div className=" p-2 rounded bg-gray-100 flex flex-col justify-center items-center gap-2 w-full">
                <div className="flex flex-wrap">
                  {lastFiveNumbers.length > 0 &&
                    (() => {
                      const number = lastFiveNumbers[0];
                      let letter = "B";
                      if (number >= 1 && number <= 15) {
                        letter = "B";
                      } else if (number >= 16 && number <= 30) {
                        letter = "I";
                      } else if (number >= 31 && number <= 45) {
                        letter = "N";
                      } else if (number >= 46 && number <= 60) {
                        letter = "G";
                      } else if (number >= 61 && number <= 75) {
                        letter = "O";
                      }
                      return (
                        <div
                          key={number}
                          className="w-28 h-28 flex items-center justify-center border-[25px] rounded-[50%] mx-2"
                          style={{
                            borderColor:
                              colorMapping.get(number)?.outerBorderColor ||
                              "gray",
                          }}
                        >
                          <div
                            className="w-14 h-14 flex justify-center items-center rounded-[50%] bg-white p-3 flex-col border-[3px]"
                            style={{
                              borderColor:
                                colorMapping.get(number)?.outerBorderColor ||
                                "gray",
                            }}
                          >
                            <p className="text-xl font-bold">{letter}</p>
                            <p className="text-2xl font-semibold -mt-2">
                              {number}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                </div>
                <p>CURRENT CALL</p>
              </div>
            ) : (
              <img
                src={BingoImage}
                alt=""
                className="w-[150px] h-[150px] rounded-full"
              />
            )}

            {/* Cartella validator container */}
            <CartellaValidationContainer />

          </div>
          {/* Bingo Number Board */}
          <div className="flex flex-1 w-full">
            <BingoNumberBoard
              pickedNumbers={pickedNumbers}
              currentNumber={currentNumber}
              dimmingNumbers={dimmingNumbers}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full justify-between p-2">
        <div className="flex gap-2 w-full">
          <div>
            <div className="left w-76r flex flex-col gap-4">
              {/* <img src={bingoLogo} alt="" className='pt-10'/> */}
              <div className="buttons flex gap-2 p-2">
                <div className="flex flex-col gap-2">
                  {/* Select cartella Button */}
                  {hasStarted ? 
                  <button className="px-2 w-40 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                   onClick={()=>{toast.error('The game is already started!.');}}
                  >
                    Select Cartella
                  </button>
                  : 
                  <Link to={"/dashboard/select-cartella"}>
                    <button className="px-2 w-40 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700">
                      Select Cartella
                    </button>
                  </Link>}

                  {/* Start / Reset button */}
                  <button
                    className="px-2 w-40 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                    onClick={handleStartOrReset}
                  >
                    {hasStarted ? "Reset Game" : "Start Autoplay"}
                  </button>
                  {/* <button
                    className="px-2 w-40 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                    onClick={isPaused && hasStarted ? saveGameInfo : (()=>{toast.error('Game is not started/paused!')})}
                  >
                    End Game
                  </button> */}
                </div>
                <div className="flex flex-col gap-2">
                  {/* Shuffle Button */}
                  <button
                    className="px-2 w-32 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                    onClick={hasStarted ? (()=>{toast.error('Game is already started!')}) : shuffleBoard}
                  >
                    Shuffle
                  </button>

                  {/* Ready Button */}
                  <button className="px-2 w-32 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                    onClick={hasStarted? ()=>{toast.error('Game already started!')}: getReady}
                  >
                    Ready
                  </button>
                  {/* Pause Button */}
                  {hasStarted ? <button
                    className="px-2 w-32 py-1 bg-gray-900 text-white rounded text-md hover:bg-gray-700"
                    onClick={togglePause}
                  >
                    {hasStarted && isPaused ? "Resume" : "Pause"}
                  </button> : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Last 5 picked numbers with colors */}
          <div className="flex justify-between gap-16 items-center w-full">
            <div className="mt-5 flex flex-col justify-center gap-2 ">
             <Twon />
              <div className=" flex gap-1 text-xs 2xl:text-base">
                <div className="flex gap-2">
                  <h1>Show # Of players </h1>
                  <input type="checkbox" />
                </div>
                <div className="flex gap-2">
                  <h1>Pattern Selector </h1>
                  <input type="checkbox" />
                </div>
                <div className="flex gap-2">
                  <h1>Pattern Display</h1>
                  <input type="checkbox" />
                </div>
                <div className="flex gap-2">
                  <h1>Refused Pattern </h1>
                  <input type="checkbox" />
                </div>
              </div>
              <div className="flex gap-1">
                <p className="text-sm">Autoplay speed: 1</p>
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={speed}
                    onChange={handleSpeedChange}
                    className="w-40"
                  />
                  <p className="text-xs">{speed}</p>
                </div>
                <p className="text-sm">6</p>
              </div>
            </div>
            <div className="flex rounded-full">
              <img
                src={BingoImage}
                alt=""
                className="w-[150px] h-[150px] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BingoBoardApp;
