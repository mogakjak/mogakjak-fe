import { Quote } from "@/app/_types/mypage";

type QuotesProps = {
  Quotes: Quote;
};

export default function Quotes({ Quotes }: QuotesProps) {
  return (
    <div className="max-h-22 text-center text-body1-16R text-gray-700 bg-gray-100 rounded-lg px-7 py-5 my-2 overflow-y-auto category-scroll">
      {Quotes.content}
    </div>
  );
}
