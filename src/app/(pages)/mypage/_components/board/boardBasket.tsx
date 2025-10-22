import Character from "./basket/character";

export default function BoardBasket() {
  const characters = [
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: false },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
    { name: "tomato", locked: true },
  ];

  return (
    <div className="w-full">
      <h2 className="text-heading4-20SB text-black mb-6">
        내 채소 바구니 (5/12)
      </h2>

      <div className="grid grid-cols-4 gap-5">
        {characters.map((character, index) => (
          <Character
            key={`${character.name}-${index}`}
            name={character.name}
            locked={character.locked}
          />
        ))}
      </div>
    </div>
  );
}
