import { Search } from "lucide-react";
import useMediaQuery from "../hooks/useMediaQuery";
import { useSelector } from "react-redux";
import NavLinks from "./components/NavLinks";

const Navbar = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const profilePic = useSelector((state) => state.auth?.user?.profile_pic);
  return (
    <div className="w-full h-15 mb-auto bg-card border-b border-gray-500/20 flex justify-center">
      <div className="p-1 px-2 h-full w-full max-w-[calc(50vw+360px)] flex items-center gap-2">
        <div className="flex shrink-0 gap-2 justify-center items-center h-full">
          {isDesktop && <img src="/icon-512.png" className="h-9/10" />}
          <h1 className="text-card-content font-bold text-2xl">CrawlingDev</h1>
        </div>
        {isDesktop && <NavLinks />}
        <div className="flex aspect-square md:aspect-auto ml-auto md:grow bg-transparent  md:bg-card-content/5 rounded-full p-1 px-2 gap-2 justify-center items-center md:outline outline-card-content/20 md:mr-4">
          <Search className="text-card-content/80 size-7 md:size-5" />
          {isDesktop && (
            <input
              type="text"
              className="w-full focus:outline-0 text-card-content text-[1.05rem]"
              placeholder="Search projects..."
            />
          )}
        </div>
        <div className="h-8/10 shrink-0 p-0.5 aspect-square rounded-full overflow-hidden bg-gray-500">
          <img
            src={profilePic}
            className="object-cover rounded-full w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
