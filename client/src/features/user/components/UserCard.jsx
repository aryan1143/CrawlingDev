import React, { useState } from "react";
import constants from "../../../shared/constants.json";
import {
  Award,
  FolderOpenDot,
  LogOut,
  MessageSquareCode,
  SquarePen,
  Star,
  Trash,
} from "lucide-react";
import { formatDateForUserCard } from "../utils/dateFormater";
import { Link, useNavigate } from "react-router-dom";
import {
  useDeleteAccountMutation,
  useUpdateProfilePicMutation,
} from "../api/user.api";
import { HashLoader, PuffLoader } from "react-spinners";
import imageCompression from "browser-image-compression";
import { useDispatch } from "react-redux";
import { setProfilePic, setUser } from "../../auth/store/authSlice";
import toast from "react-hot-toast";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { useLogoutUserMutation } from "../../auth/api/auth.api";
import Modal from "../../../shared/ui/components/Modal";
import { useGetMyProjectsQuery } from "../../project/api/project.api";

const bannerImagesArray = constants.bannerImages;

const demoSkils = [];

function StatsCard({ icon, title, value, color = "#0000", to = "/" }) {
  return (
    <Link
      to={to}
      className="flex gap-3 justify-start items-center border border-gray-400/50 h-16 px-3 max-full rounded-xl"
    >
      <span
        style={{ backgroundColor: color + "30" }}
        className="p-2 rounded-xl "
      >
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold">{value}</span>
        <span className="text-sm -mt-1 text-card-content/70">{title}</span>
      </div>
    </Link>
  );
}

const UserCard = ({ user, setIsEditing, setIsEditingBanner }) => {
  const skillsColor = constants.skills;
  const skillsToColorMap = new Map();

  const [showAllSkillsModal, setShowAllSkillsModal] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { data: projectData, isLoading: isProjectDataLoading } =
    useGetMyProjectsQuery();
  console.log(projectData);

  skillsColor.forEach((item) => {
    skillsToColorMap.set(item.name, item);
  });

  const bannerImage = bannerImagesArray.find(
    (image) => image.id === user?.banner,
  );

  const [updateProfilePic, { isLoading, isError, error }] =
    useUpdateProfilePicMutation();

  const dispatch = useDispatch();

  const handleFileInputChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 720,
      useWebWorker: true,
    };

    let compressedFile = file;
    if (file.size > 1000000) {
      compressedFile = await imageCompression(file, options);
    }

    const formData = new FormData();
    formData.append("image", compressedFile);

    const response = await updateProfilePic(formData).unwrap();
    if (error) {
      toast.error("Profile-Pic update failed", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    } else {
      dispatch(setProfilePic(response.profile_pic));
      toast.success("Profile-pic updated successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    }
  };

  const navigate = useNavigate();
  const [
    deleteAccount,
    { isLoading: isDeletingAccount, error: deleteAccountError },
  ] = useDeleteAccountMutation();
  async function handleDeleteAccount() {
    if (confirm("Are you sure you want to delete your account parmanently.")) {
      await deleteAccount();

      if (deleteAccountError) {
        toast.error("Failed to delete account", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        return;
      }

      toast.success("Account deleted successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      dispatch(setUser(null));
      navigate("/login");
    }
  }

  const [logoutUser, { isLoading: isLoggingout, error: logoutError }] =
    useLogoutUserMutation();
  async function handleLogout() {
    if (confirm("Are you sure you want to logout.")) {
      await logoutUser();

      if (logoutError) {
        toast.error("Failed to logout", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        return;
      }

      toast.success("Loggedout successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      dispatch(setUser(null));
      navigate("/login");
    }
  }

  const renderSkills = (skill) => {
    const colors = skillsToColorMap.get(skill) || {};
    return (
      <span
        key={skill}
        style={{ backgroundColor: colors.bg_color, color: colors.text_color }}
        className="inline-flex h-fit items-center p-2 py-0.5 rounded-full"
      >
        {skill}
      </span>
    );
  };

  return (
    <div className="md:w-70/100 w-full min-h-full h-fit bg-card md:rounded-xl outline outline-gray-500/20">
      {(isDeletingAccount || isLoggingout) && (
        <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full h-full bg-background z-25 flex flex-col gap-3 items-center justify-center">
          <HashLoader color="var(--color-card-content)" />
          <span className="">
            {isLoggingout ? "Logging out" : "Deleting Account..."}
          </span>
        </div>
      )}
      <div className="relative w-full h-35 md:h-65">
        <div className="relative w-full h-8/10 overflow-hidden md:rounded-t-xl">
          <button
            onClick={() => setIsEditingBanner(true)}
            className="absolute top-5 right-2 md:right-5 bg-card/50 p-0.5 rounded-md"
          >
            <SquarePen color="var(--color-card-content)" />
          </button>
          <img src={bannerImage?.url} className="w-full" />
        </div>
        <label
          disabled
          htmlFor={isLoading ? "" : "profileImgInput"}
          className="absolute rounded-full bg-card p-1 cursor-pointer bottom-0 left-5 md:left-10 z-5 h-7/10 md:h-6/10 aspect-square shrink-0"
        >
          {isLoading && (
            <div className="flex items-center rounded-full justify-center absolute top-1/2 left-1/2 -translate-1/2 w-full h-full z-5 bg-card/70">
              <PuffLoader size={85} color="var(--color-card-content)" />
            </div>
          )}
          <img
            src={user?.profile_pic}
            className="object-cover rounded-full w-full h-full"
          />
          <input
            type="file"
            name="profileImgInput"
            id="profileImgInput"
            className="hidden"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </label>
      </div>
      <div className="relative flex flex-col gap-2 text-card-content px-8 py-4 w-full">
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -top-5 md:-top-10 right-2 md:right-5"
        >
          <SquarePen />
        </button>
        <div className="flex flex-col md:flex-row gap-5 w-full">
          <div className="flex flex-col shrink-0 w-full md:w-1/2">
            <h2 className="text-3xl font-semibold">
              {user?.name || "No name"}
            </h2>
            <p className="text-card-content/80 -mt-1">
              @{user?.username || "No username"}
            </p>
            <p className="text-card-content/80">
              {user?.bio || "User hasn't set his bio yet."}
            </p>
            <div className="w-full mt-3">
              <div className="flex w-full h-16 border border-gray-400/50 rounded-xl py-1.5">
                <div className="flex flex-col justify-center items-center h-full w-1/2 border-r border-gray-400/50">
                  <span className="text-2xl font-semibold">0</span>
                  <span className="text-sm -mt-1 text-card-content/70">
                    Followers
                  </span>
                </div>
                <div className="flex flex-col justify-center items-center h-full w-1/2">
                  <span className="text-2xl font-semibold">0</span>
                  <span className="text-sm -mt-1 text-card-content/70">
                    Following
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full mt-2">
              <StatsCard
                icon={<Star color="#f2ba2c" />}
                title={"Avg Rating"}
                value={`0.0`}
                color={"#f2ba2c"}
              />
              <StatsCard
                icon={<Award color="#d42cf2" />}
                title={"Reputation"}
                value={user?.reputation || 0}
                color={"#d42cf2"}
              />
              <StatsCard
                icon={<FolderOpenDot color="#4287f5" />}
                title={"Projects"}
                value={
                  isProjectDataLoading ? "Loading..." : projectData?.count || 0
                }
                color={"#4287f5"}
                to="/projects"
              />
              <StatsCard
                icon={<MessageSquareCode color="#22c73b" />}
                title={"Reviews"}
                value={0}
                color={"#22c73b"}
              />
            </div>
          </div>
          <div className="flex flex-col w-full md:w-5/10 md:ml-auto">
            <span className="w-full flex justify-between items-center">
              <h3 className="my-2 text-xl font-semibold">Skills</h3>
              <button
                onClick={() => setShowAllSkillsModal(true)}
                className="text-card-content/75 text-[1rem]"
              >
                View All
              </button>
            </span>
            <Modal
              isOpen={showAllSkillsModal}
              onClose={() => setShowAllSkillsModal(false)}
              title="Tech Stacks"
            >
              <div className="flex flex-wrap gap-2 px-2 pb-2 mt-3">
                {user?.skills.map(renderSkills)}
              </div>
            </Modal>
            <div className="flex gap-1.5 flex-wrap w-full">
              {user?.skills?.length === 0
                ? "No skills"
                : user?.skills?.slice(0, 5).map(renderSkills)}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-5 md:mt-auto">
              {user?.linkedin && (
                <a
                  href={user.linkedin}
                  target="_blank"
                  className="flex justify-center items-center gap-1 py-3 bg-gray-400/20 rounded-xl cursor-pointer"
                >
                  <img src="/linkedin.png" className="h-8 theme-icon" />
                  <span className="text-2xl md:text-2xl font-bold">
                    Linkedin
                  </span>
                </a>
              )}
              {user?.github && (
                <a
                  href={user.github}
                  target="_blank"
                  className="flex justify-center items-center gap-1 py-3 bg-gray-400/20 rounded-xl cursor-pointer"
                >
                  <img src="/github.png" className="h-8 theme-icon" />
                  <span className="text-2xl md:text-2xl font-bold">GitHub</span>
                </a>
              )}
            </div>
            <div className="grid grid-rows-2 mt-5 md:mt-2 border border-gray-400/50 rounded-xl grow max-h-22 p-2 px-3">
              <div className="flex w-full justify-between py-1 border-b border-gray-400/50">
                <span>Member Since</span>
                <span className="text-card-content/80">
                  {user?.created_at && formatDateForUserCard(user?.created_at)}
                </span>
              </div>
              <div className="flex w-full justify-between py-1 text-red-500">
                <button
                  onClick={handleLogout}
                  className="mt-auto flex gap-1 cursor-pointer items-end"
                >
                  <span>Logout</span>
                  <LogOut color="#fb2c36" className="size-5 mb-1" />
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="mt-auto flex gap-1 cursor-pointer items-end"
                >
                  <span>Delete Account</span>
                  <Trash color="#fb2c36" className="size-5 mb-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
