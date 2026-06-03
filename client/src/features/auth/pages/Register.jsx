import Page from "../../../shared/ui/Page";
import { Button, FormCard, Input } from "../components/Form";
import { User, AtSign, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useRegisterUserMutation } from "../api/auth.api";
import { useDispatch } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { setAccessToken, setUser } from "../store/authSlice";
import { BeatLoader } from "react-spinners";
import { toast } from "react-hot-toast";
const Register = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [formValidity, setFormValidity] = useState({
    name: false,
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

  const [registerUser, { isLoading, isError, error }] =
    useRegisterUserMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.error || "Something went wrong!", {
        position: "top-center",
      });
    }
  }, [error, isError]);

  const handleSubmit = async () => {
    const res = await registerUser({ name, username, password }).unwrap();
    console.log(res);
    dispatch(setAccessToken(res.accessToken));
    dispatch(setUser(res.user));
  };

  return (
    <Page className="flex justify-center items-center">
      <FormCard>
        <Input
          type={"text"}
          placeholder={"Jane Developer"}
          label={"Full Name"}
          className="w-full"
          id="name"
          lableIcon={<User size={18} />}
          validationRegex={/^[a-zA-Z]+([ \x27-][a-zA-Z]+)*$/}
          validationMessage={"Invalid full name"}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          handleValidation={handleValidation}
          name="name"
        />
        <Input
          type={"text"}
          placeholder={"janedeveloper"}
          label={"Username"}
          className="w-full"
          id="username"
          lableIcon={<AtSign size={18} />}
          autocomplete="username"
          validationRegex={/^[a-zA-Z0-9_]{3,16}$/}
          validationMessage={"Invalid username"}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          handleValidation={handleValidation}
          name="username"
        />
        <Input
          type={"password"}
          placeholder={"Create a password"}
          label={"Password"}
          className="w-full"
          id="password"
          lableIcon={<Lock size={18} />}
          validationRegex={/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/}
          validationMessage={"Weak password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          handleValidation={handleValidation}
          name="password"
        />
        <Button
          type={"submit"}
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              Registering Account
              <BeatLoader size={8} color="var(--btn-primary-text)" />
            </>
          ) : (
            "Register Account"
          )}
        </Button>
        <div className="border-t border-gray-500"></div>
        <p>
          Already on CrawlingDev?{" "}
          <Link to={"/login"} className="text-link hover:text-link-hover">
            Login
          </Link>
        </p>
      </FormCard>
    </Page>
  );
};

export default Register;
