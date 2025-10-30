import BoardBasket from "./boardBasket";
import BoardMate from "./boardMate";

interface BoardProps {
  selectedMenu: string;
}

export default function Board({ selectedMenu }: BoardProps) {
  return (
    <div className="w-full self-stretch p-6 bg-white rounded-[20px]">
      {selectedMenu === "내 채소 바구니" ? <BoardBasket /> : <BoardMate />}
    </div>
  );
}
