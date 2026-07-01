import React, { useEffect, useMemo, useState } from "react";
import Page from "../../../shared/ui/Page";
import Recommendetion from "../../user/components/Recommendetion";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { Filter, X } from "lucide-react";
import { useGetMyProjectsQuery } from "../api/project.api";
import ProjectCardSkeletonLoading from "../component/ProjectCardSkeletonLoading";
import ProjectCard from "../component/ProjectCard";
import ProjectUtils from "../component/ProjectUtils";
import FilterModal from "../component/FilterModal";
import Modal from "../../../shared/ui/components/Modal";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setProjects } from "../store/projectSlice";

const sortByOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "topRated", label: "Top Rated" },
  { value: "leastRated", label: "Least Rated" },
];

const Projects = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sortBy, setSortBy] = useState("latest");
  const [showSortByModal, setShowSortByModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetMyProjectsQuery();

  useEffect(() => {
    if (!data) return;
    dispatch(setProjects(data.projects));
  }, [data, isLoading]);
  const projects = useSelector((state) => state.project.projects);
  console.log(projects);

  const handleSkillToggle = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const filteredAndSortedProjects = useMemo(() => {
    if (!projects) return [];

    let baseProjects = [...projects];
    if (sortBy === "oldest") {
      baseProjects.reverse();
    }

    return baseProjects.filter((project) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(project.category);

      const skillMatch =
        selectedSkills.length === 0 ||
        selectedSkills.every((skill) => project.tech_stack.includes(skill));

      return categoryMatch && skillMatch;
    });
  }, [projects, sortBy, selectedCategories, selectedSkills]);

  return (
    <Page className="relative flex justify-between px-0 py-0 md:py-8 text-card-content overflow-y-auto md:overflow-hidden">
      <div className="flex flex-col md:w-70/100 w-full min-h-full h-full bg-card md:rounded-xl outline outline-gray-500/20 overflow-hidden">
        <div className="w-full h-12 p-3 py-4 text-2xl flex justify-between items-center pt-5 border-b border-b-card-content/20">
          <h1 className="px-3 font-semibold">Projects</h1>
          {!isDesktop && (
            <span className="flex gap-2 ml-auto mr-6">
              <button
                onClick={() => setShowFilterModal(true)}
                className={`px-2 py-0.5 border border-card-content rounded-full flex text-[1.2rem] justify-center items-center ${selectedCategories.length > 0 || selectedSkills.length > 0 ? "bg-btn text-btn-text" : ""}`}
              >
                <Filter size={18} />
                Filter
              </button>
              <button
                onClick={() => setShowSortByModal(true)}
                className="px-2 py-0.5 border border-card-content rounded-full flex text-[1.2rem] justify-center items-center"
              >
                Sort By
              </button>
            </span>
          )}
          <button onClick={() => navigate(-1)}>
            <X />
          </button>
        </div>

        <div className="w-full grow grid grid-cols-1 md:grid-cols-3 overflow-y-scroll scrollbar-thin gap-2 p-4 pt-2 items-stretch">
          {isLoading
            ? ["", "", "", "", "", ""].map((e, i) => (
                <ProjectCardSkeletonLoading
                  key={i}
                  className="md:h-fit"
                  isSmall={true}
                />
              ))
            : data &&
              filteredAndSortedProjects.map((project) => (
                <ProjectCard
                  project={project}
                  key={project.id}
                  className="md:h-fit"
                  isSmall={true}
                />
              ))}
        </div>
      </div>
      {isDesktop && (
        <ProjectUtils
          projects={projects}
          handleCategoryToggle={handleCategoryToggle}
          handleSkillToggle={handleSkillToggle}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedSkills={selectedSkills}
          setSelectedSkills={setSelectedSkills}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortByOptions={sortByOptions}
        />
      )}
      <FilterModal
        showFilterModal={showFilterModal}
        setShowFilterModal={setShowFilterModal}
        handleCategoryToggle={handleCategoryToggle}
        handleSkillToggle={handleSkillToggle}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        selectedSkills={selectedSkills}
        setSelectedSkills={setSelectedSkills}
      />
      <Modal
        title={"Sort By"}
        isOpen={showSortByModal}
        onClose={() => setShowSortByModal(false)}
        containerClassName="flex flex-wrap gap-3"
      >
        {sortByOptions.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer px-6 py-1 rounded-full transition-colors ${
              sortBy === option.value
                ? "bg-btn text-btn-text"
                : "bg-card-content/10 hover:bg-card-content/20"
            }`}
          >
            <input
              type="radio"
              name="sortBy"
              value={option.value}
              checked={sortBy === option.value}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden"
            />
            {option.label}
          </label>
        ))}
      </Modal>
    </Page>
  );
};

export default Projects;
