import React from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";

const ReviewCard = ({ review }) => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex">
        <div className="relative w-full flex p-2 gap-2 items-center">
          <span className="rounded-full h-8 w-8 shrink-0">
            <img
              src={
                review?.user_id === user?.id
                  ? user?.profile_pic
                  : review?.profile_pic
              }
              className="object-cover w-full h-full rounded-full"
            />
          </span>
          <div className="h-fit flex flex-col w-full">
            <div className="w-full flex justify-between">
              <h3 className="font-semibold -mb-1 truncate w-6/10 text-[0.92rem]">
                {review?.user_id === user.id
                  ? user?.name + " (You)"
                  : review?.name}
              </h3>
              <div className="w-4/10 flex justify-end">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {review?.rating >= star ? (
                      <FaStar className="size-3.5 text-card-content/90" />
                    ) : (
                      <FaRegStar className={`size-3.5 text-card-content/70"`} />
                    )}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-[0.85rem] text-card-content/70 truncate min-w-8/10 w-fit">
              {(review?.user_id === user.id ? user?.bio : review?.bio) ||
                "User hasn't set any bio yet"}
            </p>
          </div>
        </div>
      </div>
      <div className="w-full h-content px-2 pl-10 -mt-1">
        {review?.comment || ""}
      </div>
    </div>
  );
};

export default ReviewCard;
