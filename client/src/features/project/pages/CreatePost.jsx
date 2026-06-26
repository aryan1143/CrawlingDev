import React from "react";
import Page from "../../../shared/ui/Page";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleX,
  EllipsisVertical,
  Info,
  Plus,
  Trash,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import constants from "../../../shared/constants.json";
import { useState } from "react";
import imageCompression from "browser-image-compression";
import {
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from "../api/project.api";
import { useDispatch } from "react-redux";
import { removeProject, setProject } from "../store/projectSlice";
import toast from "react-hot-toast";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { PuffLoader, PulseLoader } from "react-spinners";
import { FaGithub, FaGlobe } from "react-icons/fa";
import { VscGlobe } from "react-icons/vsc";
import { formateDateForProjectCard } from "../utils/dateFormater";
import { useRef } from "react";
import Modal from "../../../shared/ui/components/Modal";
import DropdownMenu from "../../../shared/ui/components/DropdownMenu";

const techStacks = constants.skills;
const categories = constants.categories;
const categoriesMap = new Map(categories.map((c) => [c.id, c.name]));
const techStacksColorMap = new Map(
  techStacks.map((t) => [
    t.name,
    { textColor: t.text_color, bgColor: t.bg_color },
  ]),
);

const CreatePost = () => {
  const navigate = useNavigate();

  const [showTechStackModal, setShowTechStackModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [live, setLive] = useState("");
  const [github, setGithub] = useState("");
  const [images, setImages] = useState([]);
  const [previewImagesUrl, setPreveiwImagesUrl] = useState([]);
  const [isValid, setIsValid] = useState({
    title: true,
    description: true,
    github: true,
    live: true,
  });

  const [postedProject, setPostedProject] = useState(null);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [techStacksInput, setTechStacksInput] = useState("");
  const [filteredTechStacksArray, setFilteredTechStacksArray] =
    useState(techStacks);
  const [isSearchingTechStacks, setIsSearchingTechStacks] = useState(false);
  const [techStackMap, setTechStackMap] = useState(new Map());

  function handleTechStacksInputOnChange(e) {
    setTechStacksInput(e.target.value);
    const filteredTechStacks = techStacks.filter((skill) =>
      skill.name.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    console.log(filteredTechStacks);
    setFilteredTechStacksArray(filteredTechStacks || techStacks);
  }

  function handleSelectTechStack(techStack) {
    const newMap = new Map(techStackMap);

    if (newMap.has(techStack.name)) {
      newMap.delete(techStack.name);
    } else {
      if (techStackMap.size >= 8) {
        toast.error("Can not select more than 8 skills!", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        return;
      }
      newMap.set(techStack.name, techStack);
    }

    setTechStackMap(newMap);
  }

  function validateForm(e) {
    const target = e.target;
    if (target.name === "techStacks") return;

    if (!target.value) {
      setIsValid((prev) => ({ ...prev, [target.name]: true }));
      return;
    }

    if (target.name === "title") {
      setIsValid((prev) => ({
        ...prev,
        title: /^[a-zA-Z0-9\s_|?:()'-]+$/.test(target.value),
      }));
    }

    if (target.name === "description") {
      setIsValid((prev) => ({
        ...prev,
        description: /^([a-zA-Z0-9\s.,'!"|?()@#&+_/\x27-])*$/.test(
          target.value,
        ),
      }));
    }

    if (target.name === "github") {
      setIsValid((prev) => ({
        ...prev,
        github: /^https?:\/\/(www\.)?github\.com\/.+$/i.test(target.value),
      }));
    }

    if (target.name === "live") {
      setIsValid((prev) => ({
        ...prev,
        live: /^https?:\/\//i.test(target.value),
      }));
    }
  }

  async function handleOnFileInputChange(e) {
    if (e.target.files.length > 3)
      return alert("More than 3 images can't be selected");

    const files = e.target.files;

    const options = {
      maxSizeMB: 4,
      maxWidthOrHeight: 1080,
      useWebWorker: true,
    };
    const compressedFilesPromise = Array.from(files).map(async (file) => {
      if (file.size > 3000000) return await imageCompression(file, options);
      return file;
    });
    const compressedFiles = await Promise.all(compressedFilesPromise);
    setPreveiwImagesUrl(
      compressedFiles.map((file) => URL.createObjectURL(file)),
    );
    setImages(compressedFiles);
  }

  const [createProject, { isLoading, isError, error }] =
    useCreateProjectMutation();
  const dispatch = useDispatch();

  async function handleSubmit(e) {
    e.preventDefault();
    if (images.length === 0)
      return alert("Please select at least one image first");
    if (techStackMap.size === 0)
      return alert("Please select at least one tech stack first");

    const formData = new FormData();

    formData.append("title", title);
    formData.append("category", category);
    formData.append("description", description);
    github && formData.append("github", github);
    live && formData.append("live", live);
    [...techStackMap.keys()].forEach((techStack) => {
      formData.append("techStack[]", techStack);
    });
    images.forEach((image) => {
      formData.append("images", image);
    });

    try {
      const response = await createProject(formData);
      setPostedProject(response.data.project);
      dispatch(setProject(response.data.project));
      toast.success("Project posted successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to post project", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    }
  }

  const imageContainerRef = useRef(null);

  const [scrolledTo, setScrolledTo] = useState(1);
  const scrollSelf = (direction) => {
    const container = imageContainerRef.current;
    if (!container) return;
    if (
      (direction === "left" && scrolledTo <= 1) ||
      (direction === "right" && scrolledTo > postedProject?.images?.length - 1)
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

  const [deleteProject, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProjectMutation();
  async function handleOnDeleteProject() {
    if (confirm("Are you sure you want to delete this project.")) {
      try {
        await deleteProject(postedProject.id);
        dispatch(removeProject());
        toast.success("Project deleted successfully", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        setPostedProject(null);
        clearForm();
      } catch (error) {
        console.log(error);
        toast.error("Failed to delete project", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
      }
    }
  }

  function clearForm() {
    setTitle("");
    setDescription("");
    setCategory("");
    setLive("");
    setGithub("");
    setImages([]);
    setPreveiwImagesUrl([]);
  }

  return (
    <Page className="relative flex justify-center px-0 py-0 md:py-8 text-card-content overflow-hidden">
      <div
        className={`flex flex-col ${postedProject ? "md:w-40/100" : "md:w-60/100"} w-full min-h-full h-9/10 bg-card md:rounded-xl outline outline-gray-500/20`}
      >
        <div className="p-2 px-3 pb-1 w-full flex justify-between text-2xl border-b border-gray-400/50 font-semibold h-10">
          {isLoading || isDeleting ? (
            <span className="flex gap-1 items-center">
              {isDeleting ? "Deleting Post" : "Creating Post"}
              <PulseLoader
                color="var(--color-card-content)"
                size={5}
                className="mt-2"
              />
            </span>
          ) : postedProject ? (
            <span>Post Preview</span>
          ) : (
            <span>Create Post</span>
          )}
          <button onClick={() => navigate("/")}>
            <X />
          </button>
        </div>
        {postedProject ? (
          <>
            <div className="relative w-full md:w-9/10 h-[calc(90%-2.5rem)] md:h-[calc(85%-2.5rem)] bg-card text-card-content mx-auto md:mt-4 overflow-y-scroll scrollbar-thin rounded-xl md:border border-card-content/20">
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
                  {postedProject.images.length > 1 && (
                    <>
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white rounded-full h-fit text-sm">
                        {scrolledTo}/{postedProject.images.length || 0}
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
                  {postedProject.images.map((image) => (
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
                <div className="flex flex-col w-full pb-4 border-b-2 px-2 border-gray-400/30 mt-2">
                  <div className="w-full flex justify-between">
                    <span className="p-1 px-3 w-fit rounded-xl bg-btn/15 text-btn">
                      {categoriesMap.get(postedProject.category)}{" "}
                    </span>
                    <DropdownMenu
                      trigger={<EllipsisVertical />}
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
                  <h1 className="font-semibold text-3xl mt-3 ml-2 max-w-9/10 truncate">
                    {postedProject.title}
                  </h1>
                  <p className="mt-3 ml-2 text-card-content/65 line-clamp-2">
                    {postedProject.description}
                  </p>
                </div>
                <div className="flex flex-col w-full pb-4 border-b-2 px-2 border-gray-400/30 mt-2">
                  <span className="flex justify-between font-semibold text-[1rem] text-card-content/70">
                    Tech Stacks{" "}
                    {postedProject.tech_stack.length > 3 && (
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
                      {postedProject.tech_stack.length &&
                        postedProject.tech_stack.map((techStack) => {
                          return (
                            <div
                              style={{
                                backgroundColor:
                                  techStacksColorMap.get(techStack).bgColor,
                                color:
                                  techStacksColorMap.get(techStack).textColor,
                              }}
                              className={`flex h-fit items-center p-2 py-0.5 rounded-full`}
                            >
                              {techStack}
                            </div>
                          );
                        })}
                    </div>
                  </Modal>
                  <div className="w-full flex gap-2 space-y-0.5 px-2 pb-2 mt-3">
                    {postedProject.tech_stack.length &&
                      postedProject.tech_stack.slice(0, 3).map((techStack) => {
                        return (
                          <div
                            style={{
                              backgroundColor:
                                techStacksColorMap.get(techStack).bgColor,
                              color:
                                techStacksColorMap.get(techStack).textColor,
                            }}
                            className={`flex h-fit items-center p-2 py-0.5 rounded-full`}
                          >
                            {techStack}
                          </div>
                        );
                      })}
                  </div>
                </div>
                <div className="flex w-full pb-4 px-2 md:px-4 mt-4 text-xl md:text-[1.05rem] gap-4">
                  {postedProject?.github_link && (
                    <Link
                      to={postedProject.github_link}
                      target="_blank"
                      className="flex font-semibold gap-1 justify-center items-center text-card-content/80 hover:text-link-hover"
                    >
                      <FaGithub />
                      GitHub
                    </Link>
                  )}
                  {postedProject?.live_link && (
                    <Link
                      to={postedProject.live_link}
                      target="_blank"
                      className="flex font-semibold gap-1 justify-center items-center text-card-content/80 hover:text-link-hover"
                    >
                      <FaGlobe />
                      Live Demo
                    </Link>
                  )}
                  <span className="flex gap-1 justify-center items-center text-card-content/80 ml-auto">
                    {formateDateForProjectCard(postedProject.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full grow flex gap-2 justify-between items-center px-2 md:px-6 text-xl">
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
          </>
        ) : (
          <div className="relative w-full h-[calc(100%-2.5rem)] flex flex-col justify-between gap-2 text-2xl md:text-[1.15rem]">
            {isLoading && (
              <div className="absolute top-1/2 left-1/2 -translate-1/2 w-full h-full flex flex-col gap-2 justify-center items-center bg-card-content/10 backdrop-blur-2xl md:rounded-b-xl z-30">
                <PuffLoader color="var(--color-card-content)" />
                <p className="font-semibold text-2xl text-card-content/75">
                  Posting
                </p>
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              id="form"
              onChange={validateForm}
              className="flex flex-wrap justify-between gap-y-4 content-start w-full max-w-full grow overflow-y-auto pb-2 mt-4 px-6"
            >
              <div className="flex gap-0.5 flex-col w-full  md:w-48/100">
                <label
                  htmlFor="title"
                  className="flex gap-4 text-xl md:text-[1rem]"
                >
                  <p>Title *</p>
                  {!isValid.title && (
                    <span className="text-error flex items-center gap-1">
                      <CircleX size={12} />
                      <p>Invalid Title</p>
                    </span>
                  )}
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  title="Invalid title"
                  value={title}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter the project title..."
                  className={`outline ${isValid.title ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
                />
              </div>

              <div className="flex flex-col  gap-0.5 w-full md:w-48/100">
                <label
                  htmlFor="category"
                  className="flex gap-4 text-xl md:text-[1rem]"
                >
                  <p>Category *</p>
                </label>
                <select
                  id="category"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                  required
                  className={`outline outline-card-content/20 bg-card-content/5 rounded w-full px-2 py-1`}
                >
                  <option value="" hidden>
                    Choose Category
                  </option>

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col  gap-0.5 w-full">
                <label
                  htmlFor="description"
                  className="flex gap-4 text-xl md:text-[1rem]"
                >
                  <p>Description *</p>
                  {!isValid.description && (
                    <span className="text-error flex items-center gap-1">
                      <CircleX size={12} />
                      <p>Invalid Description</p>
                    </span>
                  )}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  id="description"
                  required
                  placeholder="Write about the project..."
                  className={`outline ${isValid.description ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full field-sizing-content min-h-35 px-2 py-1`}
                ></textarea>
              </div>

              <div className="flex flex-col gap-0.5 w-full">
                <p className=" text-xl md:text-[1rem]">
                  Images * (At least one image is required)
                </p>
                <label
                  htmlFor={previewImagesUrl.length === 0 ? "images" : ""}
                  className={`cursor-pointer outline-2 outline-dashed outline-card-content/20 flex flex-col justify-center items-center gap-2 bg-card-content/5 rounded w-full min-h-35 px-2 py-1`}
                >
                  {previewImagesUrl.length === 0 ? (
                    <>
                      <Upload className="size-3/10 text-card-content opacity-70" />
                      <p className="text-card-content opacity-70">
                        Upload Images (Up to 3)
                      </p>
                    </>
                  ) : (
                    <>
                      {previewImagesUrl.map((url) => (
                        <img
                          src={url}
                          className="my-2 border border-card-content"
                        />
                      ))}
                      <button
                        onClick={() => {
                          setPreveiwImagesUrl([]);
                          setImages([]);
                        }}
                        type="button"
                        className="flex justify-center items-center p-1 rounded-xl font-semibold px-2 text-error mt-auto mb-2"
                      >
                        Clear <Trash2 className="h-7/10" />
                      </button>
                    </>
                  )}
                </label>
                <input
                  id="images"
                  type="file"
                  name="images"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleOnFileInputChange}
                />
              </div>

              <div className="flex flex-col  gap-0.5 w-full md:w-48/100">
                <label
                  htmlFor="github"
                  className="flex gap-4 text-xl md:text-[1rem]"
                >
                  <p>Github Repo Link (optional)</p>
                  {!isValid.github && (
                    <span className="text-error flex items-center gap-1">
                      <CircleX size={12} />
                      <p>Invalid</p>
                    </span>
                  )}
                </label>
                <input
                  id="github"
                  type="text"
                  name="github"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="Add the github repo..."
                  className={`outline ${isValid.github ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
                />
              </div>

              <div className="flex flex-col  gap-0.5 w-full md:w-48/100">
                <label
                  htmlFor="github"
                  className="flex gap-4 text-xl md:text-[1rem]"
                >
                  <p>Live Link (optional)</p>
                  {!isValid.live && (
                    <span className="text-error flex items-center gap-1">
                      <CircleX size={12} />
                      <p>Invalid</p>
                    </span>
                  )}
                </label>
                <input
                  id="live"
                  type="text"
                  name="live"
                  value={live}
                  onChange={(e) => setLive(e.target.value)}
                  placeholder="Add live link of project..."
                  className={`outline ${isValid.live ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
                />
              </div>

              <div className="relative flex flex-col  gap-0.5 w-full">
                <label htmlFor="skills" className="text-xl md:text-[1rem]">
                  TechStacks *
                </label>
                <input
                  id="skills"
                  type="text"
                  name="skills"
                  onFocus={() => setIsSearchingTechStacks(true)}
                  onBlur={() => setIsSearchingTechStacks(false)}
                  value={techStacksInput}
                  onChange={handleTechStacksInputOnChange}
                  placeholder="Search skills..."
                  className="outline outline-card-content/20 bg-card-content/5 rounded w-full px-2 py-1"
                />
                {isSearchingTechStacks &&
                  filteredTechStacksArray.length !== 0 && (
                    <div className="absolute top-full left-0 flex flex-col max-h-45 bg-card border-2 border-gray-400 mt-1 rounded-md overflow-y-hidden pb-1">
                      <p className="ml-auto pr-3">{techStackMap.size}/8</p>
                      <div className="flex flex-wrap gap-2 w-full h-fit max-h-30 overflow-auto px-2 pb-2 pt-1">
                        {filteredTechStacksArray.map((skill) => {
                          return (
                            <div
                              style={{
                                backgroundColor: skill.bg_color,
                                color: skill.text_color,
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectTechStack(skill)}
                              className={`flex items-center hover:brightness-90 p-2 py-0.5 cursor-pointer rounded-full ${techStackMap.has(skill.name) && `outline-3 outline-[${skills.text_color}]`}`}
                            >
                              {skill.name}
                              {techStackMap.has(skill.name) ? (
                                <Check />
                              ) : (
                                <Plus className="h-7/10" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex flex-col w-full">
                <p className="ml-auto pr-3">{techStackMap.size}/8</p>
                <div className="w-full flex flex-wrap gap-2 space-y-0.5 px-2 pb-2">
                  {techStackMap.size === 0 ? (
                    <p className="mx-auto">No Tech Stack Selected</p>
                  ) : (
                    [...techStackMap].map((skill) => {
                      return (
                        <div
                          style={{
                            backgroundColor: skill[1].bg_color,
                            color: skill[1].text_color,
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectTechStack(skill[1])}
                          className={`flex h-fit items-center hover:brightness-90 p-2 py-0.5 cursor-pointer rounded-full ${techStackMap.has(skill[1].name) && `outline-3 outline-[${skill[1].text_color}]`}`}
                        >
                          {skill[1].name}
                          <Check className="h-7/10" />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </form>

            <div className="px-6 w-full mt-auto mb-4">
              <button
                disabled={isLoading}
                type="submit"
                form="form"
                className="w-full bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-text rounded-md p-3 lg:p-1 cursor-pointer"
              >
                {isLoading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default CreatePost;
