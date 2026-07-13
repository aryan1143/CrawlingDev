import { FaRegStar, FaStar } from "react-icons/fa";
import React from "react";
import { ArrowUp } from "lucide-react";

const ReviewForm = ({ setRating, rating }) => {
  const onFromChange = (e) => {
    if (e.target.name === "rating") {
      setRating(Number(e.target.value));
    }
  };

  return (
    <form
      className="w-full flex flex-col mt-auto gap-3"
      onChange={onFromChange}
    >
      <div className="w-screen md:w-full h-px bg-card-content/20 -ml-3 md:ml-0" />
      <div className="flex gap-4 justify-around md:justify-start mt-1 md:ml-4">
        <label className="cursor-pointer" htmlFor="1star">
          {rating >= 1 ? (
            <FaStar className="size-6" />
          ) : (
            <FaRegStar className="size-6" />
          )}
          <input
            type="radio"
            id="1star"
            name="rating"
            className="hidden"
            value={1}
          />
        </label>
        <label className="cursor-pointer" htmlFor="2star">
          {rating >= 2 ? (
            <FaStar className="size-6" />
          ) : (
            <FaRegStar className="size-6" />
          )}
          <input
            type="radio"
            id="2star"
            name="rating"
            className="hidden"
            value={2}
          />
        </label>
        <label className="cursor-pointer" htmlFor="3star">
          {rating >= 3 ? (
            <FaStar className="size-6" />
          ) : (
            <FaRegStar className="size-6" />
          )}
          <input
            type="radio"
            id="3star"
            name="rating"
            className="hidden"
            value={3}
          />
        </label>
        <label className="cursor-pointer" htmlFor="4star">
          {rating >= 4 ? (
            <FaStar className="size-6" />
          ) : (
            <FaRegStar className="size-6" />
          )}
          <input
            type="radio"
            id="4star"
            name="rating"
            className="hidden"
            value={4}
          />
        </label>
        <label className="cursor-pointer" htmlFor="5star">
          {rating >= 5 ? (
            <FaStar className="size-6" />
          ) : (
            <FaRegStar className="size-6" />
          )}
          <input
            type="radio"
            id="5star"
            name="rating"
            className="hidden"
            value={5}
          />
        </label>
      </div>
      <span className="flex w-full rounded-full border border-card-content/65 p-0.5 h-10">
        <input
          type="text"
          name="review"
          id="review"
          className="text-xl grow h-full p-3 md:p-1 md:px-3 focus:outline-0"
          placeholder="Write a review..."
        />
        <button className="shrink-0 rounded-full bg-btn p-1 h-full aspect-square">
          <ArrowUp className="size-full shrink-0 text-btn-text" />
        </button>
      </span>
    </form>
  );
};

export default ReviewForm;
