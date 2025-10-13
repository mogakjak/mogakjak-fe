import Image from "next/image";
import LoginButton from "./components/loginButton";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center flex-1 gap-2">
      <Image
        src="/Icons/logo_slogan.svg"
        alt="slogan"
        width={257}
        height={224}
      ></Image>
      <LoginButton type="google"></LoginButton>
      <LoginButton type="kakao"></LoginButton>
    </div>
  );
}
