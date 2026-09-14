import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquareQuote, X } from "lucide-react";
import { FaRegStar, FaStar } from "react-icons/fa";
import Page from "../../../shared/ui/Page";
import Modal from "../../../shared/ui/components/Modal";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import { useLazyGetRecievedReviewsQuery } from "../api/user.api";

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
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const reviewsContainerRef = useRef(null);
  const requestVersionRef = useRef(0);
  const navigate = useNavigate();
  const [fetchReviews] = useLazyGetRecievedReviewsQuery();

  const pageSize = 20;

  useEffect(() => {
    let isCurrentRequest = true;
    const requestVersion = ++requestVersionRef.current;

    setReviews([]);
    setPagination(null);
    setReviewsError(null);
    setIsLoadingReviews(true);
    reviewsContainerRef.current?.scrollTo({ top: 0 });

    fetchReviews({ order: sortBy, limit: pageSize, offset: 0 })
      .unwrap()
      .then((data) => {
        if (!isCurrentRequest || requestVersion !== requestVersionRef.current) {
          return;
        }

        setReviews(data.reviews ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch((requestError) => {
        if (isCurrentRequest && requestVersion === requestVersionRef.current) {
          setReviewsError(requestError);
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingReviews(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [fetchReviews, sortBy]);

  const loadMoreReviews = () => {
    if (isLoadingReviews || isLoadingMore || !pagination?.hasMore) {
      return;
    }

    const nextOffset = pagination.offset + pagination.limit;
    const requestVersion = requestVersionRef.current;
    setIsLoadingMore(true);

    fetchReviews({ order: sortBy, limit: pageSize, offset: nextOffset })
      .unwrap()
      .then((data) => {
        if (requestVersion !== requestVersionRef.current) return;

        setReviews((currentReviews) => [
          ...currentReviews,
          ...(data.reviews ?? []),
        ]);
        setPagination(data.pagination ?? null);
      })
      .catch((requestError) => {
        if (requestVersion === requestVersionRef.current) {
          setReviewsError(requestError);
        }
      })
      .finally(() => {
        if (requestVersion === requestVersionRef.current) {
          setIsLoadingMore(false);
        }
      });
  };

  const handleReviewsScroll = (event) => {
    const container = event.currentTarget;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      160;

    if (isNearBottom) loadMoreReviews();
  };

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

        <div
          ref={reviewsContainerRef}
          onScroll={handleReviewsScroll}
          className="w-full grow overflow-y-scroll scrollbar-thin p-4 pt-3"
        >
          {isLoadingReviews ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-52 animate-pulse rounded-xl border border-card-content/10 bg-background/70"
                />
              ))}
            </div>
          ) : reviewsError ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-center text-error/70 text-2xl font-semibold text-balance">
              Unable to load received reviews right now.
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-card-content/10 bg-background/70 p-6 text-center text-card-content/70 text-2xl font-semibold text-balance">
              No reviews have been received yet.
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                {reviews.map(renderReviewCard)}
              </div>
              {isLoadingMore && (
                <div className="py-4 text-center text-sm text-card-content/70">
                  Loading more reviews...
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {isDesktop && (
        <aside className="hidden md:flex md:w-28/100 flex-col gap-4 rounded-xl border border-card-content/15 bg-card p-4 shadow-sm h-fit min-h-8/10">
          <div>
            <h2 className="text-lg font-semibold">Sort Reviews</h2>
            <p className="text-sm text-card-content/70">
              Choose how your received feedback is ordered.
            </p>
          </div>
          <form className="w-full h-fit flex flex-wrap gap-2 p-3 pt-0 mt-2 border-2 border-card-content/30 rounded-2xl">
            <span className="w-full p-2 text-xl font-semibold">Sort By</span>

            {sortByOptions.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer px-5 py-1 rounded-full transition-colors ${
                  sortBy === option.value
                    ? "bg-btn text-btn-text"
                    : "bg-card-content/10 hover:bg-card-content/20"
                }`}
              >
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="hidden"
                />
                {option.label}
              </label>
            ))}
          </form>
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
              onChange={(e) => {
                setSortBy(e.target.value);
                setShowSortByModal(false);
              }}
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
