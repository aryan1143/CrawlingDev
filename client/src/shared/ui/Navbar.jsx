import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useMediaQuery from "../hooks/useMediaQuery";
import { useSelector } from "react-redux";
import NavLinks from "./components/NavLinks";
import { useLazySearchProjectsQuery } from "../../features/feed/api/feed.api";

const Navbar = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const profilePic = useSelector((state) => state.auth?.user?.profile_pic);
  const [search, setSearch] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const searchContainerRef = useRef(null);
  const [searchProjects, { isFetching }] = useLazySearchProjectsQuery();

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setPagination(null);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await searchProjects({ q: query, page: 1 }).unwrap();
        setSearchResults(response.projects ?? []);
        setPagination(response.pagination ?? null);
      } catch {
        setSearchResults([]);
        setPagination(null);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search, searchProjects]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!searchContainerRef.current?.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const loadMoreResults = async () => {
    if (!pagination?.hasMore || isFetching) return;

    try {
      const response = await searchProjects({
        q: search.trim(),
        page: pagination.page + 1,
      }).unwrap();
      setSearchResults((currentResults) => [
        ...currentResults,
        ...(response.projects ?? []),
      ]);
      setPagination(response.pagination ?? null);
    } catch {
      // Keep the already loaded results visible when a later page fails.
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearch("");
    setSearchResults([]);
    setPagination(null);
  };

  const showResults = isSearchOpen && search.trim().length >= 2;

  return (
    <div className="relative z-40 w-full h-15 mb-auto bg-card border-b border-gray-500/20 flex justify-center">
      <div className="p-1 px-2 h-full w-full max-w-[calc(50vw+360px)] flex items-center gap-2">
        <div className="flex shrink-0 gap-2 justify-center items-center h-full">
          {isDesktop && <img src="/icon-512.png" className="h-9/10" />}
          <h1 className="text-card-content font-bold text-2xl">CrawlingDev</h1>
        </div>
        {isDesktop && <NavLinks />}
        <div
          ref={searchContainerRef}
          className="relative ml-auto md:grow md:mr-4"
        >
          <div
            className="flex aspect-square md:aspect-auto bg-transparent md:bg-card-content/5 rounded-full p-1 px-2 gap-2 justify-center items-center md:outline outline-card-content/20"
            onClick={() => setIsSearchOpen(true)}
          >
            <button
              type="button"
              aria-label="Search projects"
              className="shrink-0 text-card-content/80"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="size-7 md:size-5" />
            </button>
            {isDesktop && (
              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full bg-transparent focus:outline-0 text-card-content text-[1.05rem]"
                placeholder="Search projects..."
              />
            )}
            {!isDesktop && isSearchOpen && (
              <span className="text-sm text-card-content/70">Search</span>
            )}
          </div>

          {isSearchOpen && !isDesktop && (
            <div className="fixed left-0 right-0 top-15 min-h-[calc(100vh-3.75rem)] bg-background p-4">
              <div className="flex items-center gap-2 rounded-full bg-card-content/5 px-3 py-2 outline outline-card-content/20">
                <Search className="size-5 shrink-0 text-card-content/70" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent text-card-content focus:outline-0"
                  placeholder="Search projects..."
                />
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeSearch}
                >
                  <X className="size-5 text-card-content/70" />
                </button>
              </div>
              <SearchResults
                results={searchResults}
                pagination={pagination}
                isFetching={isFetching}
                onLoadMore={loadMoreResults}
              />
            </div>
          )}

          {showResults && isDesktop && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] max-h-[28rem] overflow-y-auto rounded-xl border border-card-content/15 bg-card p-3 shadow-xl">
              <SearchResults
                results={searchResults}
                pagination={pagination}
                isFetching={isFetching}
                onLoadMore={loadMoreResults}
              />
            </div>
          )}
        </div>
        <div className="h-8/10 shrink-0 p-0.5 aspect-square rounded-full overflow-hidden bg-gray-500">
          <img
            src={profilePic}
            className="object-cover rounded-full w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ results, pagination, isFetching, onLoadMore }) => {
  if (isFetching && results.length === 0) {
    return (
      <div className="flex justify-center p-6">
        <LoaderCircle className="size-8 animate-spin text-card-content/55" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-card-content/65">
        No matching projects.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 pt-3 md:pt-0">
      {results.map((project) => (
        <article
          key={project.id}
          className="flex gap-3 rounded-lg p-2 text-card-content hover:bg-card-content/5"
        >
          <img
            src={project.images?.[0] || "https://placehold.co/96x64"}
            alt=""
            className="h-16 w-24 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{project.title}</h2>
            <p className="line-clamp-2 text-sm text-card-content/65">
              {project.description}
            </p>
            <p className="mt-1 text-xs text-card-content/55">
              by {project.author_name}
            </p>
          </div>
        </article>
      ))}
      {pagination?.hasMore && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isFetching}
          className="rounded-lg bg-btn/10 px-3 py-2 text-sm font-semibold text-btn disabled:opacity-60"
        >
          {isFetching ? "Loading..." : "Load more"}
        </button>
      )}
    </div>
  );
};

export default Navbar;
