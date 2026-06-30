import React from "react";
import { useRef } from "react";
import { PuffLoader } from "react-spinners";
import constants from "../../../shared/constants.json";
import DropdownMenu from "../../../shared/ui/components/DropdownMenu";
import { ArrowLeft, ArrowRight, EllipsisVertical, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeProject } from "../store/projectSlice";
import Modal from "../../../shared/ui/components/Modal";
import { formateDateForProjectCard } from "../utils/dateFormater";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaGlobe } from "react-icons/fa";
import toast from "react-hot-toast";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";

const techStacks = constants.skills;
const categories = constants.categories;
const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
const techStacksColorMap = new Map(
  techStacks.map((t) => [
    t.name,
    { textColor: t.text_color, bgColor: t.bg_color },
  ]),
);

const ProjectCard = ({
  project,
  onDelete,
  deleteProject,
  isDeleting,
  className,
  buttons = false,
  isSmall = false,
}) => {
  const [showTechStackModal, setShowTechStackModal] = useState(false);
  const imageContainerRef = useRef(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [scrolledTo, setScrolledTo] = useState(1);
  const scrollSelf = (direction) => {
    const container = imageContainerRef.current;
    if (!container) return;
    if (
      (direction === "left" && scrolledTo <= 1) ||
      (direction === "right" && scrolledTo > project?.images?.length - 1)
    )
      return;

    const containerWidth = container.offsetWidth;

    container.scrollBy({
      left: direction === "left" ? -containerWidth : containerWidth,
      behavior: "smooth",
    });
    if (direction === "left") {
      setScrolledTo((prev) => prev - 1);
    } else {
      setScrolledTo((prev) => prev + 1);
    }
  };

  const dispatch = useDispatch();

  async function handleOnDeleteProject() {
    if (confirm("Are you sure you want to delete this project.")) {
      try {
        await deleteProject(project.id);
        dispatch(removeProject());
        toast.success("Project deleted successfully", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        onDelete();
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete project", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
      }
    }
  }

  return (
    <div className="w-fit h-full">
      <div
        className={`relative bg-card text-card-content mx-auto md:mt-4 ${isSmall ? "overflow-hidden w-full h-fit" : "overflow-y-scroll w-full md:w-9/10 h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)]"} scrollbar-thin rounded-xl md:border border-card-content/20 ${className}`}
      >
        {isDeleting && (
          <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full h-full flex flex-col gap-2 justify-center items-center bg-card-content/10 backdrop-blur-2xl md:rounded-b-xl z-30">
            <PuffLoader color="var(--color-card-content)" />
            <p className="font-semibold text-2xl text-card-content/75">
              Deleting Project
            </p>
          </div>
        )}
        <div className="relative w-fit h-fit">
          <div
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
              <div className="w-full min-w-full aspect-video flex justify-center items-center snap-start">
                <img
                  src={image}
                  className="w-full h-full p-1 rounded-t-xl object-contain"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col w-full grow p-2">
          <div
            className={`flex flex-col w-full ${isSmall ? "pb-2" : "pb-4"} border-b-2 px-2 border-gray-400/30 mt-2`}
          >
            <div className="w-full flex justify-between">
              <span
                className={`p-1 px-3 flex h-fit justify-center items-center w-fit rounded-xl bg-btn/15 text-btn ${isSmall && "text-sm py-1 px-2"}`}
              >
                {categoriesMap.get(project.category)}
              </span>
              <DropdownMenu
                trigger={<EllipsisVertical size={isSmall ? 16 : 22} />}
                options={[
                  {
                    label: "Delete Project",
                    icon: <Trash2 />,
                    danger: true,
                    onClick: () => handleOnDeleteProject(),
                  },
                ]}
              />
            </div>
            <h1
              className={`font-semibold ${isSmall ? "text-xl mt-1" : "text-3xl mt-3"} ml-2 max-w-9/10 truncate`}
            >
              {project.title}
            </h1>
            <p
              className={`ml-2 text-card-content/65 line-clamp-2 ${isSmall ? "text-sm mt-1" : "mt-3"}`}
            >
              {project.description}
            </p>
          </div>
          <div
            className={`flex flex-col w-full border-b-2 px-2 border-gray-400/30 ${isSmall ? "pb-0 mt-1" : "pb-4 mt-2"}`}
          >
            <span
              className={`flex justify-between font-semibold ${isSmall ? "text-[0.85rem]" : "text-[1rem]"} text-card-content/70`}
            >
              Tech Stacks{" "}
              {project.tech_stack.length > 3 && (
                <button
                  onClick={() => setShowTechStackModal(true)}
                  className="text-xs"
                >
                  View All
                </button>
              )}
            </span>
            <Modal
              isOpen={showTechStackModal}
              onClose={() => setShowTechStackModal(false)}
              title={"Tech Stacks"}
            >
              <div className="w-full flex flex-wrap gap-2 space-y-0.5 px-2 pb-2 mt-3">
                {project.tech_stack.length &&
                  project.tech_stack.map((techStack) => {
                    return (
                      <div
                        style={{
                          backgroundColor:
                            techStacksColorMap.get(techStack).bgColor,
                          color: techStacksColorMap.get(techStack).textColor,
                        }}
                        className={`flex h-fit items-center p-2 py-0.5 rounded-full`}
                      >
                        {techStack}
                      </div>
                    );
                  })}
              </div>
            </Modal>
            <div
              className={`w-full flex space-y-0.5 pb-2 ${isSmall ? "text-xs px-0 gap-0.5 mt-1" : "px-2 gap-2 mt-3"}`}
            >
              {project.tech_stack.length &&
                project.tech_stack.slice(0, 3).map((techStack) => {
                  return (
                    <div
                      style={{
                        backgroundColor:
                          techStacksColorMap.get(techStack).bgColor,
                        color: techStacksColorMap.get(techStack).textColor,
                      }}
                      className={`flex h-fit items-center p-2 py-0.5 rounded-full`}
                    >
                      {techStack}
                    </div>
                  );
                })}
            </div>
          </div>
          <div
            className={`flex w-full px-2 md:px-4 text-xl md:text-[1.05rem] gap-4 ${isSmall ? "pb-1 mt-1.5" : "pb-4 mt-4"}`}
          >
            {project?.github_link && (
              <Link
                to={project.github_link}
                target="_blank"
                className="flex font-semibold gap-1 justify-center items-center text-card-content/80 hover:text-link-hover"
              >
                <FaGithub />
                {!isSmall && "GitHub"}
              </Link>
            )}
            {project?.live_link && (
              <Link
                to={project.live_link}
                target="_blank"
                className="flex font-semibold gap-1 justify-center items-center text-card-content/80 hover:text-link-hover"
              >
                <FaGlobe />
                {!isSmall && "Live Demo"}
              </Link>
            )}
            <span
              className={`flex gap-1 justify-center items-center text-card-content/80 ml-auto ${isSmall ? "text-sm" : ""}`}
            >
              {formateDateForProjectCard(project.created_at)}
            </span>
          </div>
        </div>
      </div>
      {buttons && (
        <div className="w-full grow flex gap-2 justify-between items-center px-2 md:px-6 text-xl mt-auto">
          <button className="border h-fit p-2.5 md:p-1 px-2 rounded-md w-full bg-btn-text text-btn">
            My Projects
          </button>
          <Link
            to={"/"}
            className="flex justify-center items-center border h-fit p-2.5 md:p-1 px-2 rounded-md w-full bg-btn text-btn-text"
          >
            Go Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
