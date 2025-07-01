import React from "react";
import { FaExchangeAlt } from "react-icons/fa";

const Logo = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center  w-10 h-10 bg-primaryBlue rounded-xl">
        <FaExchangeAlt className="text-white text-xl" />
      </div>
      <span className="text-bold-x18 ">
        <h1>السباعي للصرافة</h1>
      </span>
    </div>  
  );
};

export default Logo;
