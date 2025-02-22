import { useEffect } from 'react';

interface CartellaWonProps {
  cartellaNumber: number;  // Define the type of cartellaNumber prop
}

const winnerCartellaVoice = ({cartela_number}: any) =>{
    const audio = new Audio(`../voices/won/${cartela_number}.mp3`);
    audio.play();
}

const CartellaWon: React.FC<CartellaWonProps> = ({ cartellaNumber }) => {
  useEffect(() => {
    const audio = new Audio(`../voices/won/${cartellaNumber}.mp3`);
    audio.play();
  }, [cartellaNumber]);  // Add cartellaNumber as a dependency to useEffect

  const players = parseInt(localStorage.getItem('players') || '0');
  const cartellaPrice = parseInt(localStorage.getItem('cartellaPrice') || '0');
  const percent = parseInt(localStorage.getItem('percent') || '0');

  const totalWon = (players * cartellaPrice) - (players * cartellaPrice) * ((percent * 5)/100);

  winnerCartellaVoice(cartellaNumber);
  return (
    <h2 className="text-2xl text-white font-bold mt-2" >
      Won {totalWon} Birr
    </h2>
  );
};

export default CartellaWon;
