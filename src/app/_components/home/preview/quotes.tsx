import { Quote } from "@/app/_types/mypage";

type QuotesProps = {
  Quotes: Quote;
};

export default function Quotes({ Quotes }: QuotesProps) {
  return (
    <div className="text-center text-body1-16R text-gray-700 bg-gray-100 rounded-lg px-7 py-5 my-5">
      {Quotes.content}
    </div>
  );
}
