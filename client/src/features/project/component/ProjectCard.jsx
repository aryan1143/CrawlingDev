import React, { useRef, useState } from "react";
import { PuffLoader } from "react-spinners";
import { ArrowLeft, ArrowRight, EllipsisVertical, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { FaGithub, FaGlobe } from "react-icons/fa";
import toast from "react-hot-toast";

import constants from "../../../shared/constants.json";
import DropdownMenu from "../../../shared/ui/components/DropdownMenu";
import Modal from "../../../shared/ui/components/Modal";
import { removeProject } from "../store/projectSlice";
import { formateDateForProjectCard } from "../utils/dateFormater";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { useDeleteProjectMutation } from "../api/project.api";

const techStacksColorMap = new Map(
  constants.skills.map((t) => [
    t.name,
    { textColor: t.text_color, bgColor: t.bg_color },
  ]),
);
const categoriesMap = new Map(constants.categories.map((c) => [c.id, c.name]));

const ProjectCard = ({
  project,
  onDelete = () => {
    console.log("Project deleted");
  },
  className = "",
  buttons = false,
  isSmall = false,
}) => {
  const [showTechStackModal, setShowTechStackModal] = useState(false);
  const [scrolledTo, setScrolledTo] = useState(1);

  const imageContainerRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const dispatch = useDispatch();

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

  const [deleteProject, { isLoading }] = useDeleteProjectMutation();

  const handleOnDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await deleteProject(project.id);
      dispatch(removeProject(project.id));
      toast.success("Project deleted successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      onDelete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    }
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
      className={`flex flex-col max h-full justify-around grow w-fit ${isSmall ? "" : "h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)]"} ${className}`}
    >
      <div
        className={`relative flex flex-col bg-card text-card-content mx-auto md:mt-4 rounded-xl md:border border-card-content/20 scrollbar-thin 
          ${isSmall ? "overflow-hidden w-full h-fit border border-card-content/30" : "overflow-y-auto w-full md:w-9/10 grow"}`}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col gap-2 justify-center items-center bg-card-content/10 backdrop-blur-2xl md:rounded-b-xl z-30">
            <PuffLoader color="var(--color-card-content)" />
            <p className="font-semibold text-2xl text-card-content/75">
              Deleting Project
            </p>
          </div>
        )}

        {/* Image Slider */}
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
          <header
            className={`border-b-2 border-gray-400/30 px-2 mt-2 ${isSmall ? "pb-2" : "pb-4"}`}
          >
            <div className="flex justify-between items-center w-full">
              <span
                className={`px-3 py-1 rounded-xl bg-btn/15 text-btn h-fit flex items-center justify-center ${isSmall && "text-sm px-2"}`}
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
                    onClick: handleOnDeleteProject,
                  },
                ]}
              />
            </div>
            <h1
              className={`font-semibold ml-2 max-w-9/10 truncate ${isSmall ? "text-2xl md:text-xl mt-1" : "text-3xl mt-3"}`}
            >
              {project.title}
            </h1>
            <p
              className={`ml-2 text-card-content/65 ${isSmall ? "text-[1rem] md:text-sm mt-1 line-clamp-1" : "mt-3  line-clamp-2"}`}
            >
              {project.description}
            </p>
          </header>

          <div
            className={`border-b-2 border-gray-400/30 px-2 ${isSmall ? "pb-0 mt-1" : "pb-4 mt-2"}`}
          >
            <div
              className={`flex justify-between font-semibold text-card-content/70 ${isSmall ? "text-[0.95rem] md:text-[0.85rem]" : "text-base"}`}
            >
              Tech Stacks
              {project.tech_stack.length > 3 && (
                <button
                  onClick={() => setShowTechStackModal(true)}
                  className="text-sm md:text-xs"
                >
                  View All
                </button>
              )}
            </div>
            <div
              className={`flex flex-wrap ${isSmall ? "text-[1rem] md:text-xs gap-1 md:gap-0.5 mt-2 md:mt-1 pb-3 md:pb-2" : "gap-2 mt-3 pb-2"}`}
            >
              {project.tech_stack.slice(0, 3).map(renderTechStack)}
            </div>
          </div>

          <footer
            className={`flex w-full px-2 md:px-4 gap-4 ${isSmall ? "text-[1rem] md:text-[0.85rem] pb-2 md:pb-1 mt-3 md:mt-1.5" : "text-xl md:text-[1.05rem] pb-4 mt-4"}`}
          >
            {project?.github_link && (
              <Link
                to={project.github_link}
                target="_blank"
                className="flex font-semibold gap-1 items-center text-card-content/80 hover:text-link-hover"
              >
                <FaGithub /> {!isSmall || (!isDesktop && "GitHub")}
              </Link>
            )}
            {project?.live_link && (
              <Link
                to={project.live_link}
                target="_blank"
                className="flex font-semibold gap-1 items-center text-card-content/80 hover:text-link-hover"
              >
                <FaGlobe /> {!isSmall || (!isDesktop && "Live Demo")}
              </Link>
            )}
            <span className="flex items-center text-card-content/80 ml-auto">
              {formateDateForProjectCard(project.created_at)}
            </span>
          </footer>
        </section>
      </div>

      {buttons && (
        <nav className="w-full h-fit py-2 flex gap-2 justify-between items-center px-2 md:px-6 text-xl">
          <Link
            to="/projects"
            className="border p-2.5 md:p-1 px-2 rounded-md w-full bg-btn-text text-btn flex justify-center items-center"
          >
            My Projects
          </Link>
          <Link
            to="/"
            className="flex justify-center items-center border p-2.5 md:p-1 px-2 rounded-md w-full bg-btn text-btn-text"
          >
            Go Home
          </Link>
        </nav>
      )}

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

export default ProjectCard;
