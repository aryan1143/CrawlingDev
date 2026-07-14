import React, { useRef, useState } from "react";
import { PuffLoader } from "react-spinners";
import {
  ArrowLeft,
  ArrowRight,
  EllipsisVertical,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaGithub, FaGlobe, FaStar } from "react-icons/fa";
import { MdOutlineReviews } from "react-icons/md";
import { VscThumbsup, VscThumbsupFilled } from "react-icons/vsc";
import { toast } from "react-hot-toast";

import constants from "../../../shared/constants.json";
import DropdownMenu from "../../../shared/ui/components/DropdownMenu";
import Modal from "../../../shared/ui/components/Modal";
import { formateDateForProjectCard } from "../../project/utils/dateFormater";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { formateDateForFeed } from "../utils/formateDateForFeed";
import DesktopCommentBox from "./DesktopCommentBox";
import MobileCommentBox from "./MobileCommentBox";
import {
  useDislikePostMutation,
  useLikePostMutation,
} from "../../project/api/project.api";
import { confirmLike, tempAddLike, tempRemoveLike } from "../store/feedSlice";

const techStacksColorMap = new Map(
  constants.skills.map((t) => [
    t.name,
    { textColor: t.text_color, bgColor: t.bg_color },
  ]),
);
const categoriesMap = new Map(constants.categories.map((c) => [c.id, c.name]));

const FeedProjectCard = ({
  project,
  className = "",
  setIsCommentBoxOpened,
  isCommentBoxOpened,
  openedCommentBoxId,
  setOpenedCommentBoxId,
}) => {
  const [showTechStackModal, setShowTechStackModal] = useState(false);
  const [scrolledTo, setScrolledTo] = useState(1);

  const [rating, setRating] = useState(0);

  const imageContainerRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const dispatch = useDispatch();
  const [likePost, { isLoading: isLiking }] = useLikePostMutation();
  const [dislikePost, { isLoading: isDisliking }] = useDislikePostMutation();

  async function onLikeClick(projectId, isLiked) {
    if (isLiking || isDisliking) return;

    if (isLiked) {
      try {
        dispatch(tempRemoveLike(projectId));
        const response = await dislikePost(projectId);
        dispatch(
          confirmLike({
            projectId,
            likes_count: response.data.likesCount,
            is_liked: false,
          }),
        );
      } catch (error) {
        dispatch(tempAddLike(projectId));
        toast.error(error?.data?.error || "Failed to dislike the project!", {
          position: "top-center",
        });
      }
    } else {
      try {
        dispatch(tempAddLike(projectId));
        const response = await likePost(projectId);
        dispatch(
          confirmLike({
            projectId,
            likes_count: response.data.likesCount,
            is_liked: true,
          }),
        );
      } catch (error) {
        dispatch(tempRemoveLike(projectId));
        toast.error(error?.data?.error || "Failed to like the project!", {
          position: "top-center",
        });
      }
    }
  }

  const scrollSelf = (direction) => {
    const container = imageContainerRef.current;
    if (!container) return;

    const isLeft = direction === "left";
    if (
      (isLeft && scrolledTo <= 1) ||
      (!isLeft && scrolledTo > project?.images?.length - 1)
    )
      return;

    container.scrollBy({
      left: isLeft ? -container.offsetWidth : container.offsetWidth,
      behavior: "smooth",
    });

    setScrolledTo((prev) => (isLeft ? prev - 1 : prev + 1));
  };

  const renderTechStack = (techStack) => {
    const colors = techStacksColorMap.get(techStack) || {};
    return (
      <span
        key={techStack}
        style={{ backgroundColor: colors.bgColor, color: colors.textColor }}
        className="inline-flex h-fit items-center p-2 py-0.5 rounded-full"
      >
        {techStack}
      </span>
    );
  };

  return (
    <article
      className={`flex flex-col min-h-fit justify-around grow w-full h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)] ${className}`}
    >
      <div
        className={`relative flex flex-col bg-card text-card-content mx-auto border md:rounded-xl border-card-content/20 w-full grow`}
      >
        <div className="relative w-fit max-w-7/10 flex p-2 px-3 gap-2 items-center">
          <span className="rounded-full h-10 w-10 shrink-0">
            <img
              src={project.author_profile_pic}
              className="object-cover w-full h-full rounded-full"
            />
          </span>
          <div className="h-fit flex flex-col w-7/10">
            <h3 className="font-semibold -mb-1 truncate max-w-full grow">
              {project.author_name}
            </h3>
            <p className="text-sm text-card-content/70 truncate min-w-full w-fit">
              {project.author_bio || "User hasn't set any bio yet"}
            </p>
          </div>
        </div>

        <header className="px-2 pb-2">
          <div className="flex justify-between items-center w-full">
            <h1 className="font-semibold ml-2 max-w-8/10 truncate text-[1.1rem] mr-1">
              {project.title}
            </h1>
            •
            <span className="flex items-center text-card-content/80 mr-auto ml-1 shrink-0">
              {formateDateForFeed(project.created_at)}
            </span>
            <span className="px-2 py-0.5 md:py-1 md:px-3 text-sm rounded-md md:rounded-xl bg-btn/15 text-btn h-fit flex items-center justify-center">
              {categoriesMap.get(project.category)}
            </span>
          </div>

          <p className="ml-2 text-card-content/65 line-clamp-2 text-[1rem]">
            {project.description}
          </p>
        </header>

        <div className="relative w-fit h-fit">
          <figure
            ref={imageContainerRef}
            className="flex w-full aspect-video bg-gray-900 overflow-x-scroll scrollbar-none snap-x snap-mandatory"
          >
            {project.images.length > 1 && (
              <>
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white rounded-full h-fit text-sm">
                  {scrolledTo}/{project.images.length || 0}
                </span>
                <button
                  onClick={() => scrollSelf("left")}
                  className="absolute top-1/2 left-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black text-white rounded-full aspect-square"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => scrollSelf("right")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 p-1 bg-black/50 hover:bg-black text-white rounded-full aspect-square"
                >
                  <ArrowRight size={14} />
                </button>
              </>
            )}
            {project.images.map((image) => (
              <div
                key={image}
                className="w-full min-w-full aspect-video flex justify-center items-center snap-start"
              >
                <img
                  src={image}
                  className="w-full h-full p-1 rounded-t-xl object-contain"
                />
              </div>
            ))}
          </figure>
        </div>

        <section className="flex flex-col w-full grow p-2">
          <div className="border-b-2 border-gray-400/30 px-2 pb-2 mt-1">
            <div className="flex justify-between font-semibold text-card-content/70 text-base">
              Tech Stacks
              {project.tech_stack.length > 4 && (
                <button
                  onClick={() => setShowTechStackModal(true)}
                  className="text-sm md:text-xs"
                >
                  View All
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mt-3 pb-2">
              {project.tech_stack.slice(0, 4).map(renderTechStack)}
            </div>
          </div>

          <footer className="flex w-full px-2 md:px-4 gap-6 text-xl md:text-[1.05rem] mt-3 pb-1 items-center">
            <span className="h-fit flex gap-1 justify-center items-center text-card-content/70 hover:text-card-content/85 cursor-pointer">
              <button
                onClick={() => onLikeClick(project.id, project.is_liked)}
                className={`flex justify-center items-center gap-1 ${isLiking || isDisliking ? "opacity-60" : ""}`}
              >
                {project.is_liked ? (
                  <VscThumbsupFilled className="size-6 -mt-1 text-card-content/95" />
                ) : (
                  <VscThumbsup className="size-6 -mt-1" />
                )}
                <p className="h-fit font-semibold">
                  {project.likes_count || 0}
                </p>
              </button>
            </span>
            <button
              onClick={() => {
                setIsCommentBoxOpened(true);
                setOpenedCommentBoxId(project.id);
              }}
              className="flex gap-1 justify-center items-center text-card-content/70 hover:text-card-content/85 cursor-pointer"
            >
              <MdOutlineReviews className="size-6 -mb-0.5" />
              <p className="h-fit font-semibold">0</p>
            </button>
            {project?.github_link && (
              <Link
                to={project.github_link}
                target="_blank"
                className="flex font-semibold gap-1 items-center text-card-content/80 hover:text-link-hover ml-auto"
              >
                <FaGithub /> {isDesktop && "Github"}
              </Link>
            )}

            {project?.live_link && (
              <Link
                to={project.live_link}
                target="_blank"
                className="flex font-semibold gap-1 items-center text-card-content/80 hover:text-link-hover "
              >
                <FaGlobe /> {isDesktop && "Live Demo"}
              </Link>
            )}
          </footer>
          {isCommentBoxOpened &&
            openedCommentBoxId === project.id &&
            (isDesktop ? (
              <DesktopCommentBox setRating={setRating} rating={rating} />
            ) : (
              <MobileCommentBox
                setIsCommentBoxOpened={setIsCommentBoxOpened}
                setRating={setRating}
                rating={rating}
              />
            ))}
        </section>
      </div>

      <Modal
        isOpen={showTechStackModal}
        onClose={() => setShowTechStackModal(false)}
        title="Tech Stacks"
      >
        <div className="flex flex-wrap gap-2 px-2 pb-2 mt-3">
          {project.tech_stack.map(renderTechStack)}
        </div>
      </Modal>
    </article>
  );
};

export default FeedProjectCard;
