import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareQuote, X } from "lucide-react";
import { FaRegStar, FaStar } from "react-icons/fa";
import Page from "../../../shared/ui/Page";
import Modal from "../../../shared/ui/components/Modal";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { useGetRecievedReviewsQuery } from "../api/user.api";

const sortByOptions = [
  { value: "recent", label: "Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "top", label: "Top Rated" },
  { value: "least", label: "Least Rated" },
];

const RecievedReviews = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sortBy, setSortBy] = useState("recent");
  const [showSortByModal, setShowSortByModal] = useState(false);
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetRecievedReviewsQuery({
    order: sortBy,
    limit: 20,
    offset: 0,
  });

  console.log("reviews data: ", data);
  const reviews = data?.reviews ?? [];
  const renderStars = (rating = 0) =>
    Array.from({ length: 5 }, (_, index) => (
      <span key={index}>
        {index < rating ? (
          <FaStar className="size-3.5 text-card-content/90" />
        ) : (
          <FaRegStar className="size-3.5 text-card-content/60" />
        )}
      </span>
    ));

  const renderReviewCard = (review) => {
    const projectImages = Array.isArray(review?.project_images)
      ? review.project_images
      : [review?.project_images].filter(Boolean);

    return (
      <article
        key={review.review_id}
        className="flex flex-col gap-3 rounded-xl border border-card-content/15 bg-background/70 p-4 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={review?.reviewer_profile_pic || "https://placehold.co/80x80"}
              alt={review?.reviewer_name || "Reviewer"}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold text-card-content">
                {review?.reviewer_name || "Anonymous"}
              </h2>
              <p className="text-sm text-card-content/70">
                @{review?.reviewer_username || "reviewer"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-btn/10 px-2 py-1 text-sm text-btn">
            {renderStars(review?.rating || 0)}
          </div>
        </div>

        <div className="rounded-lg bg-card/80 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-card-content/75">
            <MessageSquareQuote size={16} />
            <span>Project</span>
          </div>
          <h3 className="font-semibold text-card-content">
            {review?.project_title || "Untitled project"}
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm text-card-content/75">
            {review?.comment || "No comment provided."}
          </p>
        </div>

        {projectImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {projectImages.map((image, index) => (
              <img
                key={`${review.review_id}-${index}`}
                src={image}
                alt={`${review?.project_title || "Project"} ${index + 1}`}
                className="h-20 w-24 shrink-0 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-card-content/60">
          <span>
            {review?.review_created_at
              ? new Date(review.review_created_at).toLocaleDateString()
              : "Recently reviewed"}
          </span>
          <span>{review?.helpful_votes ?? 0} helpful</span>
        </div>
      </article>
    );
  };

  return (
    <Page className="relative flex justify-between px-0 py-0 md:py-8 text-card-content overflow-y-auto md:overflow-hidden">
      <div className="flex flex-col md:w-7/10 w-full min-h-full h-full bg-card md:rounded-xl outline outline-gray-500/20 overflow-hidden">
        <div className="w-full h-12 p-3 py-4 text-2xl flex justify-between items-center pt-5 border-b border-b-card-content/20">
          <h1 className="px-3 font-semibold">Received Reviews</h1>
          {!isDesktop && (
            <button
              onClick={() => setShowSortByModal(true)}
              className="px-2 py-0.5 border border-card-content rounded-full flex text-[1.2rem] justify-center items-center"
            >
              Sort By
            </button>
          )}
          <button onClick={() => navigate(-1)}>
            <X />
          </button>
        </div>

        <div className="w-full grow overflow-y-scroll scrollbar-thin p-4 pt-3">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-xl border border-card-content/10 bg-background/70"
                />
              ))}
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-center text-error/70 text-2xl font-semibold text-balance">
              Unable to load received reviews right now.
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-card-content/10 bg-background/70 p-6 text-center text-card-content/70 text-2xl font-semibold text-balance">
              No reviews have been received yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map(renderReviewCard)}
            </div>
          )}
        </div>
      </div>

      {isDesktop && (
        <aside className="hidden md:flex md:w-28/100 flex-col gap-4 rounded-xl border border-card-content/15 bg-card p-4 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Sort Reviews</h2>
            <p className="text-sm text-card-content/70">
              Choose how your received feedback is ordered.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {sortByOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors ${
                  sortBy === option.value
                    ? "bg-btn text-btn-text"
                    : "bg-background/80 hover:bg-background"
                }`}
              >
                <input
                  type="radio"
                  name="reviewSortBy"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="hidden"
                />
                {option.label}
              </label>
            ))}
          </div>
        </aside>
      )}

      <Modal
        title="Sort By"
        isOpen={showSortByModal}
        onClose={() => setShowSortByModal(false)}
        containerClassName="flex flex-wrap gap-3"
      >
        {sortByOptions.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer px-6 py-1 rounded-full transition-colors ${
              sortBy === option.value
                ? "bg-btn text-btn-text"
                : "bg-card-content/10 hover:bg-card-content/20"
            }`}
          >
            <input
              type="radio"
              name="reviewSortByMobile"
              value={option.value}
              checked={sortBy === option.value}
              onChange={(e) => setSortBy(e.target.value)}
              className="hidden"
            />
            {option.label}
          </label>
        ))}
      </Modal>
    </Page>
  );
};

export default RecievedReviews;
