import { useEffect } from "react";
import AppRoutes from "./app/routes/AppRoutes";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserProfileQuery } from "./features/auth/api/auth.api";
import { setUser } from "./features/auth/store/authSlice";
import { Toaster } from "react-hot-toast";
import { HashLoader } from "react-spinners";

function App() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { data, isSuccess, error, isLoading } = useGetUserProfileQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isSuccess && data?.user) {
      dispatch(setUser(data.user));
    }
  }, [data, dispatch, isSuccess]);

  return (
    <div className="w-screen h-svh flex justify-center page">
      {isLoading ? (
        <div className="my-auto">
          <HashLoader color="var(--btn-primary-bg)" />
        </div>
      ) : (
        <AppRoutes />
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
