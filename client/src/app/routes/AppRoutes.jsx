import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Profile from "../../features/user/page/Profile";

const AppRoutes = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      if (pathname === "/login" || pathname === "/register") {
        navigate("/");
      } else {
        navigate(pathname);
      }
    }
  }, [isAuthenticated]);

  return (
    <div className="h-full w-full overflow-y-auto">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
