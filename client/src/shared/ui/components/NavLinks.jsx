import { Compass, House, Plus, PlusCircle, Star, User } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

const NavLinks = ({ isMobile = false }) => {
  return (
    <div className="h-full md:pt-1.5 bg-card md:bg-transparent flex w-full md:w-5/10 items-start gap-8 justify-around md:justify-start md:mx-4 text-card-content border-t md:border-t-0 border-gray-500/10">
      <NavLink
        to={"/"}
        className="flex flex-col md:flex-row justify-center items-center gap-1 py-2 px-2 border-t-2 md:border-b-2 md:border-t-0 border-transparent"
      >
        <House className="size-7 md:size-5" />
        <p className="text-sm md:text-[1.05rem]">Home</p>
      </NavLink>

      <NavLink
        to={"/explore"}
        className="flex flex-col md:flex-row justify-center items-center gap-1 py-2 px-2 border-t-2 md:border-b-2 md:border-t-0 border-transparent"
      >
        <Compass className="size-7 md:size-5" />
        <p className="text-sm md:text-[1.05rem]">Explore</p>
      </NavLink>

      {isMobile && (
        <button className="flex flex-col md:flex-row justify-center items-center gap-1 py-2">
          <PlusCircle className="size-10" />
        </button>
      )}

      <NavLink
        to={"/reveiws"}
        className="flex flex-col md:flex-row justify-center items-center gap-1 py-2 px-2 border-t-2 md:border-b-2 md:border-t-0 border-transparent"
      >
        <Star className="size-7 md:size-5" />
        <p className="text-sm md:text-[1.05rem]">Reveiws</p>
      </NavLink>

      <NavLink
        to={"/profile"}
        className="flex flex-col md:flex-row justify-center items-center gap-1 py-2 px-2 border-t-2 md:border-b-2 md:border-t-0 border-transparent"
      >
        <User className="size-7 md:size-5" />
        <p className="text-sm md:text-[1.05rem]">Profile</p>
      </NavLink>
    </div>
  );
};

export default NavLinks;
