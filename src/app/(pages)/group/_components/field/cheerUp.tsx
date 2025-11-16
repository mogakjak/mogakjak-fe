import Image from "next/image";

export default function CheerUp() {
  return (
    <button className="flex items-center gap-1">
      <p className="text-body2-14SB text-red-600">n</p>
      <Image src="/Icons/cheerup.svg" alt="응원" width={24} height={24}></Image>
    </button>
  );
}
