import { X } from "lucide-react";
import React from "react";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";
import ReviewCardSkeleton from "./ReviewCardSkeleton";
import { useSelector } from "react-redux";

const MobileCommentBox = ({
  setIsCommentBoxOpened,
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
        {isFetching
          ? [1, 2].map((e) => <ReviewCardSkeleton key={e} />)
          : reviews.map((review) => (
              <ReviewCard key={review?.id} review={review} />
            ))}
        {!isFetching && reviews.length <= 0 ? (
          <>
            <div className="w-full flex justify-center items-center">
              No Reviews
            </div>
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
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default MobileCommentBox;
