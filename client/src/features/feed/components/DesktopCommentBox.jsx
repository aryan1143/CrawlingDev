import React from "react";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import { useSelector } from "react-redux";
import ReviewCardSkeleton from "./ReviewCardSkeleton";

const DesktopCommentBox = ({
  setRating,
  rating,
  comment,
  setComment,
  onSubmit,
  isSubmiting,
  reviews,
  isFetching,
}) => {
  const user = useSelector((state) => state.auth.user);
  const hasUserReviewed = reviews.find((review) => review.user_id === user.id);
  return (
    <div className="w-full h-7/10 flex flex-col p-3 gap-1">
      {isFetching
        ? [1, 2].map((e) => <ReviewCardSkeleton key={e} />)
        : reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
      {!isFetching && reviews.length <= 0 ? (
        <div className="w-full flex justify-center items-center">
          No Reviews
        </div>
      ) : (
        ""
      )}
      {!hasUserReviewed && (
        <ReviewForm
          setRating={setRating}
          rating={rating}
          comment={comment}
          setComment={setComment}
          onSubmit={onSubmit}
          isSubmiting={isSubmiting}
        />
      )}
    </div>
  );
};

export default DesktopCommentBox;
