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
import ProjectCard from "../component/ProjectCard";

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
      console.log(response);
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

  function clearForm() {
    setTitle("");
    setDescription("");
    setCategory("");
    setLive("");
    setGithub("");
    setImages([]);
    setPreveiwImagesUrl([]);
  }

  const [deleteProject, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProjectMutation();

  function onDeleteProject() {
    clearForm();
    setPostedProject(null);
  }
  return (
    <Page className="relative flex justify-center px-0 py-0 md:py-8 text-card-content overflow-hidden">
      <div
        className={`flex flex-col ${postedProject ? "md:w-40/100" : "md:w-60/100"} w-full h-full bg-card md:rounded-xl outline outline-gray-500/20`}
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
          <ProjectCard
            project={postedProject}
            deleteProject={deleteProject}
            onDelete={onDeleteProject}
            isDeleting={isDeleting}
            buttons={true}
          />
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
