import Image from "next/image";
import LoginButton from "./components/loginButton";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <Image
        src="/Icons/logo_slogan.svg"
        alt="slogan"
        width={257}
        height={224}
      ></Image>
      <p className="body1_16R mt-5 gray-600">
        함께 몰입하며 꾸준함을 만드는 힘을 경험해 보세요!
      </p>

      <div className="mt-20 gap-4 flex flex-col">
        <LoginButton type="google"></LoginButton>
        <LoginButton type="kakao"></LoginButton>
      </div>
    </div>
  );
}
