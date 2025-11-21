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
        <BoardBasket
          currentLevel={basket.mainCharacter.level + 1}
          ownedCharacters={basket.ownedCharacters}
        />
      ) : (
        <BoardMate />
      )}
    </div>
  );
}
