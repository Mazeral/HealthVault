import React from "react";
import { Button, Input } from "../components/Form";
import { BiLogInCircle } from "react-icons/bi";
import { TbLogin } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-screen flex-colo bg-dry">
      <form className="w-2/5 p-8 rounded-2xl mx-auto bg-white flex-colo">
        <img
          src="/images/logo.png"
          alt="logo"
          className="w-48 h-16 object-contain"
        />
        <div className="flex flex-col gap-4 w-full mb-6">
          <Input
            label="Name"
            type="text"
            color={true}
            placeholder={"Abdul Samuel"}
          />
          <Input
            label="Email"
            type="email"
            color={true}
            placeholder={"admin@gmail.com"}
          />
          <Input
            label="Password"
            type="password"
            color={true}
            placeholder={"*********"}
          />
          <Input
            label="Confirm Password"
            type="password"
            color={true}
            placeholder={"*********"}
          />
        </div>
        <Button
          label="Proceed"
          Icon={BiLogInCircle}
          onClick={() => navigate("/")}
        />
        <br></br>
        <Button
          label="Login instead"
          Icon={TbLogin}
          onClick={() => navigate("/login")}
        />
      </form>
    </div>
  );
}

export default Register;
