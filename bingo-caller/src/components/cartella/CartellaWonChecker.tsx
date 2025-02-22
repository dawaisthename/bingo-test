import { useEffect, useRef } from 'react';

interface CartellaProps {
  cartellaNumber: number;
  hasWon: boolean; // Add hasWon prop to determine if the player won
}

const CartellaWonChecker: React.FC<CartellaProps> = ({ cartellaNumber, hasWon }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null); // Use ref to store the audio instance

  useEffect(() => {
    // Stop any currently playing audio before playing the new one
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset the audio to the beginning
    }

    const audioPath = hasWon
      ? `../voices/won/${cartellaNumber}.mp3`
      : `../voices/notwon/${cartellaNumber}.mp3`;

    const newAudio = new Audio(audioPath);
    audioRef.current = newAudio; // Assign the new audio to the ref
    newAudio.play();

    return () => {
      // Cleanup function to stop the audio when the component unmounts or re-renders
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null; // Clean up the ref
      }
    };
  }, [cartellaNumber, hasWon]); // Re-run only when cartellaNumber or hasWon changes

  const players = parseInt(localStorage.getItem('players') || '0');
  const cartellaPrice = parseInt(localStorage.getItem('cartellaPrice') || '0');
  const percent = parseInt(localStorage.getItem('percent') || '0');

  const totalWon = (players * cartellaPrice) - (players * cartellaPrice) * ((percent * 5) / 100);

  return (
    <div>
      <h2 className="text-[4rem] text-white font-bold mt-2">
        {hasWon
          ? `Won ${totalWon} Birr`
          : 'Keep Trying!'}
      </h2>
    </div>
  );
};

export default CartellaWonChecker;
