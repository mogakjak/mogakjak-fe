import { redirect } from "next/navigation";

export default function CallbackCatchAll() {
  // 중복 경로로 진입한 경우 정규화하여 단일 엔드포인트로 보낸다
  redirect("/auth/callback");
}
