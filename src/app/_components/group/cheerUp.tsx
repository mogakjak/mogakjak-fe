import Image from "next/image";

export default function CheerUp() {
  return (
    <div className="flex items-center gap-1">
      <p className="text-body2-14SB text-red-600">n</p>
      <Image src="/Icons/cheerup.svg" alt="응원" width={32} height={32}></Image>
    </div>
  );
}
