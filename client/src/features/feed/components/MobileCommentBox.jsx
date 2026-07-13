import { X } from "lucide-react";
import React from "react";
import ReviewForm from "./ReviewForm";

const MobileCommentBox = ({ setIsCommentBoxOpened, setRating, rating }) => {
  return (
    <div
      onClick={() => setIsCommentBoxOpened(false)}
      className="fixed top-0 left-0 w-screen h-screen z-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="comment-box fixed bottom-0 left-0 w-full h-7/10 bg-card rounded-t-2xl border border-card-content/60 p-3 flex flex-col"
      >
        <span className="mt-0 flex w-full px-1 justify-between">
          <p className="text-xl font-semibold">Reviews</p>
          <button onClick={() => setIsCommentBoxOpened(false)}>
            <X />
          </button>
        </span>
        <ReviewForm setRating={setRating} rating={rating} />
      </div>
    </div>
  );
};

export default MobileCommentBox;
