import React, { useState } from "react";
import Page from "../../../shared/ui/Page";
import { useGetMyfeedQuery } from "../api/feed.api";
import FeedProjectCard from "../components/FeedProjectCard";
import FeedUtils from "../components/FeedUtils";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import FeedProjectCardSkeleton from "../components/FeedProjectCardSkeleton";
import { useDispatch, useSelector } from "react-redux";
import { setFeed } from "../store/feedSlice";
import { useEffect } from "react";

const HomePage = () => {
  const [isCommentBoxOpened, setIsCommentBoxOpened] = useState(false);
  const [openedCommentBoxId, setOpenedCommentBoxId] = useState(null);
  const { data, isLoading, error } = useGetMyfeedQuery({ page: 1, limit: 10 });
  console.log(data);

  const dispatch = useDispatch();
  useEffect(() => {
    if (data?.feed && data.feed.length > 0) {
      dispatch(setFeed(data.feed));
    }
  }, [data, dispatch]);

  const feed = useSelector((state) => state.feed.feed);

  console.log("feed:  ", feed);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Page className="relative flex justify-center p-0 lg:p-0 text-card-content overflow-y-scroll scrollbar-none gap-3">
      {isDesktop && (
        <div className="sticky top-4 left-0 w-19/100 bg-card h-8/10 rounded-2xl outline outline-gray-500/20 text-card-content flex flex-col gap-4 p-4 grow-0"></div>
      )}
      <div className="flex flex-col gap-2 h-fit w-full lg:w-55/100 md:py-4 shrink-0">
        {isLoading &&
          !data?.feed &&
          [1, 2, 3, 4].map((i) => <FeedProjectCardSkeleton key={i} />)}
        {feed &&
          feed.map((project) => (
            <FeedProjectCard
              key={project.id}
              project={project}
              setIsCommentBoxOpened={setIsCommentBoxOpened}
              isCommentBoxOpened={isCommentBoxOpened}
              openedCommentBoxId={openedCommentBoxId}
              setOpenedCommentBoxId={setOpenedCommentBoxId}
            />
          ))}
      </div>
      {isDesktop && (
        <FeedUtils className="sticky top-4 right-0 grow-0 w-19/100" />
      )}
    </Page>
  );
};

export default HomePage;
