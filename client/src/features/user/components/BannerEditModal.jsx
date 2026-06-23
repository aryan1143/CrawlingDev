import { previousDay } from "date-fns";
import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import constant from "../../../shared/constants.json";
import { useUpdateBannerMutation } from "../api/user.api";
import { useDispatch } from "react-redux";
import { setBanner } from "../../auth/store/authSlice";
import toast from "react-hot-toast";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";

const bannerImagesArray = constant.bannerImages;

const BannerEditModal = ({ setIsEditingBanner, user }) => {
  const [selectedBannerId, setSelectedBannerId] = useState(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (!user?.banner) return;
    setSelectedBannerId(user.banner);
  }, [user]);

  const dispatch = useDispatch();

  const [updateBanner, { isError, isLoading, error }] =
    useUpdateBannerMutation();

  async function handleSavebanner() {
    if (selectedBannerId === user?.banner) return;

    try {
      await updateBanner(selectedBannerId).unwrap();
      dispatch(setBanner(selectedBannerId));
      toast.success("Banner updated successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      setIsEditingBanner(false);
    } catch (error) {
      toast.error(error?.data?.error || "Failed to update banner", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      console.log(error);
    }
  }

  return (
    <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center md:p-5 z-20">
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="flex flex-col h-full w-full md:w-4/10 bg-card md:rounded-xl outline outline-gray-500/20"
      >
        <div className="flex justify-between w-full -mt-0.5 border-b border-gray-400/50 px-2 pt-2">
          <h2 className="text-2xl md:text-xl font-semibold">Select Banner</h2>
          <button
            onClick={() => setIsEditingBanner(false)}
            className="h-fit w-fit"
          >
            <X />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 h0fit max-h-[calc(100%-2.5rem)] w-full px-5 mt-4">
          {bannerImagesArray?.map((image) => {
            return (
              <span
                onClick={() => setSelectedBannerId(image.id)}
                key={image.id}
                className={`bg-gray-400 w-full h-25 border border-gray-400 rounded-2xl overflow-hidden cursor-pointer ${selectedBannerId === image.id ? "outline-3" : "hover:outline hover:outline-gray-400"}`}
              >
                <img src={image.previewUrl} className="rounded-2xl w-full" />
              </span>
            );
          })}
        </div>
        <button
          onClick={handleSavebanner}
          disabled={isLoading}
          className="w-9/10 mx-auto bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-text rounded-md p-3 lg:p-1 cursor-pointer mt-auto mb-4"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default BannerEditModal;
