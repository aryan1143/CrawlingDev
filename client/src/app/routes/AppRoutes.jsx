import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const AppRoutes = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [isAuthenticated]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;
