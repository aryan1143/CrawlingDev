import React from "react";
import constants from "../../../shared/constants.json";
import Modal from "../../../shared/ui/components/Modal";

const categories = constants.categories;
const skills = constants.skills;

const FilterModal = ({
  showFilterModal,
  setShowFilterModal,
  handleCategoryToggle,
  handleSkillToggle,
  selectedCategories,
  setSelectedCategories,
  selectedSkills,
  setSelectedSkills,
}) => {
  return (
    <Modal
      isOpen={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      title="Filters"
      className="max-w-3xl relative"
    >
      <h3 className="font-semibold text-lg mb-3">Category</h3>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <label
            key={category.id}
            className={`cursor-pointer rounded-full px-4 py-1 transition ${
              selectedCategories.includes(category.id)
                ? "bg-btn text-btn-text"
                : "bg-card-content/10 hover:bg-card-content/20"
            }`}
          >
            <input
              hidden
              type="checkbox"
              checked={selectedCategories.includes(category.id)}
              onChange={() => handleCategoryToggle(category.id)}
            />
            {category.name}
          </label>
        ))}
      </div>

      <h3 className="font-semibold text-lg mt-8 mb-3">Tech Stack</h3>

      <div className="flex flex-wrap gap-2 pb-12">
        {skills.map((skill) => (
          <label
            key={skill.name}
            className="cursor-pointer rounded-full px-3 py-1"
            style={{
              backgroundColor: selectedSkills.includes(skill.name)
                ? skill.bg_color
                : "#e5e7eb",
              color: selectedSkills.includes(skill.name)
                ? skill.text_color
                : "#374151",
            }}
          >
            <input
              hidden
              type="checkbox"
              checked={selectedSkills.includes(skill.name)}
              onChange={() => handleSkillToggle(skill.name)}
            />
            {skill.name}
          </label>
        ))}
      </div>
      <div className="absolute w-full bottom-0 left-0 flex justify-end gap-3 bg-card p-4 py-2 border-t border-card-content/30">
        <button
          onClick={() => {
            setSelectedCategories([]);
            setSelectedSkills([]);
            setShowFilterModal(false);
          }}
          className="rounded-lg border px-4 py-2"
        >
          Clear
        </button>

        <button
          onClick={() => setShowFilterModal(false)}
          className="rounded-lg bg-btn px-4 py-2 text-btn-text"
        >
          Apply
        </button>
      </div>
    </Modal>
  );
};

export default FilterModal;
