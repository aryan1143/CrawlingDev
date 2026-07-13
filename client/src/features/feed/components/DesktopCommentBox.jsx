import React from "react";
import ReviewForm from "./ReviewForm";

const DesktopCommentBox = ({ setRating, rating }) => {
  return (
    <div className="w-full h-7/10 flex flex-col p-3">
      <ReviewForm setRating={setRating} rating={rating} />
    </div>
  );
};

export default DesktopCommentBox;
