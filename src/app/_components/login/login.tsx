import LoginButton from "./loginButton";

export default function Login() {
  return (
    <div className="flex flex-col justify-center items-center flex-1 gap-2">
      <LoginButton type="google"></LoginButton>
      <LoginButton type="kakao"></LoginButton>
    </div>
  );
}
