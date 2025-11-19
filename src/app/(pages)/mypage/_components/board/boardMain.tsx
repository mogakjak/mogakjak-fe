import { CharacterBasket } from "@/app/_types/mypage";
import BoardBasket from "./boardBasket";
import BoardMate from "./boardMate";

interface BoardProps {
  selectedMenu: string;
  basket: CharacterBasket;
}

export default function Board({ selectedMenu, basket }: BoardProps) {
  return (
    <div className="w-full h-full p-6 bg-white rounded-[20px]">
      {selectedMenu === "내 과일 바구니" ? (
        <BoardBasket totalHours={basket.totalTaskCount} />
      ) : (
        <BoardMate />
      )}
    </div>
  );
}
