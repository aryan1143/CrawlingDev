import React, { useState } from "react";
import Page from "../../../shared/ui/Page";
import { useGetMyfeedQuery } from "../api/feed.api";
import FeedProjectCard from "../components/FeedProjectCard";
import ProjectUtils from "../../project/component/ProjectUtils";
import FeedUtils from "../components/FeedUtils";
import useMediaQuery from "../../../shared/hooks/useMediaQuery";
import DesktopCommentBox from "../components/DesktopCommentBox";
import MobileCommentBox from "../components/MobileCommentBox";
import FeedProjectCardSkeleton from "../components/FeedProjectCardSkeleton";

const HomePage = () => {
  const [isCommentBoxOpened, setIsCommentBoxOpened] = useState(false);
  const [openedCommentBoxId, setOpenedCommentBoxId] = useState(null);
  const { data, isLoading, error } = useGetMyfeedQuery({ page: 1, limit: 10 });
  console.log(data);
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
        {data?.feed &&
          data.feed.map((project) => (
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
