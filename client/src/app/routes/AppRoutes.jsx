import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Profile from "../../features/user/page/Profile";
import CreatePost from "../../features/project/pages/CreatePost";
import Projects from "../../features/project/pages/Projects";

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
        <Route path="/create" element={<CreatePost />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
