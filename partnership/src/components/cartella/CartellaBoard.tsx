// import React from 'react';

// interface BingoCardProps {
//   data: (number | string)[][];
// }

// const CartellaBoard: React.FC<BingoCardProps> = ({ data }) => {
//   return (
//     <div className='w-64 bg-gray-400 flex flex-col justify-center items-center p-3'>
//       <h1 
//         className='text-4xl text-white font-bold pt-2' 
//         style={{
//           fontFamily: 'Bangers',
//           color: 'white',
//           WebkitTextStroke: 'black',
//           textShadow: `-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black`
//         }}
//       >
//         BINGO
//       </h1>

//       <div className="grid grid-cols-5 w-60 p-2">
//         {data.flat().map((cell, index) => (
//           <div
//             key={index}
//             className={`h-12 w-12 flex items-center justify-center border-[1px] ${
//               cell === 'Free' ? 'bg-green-300 font-bold' : 'bg-white'
//             }`}
//             style={{ fontFamily: 'Bangers, cursive', fontSize: '1.2rem' }}
//           >
//             {cell}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CartellaBoard;
