import { FaRegStar, FaStar } from "react-icons/fa";
import React, { useState } from "react";
import { ArrowUp } from "lucide-react";
import { toast } from "react-hot-toast";
import Spinner from "../../../shared/ui/components/Spinner";

const ReviewForm = ({
  setRating,
  rating,
  comment,
  setComment,
  onSubmit,
  isSubmiting,
}) => {
  const [isTriedToSubmit, setIsTriedToSubmit] = useState(false);
  const onFromChange = (e) => {
    if (e.target.name === "rating") {
      setRating(Number(e.target.value));
    }
    if (e.target.name === "review") {
      setComment(e.target.value);
    }
  };

  function handleReviewSubmit(e) {
    e.preventDefault();
    setIsTriedToSubmit(true);
    if (rating <= 0) {
      toast.error("Please rate the project to post a review!", {
        position: "top-center",
      });
      return;
    }

    if (!comment) {
      toast.error("Please write a review first!", {
        position: "top-center",
      });
      return;
    }

    onSubmit();
  }

  return (
    <form
      className={`w-full flex flex-col mt-auto gap-3 ${isSubmiting ? "opacity-70" : ""}`}
      onChange={onFromChange}
      onSubmit={handleReviewSubmit}
    >
      <div className="w-screen md:w-full h-px bg-card-content/20 -ml-3 md:ml-0" />
      <div className="flex gap-4 justify-around md:justify-start mt-1 md:ml-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <label key={star} htmlFor={`star-${star}`} className="cursor-pointer">
            <input
              type="radio"
              id={`star-${star}`}
              name="rating"
              value={star}
              checked={rating === star}
              className="hidden"
            />
            {rating >= star ? (
              <FaStar className="size-6 text-card-content/90" />
            ) : (
              <FaRegStar
                className={`size-6 ${isTriedToSubmit && rating <= 0 ? "text-error" : "text-card-content/70"}`}
              />
            )}
          </label>
        ))}
      </div>
      <span className="flex justify-center items-center w-full rounded-3xl border border-card-content/65 p-1 h-fit">
        <textarea
          name="review"
          id="review"
          className="text-xl grow field-sizing-content resize-none p-1 px-3 md:p-1 md:px-3 focus:outline-0 min-h-fit max-h-200"
          placeholder="Write a review..."
          value={comment}
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-btn p-1 h-full max-h-10 mt-auto aspect-square"
        >
          {isSubmiting ? (
            <Spinner colorClass="text-btn-text" />
          ) : (
            <ArrowUp className="size-full shrink-0 text-btn-text" />
          )}
        </button>
      </span>
    </form>
  );
};

export default ReviewForm;
