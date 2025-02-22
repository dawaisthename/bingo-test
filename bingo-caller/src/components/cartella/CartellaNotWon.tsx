import { useEffect } from 'react';

interface CartellaNumber{
    cartellaNumber: number;
}


const CartellaNotWon= ({cartellaNumber}: CartellaNumber) => {
    useEffect(() => {
        const audio = new Audio(`../voices/notwon/${cartellaNumber}.mp3`);
        audio.play();
    }, []); 

    console.log(`../voices/notwon/${cartellaNumber}.mp3`)
    return (
        <h2 className="text-2xl text-white font-bold mt-2">
            Keep Trying!
        </h2>
    );
};

export default CartellaNotWon;
