import { Link } from "react-router-dom";
import Page from "../../../shared/ui/Page";
import { Button, FormCard, Input } from "../components/Form";
import { AtSign, Lock, LogIn } from "lucide-react";
import { useDispatch } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { useLoginUserMutation } from "../api/auth.api";
import { setAccessToken, setUser } from "../store/authSlice";
import { BeatLoader } from "react-spinners";
import { toast } from "react-hot-toast";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [formValidity, setFormValidity] = useState({
    username: false,
    password: false,
  });

  const handleValidation = useCallback((name, isValid) => {
    setFormValidity((prev) => {
      if (prev[name] === isValid) return prev;
      return { ...prev, [name]: isValid };
    });
  }, []);

  const isFormValid = Object.values(formValidity).every(
    (status) => status === true,
  );

  const [loginUser, { isLoading, isError, error }] = useLoginUserMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.error || "Something went wrong!", {
        position: "top-center",
      });
    }
  }, [error, isError]);

  const handleSubmit = async () => {
    const res = await loginUser({ username, password }).unwrap();
    dispatch(setAccessToken(res.accessToken));
    dispatch(setUser(res.user));
  };

  return (
    <Page className="flex justify-center items-center">
      <FormCard>
        <Input
          type="text"
          placeholder="janedeveloper"
          label="Username"
          className="w-full"
          id="username"
          lableIcon={<AtSign size={18} />}
          autocomplete="username"
          validationRegex={/^[a-zA-Z0-9_]{3,16}$/}
          validationMessage="Invalid Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          handleValidation={handleValidation}
          name="username"
        />
        <Input
          type="password"
          placeholder="Enter your password"
          label="Password"
          className="w-full"
          id="password"
          lableIcon={<Lock size={18} />}
          validationRegex={/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/}
          validationMessage="Weak password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          handleValidation={handleValidation}
          name="password"
        />
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              Logging In
              <BeatLoader size={8} color="var(--btn-primary-text)" />
            </>
          ) : (
            <>
              <LogIn size={18} /> Login
            </>
          )}
        </Button>
        <div className="border-t border-gray-500"></div>
        <p>
          New to CrawlingDev?{" "}
          <Link to="/register" className="text-link hover:text-link-hover">
            Join now
          </Link>
        </p>
      </FormCard>
    </Page>
  );
};

export default Login;
