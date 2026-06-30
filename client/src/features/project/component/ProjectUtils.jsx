import { Plus } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Filter } from "lucide-react";
import Modal from "../../../shared/ui/components/Modal";
import FilterModal from "./FilterModal";

const ProjectUtils = ({
  projects,
  sortBy,
  setSortBy,
  sortByOptions,
  handleCategoryToggle,
  handleSkillToggle,
  selectedSkills,
  setSelectedSkills,
  selectedCategories,
  setSelectedCategories,
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);

  return (
    <div className="w-28/100 bg-card h-8/10 rounded-2xl outline outline-gray-500/20 text-card-content flex flex-col gap-4 p-4">
      <Link
        to={"/create"}
        className="w-full p-3 bg-btn text-btn-text rounded-full flex gap-2 justify-center items-center text-xl hover:bg-btn-primary-hover font-semibold shrink-0"
      >
        <Plus />
        Post Project
      </Link>
      <button
        onClick={() => setShowFilterModal(true)}
        className={`flex justify-center items-center gap-2 rounded-full p-3 border-2 border-card-content/30 text-xl ${selectedCategories.length > 0 || selectedSkills.length > 0 ? "bg-btn text-btn-text" : "text-card-content/90 hover:text-card-content"}`}
      >
        <Filter size={18} />
        Filters
      </button>
      <form className="w-full h-fit flex flex-wrap gap-2 p-3 pt-0 mt-2 border-2 border-card-content/30 rounded-2xl">
        <span className="w-full p-2 text-xl font-semibold">Sort By</span>

        {sortByOptions.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer px-5 py-1 rounded-full transition-colors ${
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
      </form>
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
    </div>
  );
};

export default ProjectUtils;
