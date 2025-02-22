import React from "react";
import Marquee from "react-fast-marquee";
const TopBar: React.FC = () => {
  return (
    <div className="sticky top-0 bg-[#F8F8F8] h-20 flex items-center justify-center md:justify-between z-30 w-full border-b">
      <div className="h-full w-full flex justify-center items-center">
        <Marquee>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-red-500 text-transparent bg-clip-text">
            Speed Games. ስፒድ ጌምስ. Speed Games.
          </h1>
        </Marquee>
      </div>
    </div>
  );
};

export default TopBar;
