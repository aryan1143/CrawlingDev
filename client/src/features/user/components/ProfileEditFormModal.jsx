import { Check, CircleX, Info, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import constants from "../../../shared/constants.json";
import toast from "react-hot-toast";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { useDispatch } from "react-redux";
import { setUser } from "../../auth/store/authSlice";
import { useUpdateProfileMutation } from "../api/user.api";
import Tooltip from "../../../shared/ui/components/Tooltip";

const ProfileEditFormModal = ({ setIsEditing, user }) => {
  const dispatch = useDispatch();
  const [updateProfile, { isLoading, isError, error }] =
    useUpdateProfileMutation();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  const [isValid, setIsValid] = useState({
    name: true,
    bio: true,
    linkedin: true,
    github: true,
  });

  const [skillsInput, setSkillsInput] = useState("");

  const [isSearchingSkills, setIsSearchingSkills] = useState(false);

  const skillsColor = constants.skills;

  const [filteredSkillsArray, setFilteredSkillsArray] = useState(skillsColor);

  function handleSkillsInputOnChange(e) {
    setSkillsInput(e.target.value);
    const filteredSkills = skillsColor.filter((skill) =>
      skill.name.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    console.log(filteredSkills);
    setFilteredSkillsArray(filteredSkills || skillsColor);
  }

  const [skillsMap, setSkillsMap] = useState(new Map());

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setLinkedin(user?.linkedin || "");
    setGithub(user?.github || "");

    const existingSkills = new Map();

    user?.skills?.forEach((skillName) => {
      const matchingSkill = skillsColor.find(
        (skill) => skill.name === skillName,
      );

      if (matchingSkill) {
        existingSkills.set(matchingSkill.name, matchingSkill);
      }
    });

    setSkillsMap(existingSkills);
  }, [skillsColor, user]);

  function handleSelectSkill(skill) {
    const newMap = new Map(skillsMap);

    if (newMap.has(skill.name)) {
      newMap.delete(skill.name);
    } else {
      if (skillsMap.size >= 8) {
        toast.error("Can not select more than 8 skills!", {
          position: isDesktop ? "bottom-right" : "top-center",
        });
        return;
      }
      newMap.set(skill.name, skill);
    }

    setSkillsMap(newMap);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isLoading) return;
    if (!(isValid.name && isValid.bio && isValid.github && isValid.linkedin)) {
      toast.error("Please fill valid profile data", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      return;
    }

    if (
      name === user?.name &&
      bio === user?.bio &&
      github === user?.github &&
      linkedin === user?.linkedin &&
      skillsMap.size === user?.skills.length &&
      user.skills.every((val, index) => skillsMap.has(val))
    ) {
      toast.success("Profile updated successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      setIsEditing(false);
      return;
    }

    const profileData = {
      name,
      bio,
      skills: [...skillsMap.keys()],
      linkedin: linkedin.trim(),
      github: github.trim(),
    };

    try {
      const response = await updateProfile(profileData).unwrap();
      dispatch(setUser(response.user));
      toast.success("Profile updated successfully", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.data?.error || "Failed to update profile", {
        position: isDesktop ? "bottom-right" : "top-center",
      });
    }
  }

  function validateForm(e) {
    const target = e.target;
    if (target.name === "skills") return;

    if (!target.value) {
      setIsValid((prev) => ({ ...prev, [target.name]: true }));
      return;
    }

    if (target.name === "name") {
      setIsValid((prev) => ({
        ...prev,
        name: /^[a-zA-Z]+([ \x27-][a-zA-Z]+)*$/.test(target.value),
      }));
    }

    if (target.name === "bio") {
      setIsValid((prev) => ({
        ...prev,
        bio: /^([a-zA-Z0-9\s.,'!"?()@#&+_/\x27-])*$/.test(target.value),
      }));
    }

    if (target.name === "github") {
      setIsValid((prev) => ({
        ...prev,
        github:
          /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9](-?[a-zA-Z0-9])*\/?$/.test(
            target.value,
          ),
      }));
    }

    if (target.name === "linkedin") {
      setIsValid((prev) => ({
        ...prev,
        linkedin:
          /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]{3,100}\/?$/.test(
            target.value,
          ),
      }));
    }
  }

  console.log(isValid);

  return (
    <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center md:p-5 z-20">
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="flex flex-col h-full w-full md:w-4/10 bg-card md:rounded-xl outline outline-gray-500/20"
      >
        <div className="flex justify-between w-full -mt-0.5 border-b border-gray-400/50 px-2 pt-2">
          <h2 className="text-2xl md:text-xl font-semibold">Edit</h2>
          <button onClick={() => setIsEditing(false)} className="h-fit w-fit">
            <X />
          </button>
        </div>

        <form
          onChange={validateForm}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 h-[calc(100%-2.5rem)] w-full px-5 mt-4 text-2xl md:text-[1.15rem]"
        >
          <div className="flex gap-0.5 flex-col w-full">
            <label htmlFor="name" className="flex gap-4 text-xl md:text-[1rem]">
              <p>Full Name</p>
              {!isValid.name && (
                <Tooltip
                  text="Name should not contains numbers or spacial characters!"
                  trigger="hover"
                >
                  <span className="text-error flex items-center gap-0.5">
                    <p>{"Invalid name"}</p>
                    <Info className="h-3.5" />
                  </span>
                </Tooltip>
              )}
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              title="Invalid name"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name..."
              className={`outline ${isValid.name ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
            />
          </div>

          <div className="flex flex-col  gap-0.5 w-full">
            <label htmlFor="bio" className="flex gap-4 text-xl md:text-[1rem]">
              <p>Bio</p>
              {!isValid.bio && (
                <Tooltip
                  text="Bio should not contains invalid characters!"
                  trigger="hover"
                >
                  <span className="text-error flex items-center gap-0.5">
                    <p>{"Invalid Bio"}</p>
                    <Info className="h-3.5" />
                  </span>
                </Tooltip>
              )}
            </label>
            <input
              id="bio"
              type="text"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write about you..."
              className={`outline ${isValid.bio ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
            />
          </div>

          <div className="flex flex-col  gap-0.5 w-full">
            <label
              htmlFor="github"
              className="flex gap-4 text-xl md:text-[1rem]"
            >
              <p>Github Link</p>
              {!isValid.github && (
                <Tooltip
                  text="Please input a valid github profile url"
                  trigger="hover"
                >
                  <span className="text-error flex items-center gap-0.5">
                    <p>{"Invalid github URL"}</p>
                    <Info className="h-3.5" />
                  </span>
                </Tooltip>
              )}
            </label>
            <input
              id="github"
              type="text"
              name="github"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="Add your github profile..."
              className={`outline ${isValid.github ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
            />
          </div>

          <div className="flex flex-col  gap-0.5 w-full">
            <label
              htmlFor="github"
              className="flex gap-4 text-xl md:text-[1rem]"
            >
              <p>Linkedin Link</p>
              {!isValid.linkedin && (
                <Tooltip
                  text="Please input a valid linkedin profile url"
                  trigger="hover"
                >
                  <span className="text-error flex items-center gap-0.5">
                    <p>{"Invalid linkedin URL"}</p>
                    <Info className="h-3.5" />
                  </span>
                </Tooltip>
              )}
            </label>
            <input
              id="linkedin"
              type="text"
              name="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="Add your linkedin profile.."
              className={`outline ${isValid.linkedin ? "outline-card-content/20" : "outline-error"} bg-card-content/5 rounded w-full px-2 py-1`}
            />
          </div>

          <div className="relative flex flex-col  gap-0.5 w-full">
            <label htmlFor="skills" className="text-xl md:text-[1rem]">
              Skills
            </label>
            <input
              id="skills"
              type="text"
              name="skills"
              onFocus={() => setIsSearchingSkills(true)}
              onBlur={() => setIsSearchingSkills(false)}
              value={skillsInput}
              onChange={handleSkillsInputOnChange}
              placeholder="Search skills..."
              className="outline outline-card-content/20 bg-card-content/5 rounded w-full px-2 py-1"
            />
            {isSearchingSkills && filteredSkillsArray.length !== 0 && (
              <div className="absolute top-full left-0 flex flex-col max-h-45 bg-card border-2 border-gray-400 mt-1 rounded-md overflow-hidden pb-1">
                <p className="ml-auto pr-3">{skillsMap.size}/8</p>
                <div className="flex flex-wrap gap-2 w-full h-fit max-h-30 overflow-auto px-2 pb-2 pt-1">
                  {filteredSkillsArray.map((skill) => {
                    return (
                      <div
                        style={{
                          backgroundColor: skill.bg_color,
                          color: skill.text_color,
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectSkill(skill)}
                        className={`flex items-center hover:brightness-90 p-2 py-0.5 cursor-pointer rounded-full ${skillsMap.has(skill.name) && `outline-3 outline-[${skills.text_color}]`}`}
                      >
                        {skill.name}
                        {skillsMap.has(skill.name) ? (
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

          <div className="flex flex-col">
            <p className="ml-auto pr-3">{skillsMap.size}/8</p>
            <div className="w-full flex flex-wrap gap-2 space-y-0.5 px-2 pb-2">
              {skillsMap.size === 0 ? (
                <p className="mx-auto">No Skills Selected</p>
              ) : (
                [...skillsMap].map((skill) => {
                  return (
                    <div
                      style={{
                        backgroundColor: skill[1].bg_color,
                        color: skill[1].text_color,
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSkill(skill[1])}
                      className={`flex h-fit items-center hover:brightness-90 p-2 py-0.5 cursor-pointer rounded-full ${skillsMap.has(skill[1].name) && `outline-3 outline-[${skill[1].text_color}]`}`}
                    >
                      {skill[1].name}
                      <Check className="h-7/10" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            disabled={
              !(
                isValid.name &&
                isValid.bio &&
                isValid.github &&
                isValid.linkedin
              ) || isLoading
            }
            type="submit"
            className="w-full bg-btn-primary hover:bg-btn-primary-hover text-btn-primary-text rounded-md p-3 lg:p-1 cursor-pointer mt-auto mb-4"
          >
            {isLoading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditFormModal;
