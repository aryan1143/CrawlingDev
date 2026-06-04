import { useEffect } from "react";
import AppRoutes from "./app/routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserProfileQuery } from "./features/auth/api/auth.api";
import { setUser } from "./features/auth/store/authSlice";
import { Toaster } from "react-hot-toast";
import { HashLoader } from "react-spinners";
import Navbar from "./shared/ui/Navbar";
import { useLocation } from "react-router-dom";
import NavLinks from "./shared/ui/components/NavLinks";
import useMediaQuery from "./shared/hooks/useMediaQuery";

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data, isSuccess, error, isLoading } = useGetUserProfileQuery();
  const dispatch = useDispatch();

  const pathname = useLocation().pathname;

  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch, isSuccess]);

  return (
    <div className="relative w-screen h-svh flex page flex-col">
      {pathname !== "/login" && pathname !== "/register" && <Navbar />}
      {isLoading ? (
        <div className="absolute top-1/2 left-1/2 -translate-1/2">
          <HashLoader color="var(--btn-primary-bg)" />
        </div>
      ) : (
        <AppRoutes />
      )}
      {!isDesktop && (
        <div className="w-full">
          <NavLinks isMobile={true} />
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
