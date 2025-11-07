"use client";

import Image from "next/image";

interface PageNationProps {
  page: number;
  pageSize?: number;
  totalItems: number;
  onChange: (page: number) => void;
}

export default function PageNation({
  page,
  pageSize = 6,
  totalItems,
  onChange,
}: PageNationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goFirst = () => onChange(1);
  const goPrev = () => onChange(Math.max(1, page - 1));
  const goNext = () => onChange(Math.min(totalPages, page + 1));
  const goLast = () => onChange(totalPages);

  const windowStart = Math.floor((page - 1) / 3) * 3 + 1;
  const windowEnd = Math.min(windowStart + 2, totalPages);
  const windowPages = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, i) => windowStart + i
  );

  const isFirst = page === 1;
  const isLast = page === totalPages;

  return (
    <nav
      className={`flex items-center justify-center gap-2 text-body2-14SB mb-2.5`}
      aria-label="페이지네이션"
    >
      <button
        type="button"
        onClick={goFirst}
        disabled={isFirst}
        aria-label="처음으로"
        className="flex items-center justify-center w-6 h-6"
      >
        <Image
          src="/Icons/doubleArrowRight.svg"
          alt="처음으로"
          width={20}
          height={20}
          className="opacity-40"
        />
      </button>

      <button
        type="button"
        onClick={goPrev}
        disabled={isFirst}
        aria-label="이전"
        className="flex items-center justify-center w-6 h-6"
      >
        <Image
          src="/Icons/arrowRight.svg"
          alt="이전으로"
          width={20}
          height={20}
          className="opacity-40"
        />
      </button>

      <div>
        {windowPages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`w-10 h-10 rounded-lg transition-colors
                ${p === page ? " bg-red-50 text-red-500" : " text-gray-500"}`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={goNext}
        disabled={isLast}
        aria-label="다음"
        className="flex items-center justify-center w-6 h-6"
      >
        <Image
          src="/Icons/arrowLeft.svg"
          alt="다음으로"
          width={20}
          height={20}
          className="opacity-40"
        />
      </button>

      <button
        type="button"
        onClick={goLast}
        disabled={isLast}
        aria-label="끝으로"
        className="flex items-center justify-center w-6 h-6"
      >
        <Image
          src="/Icons/doubleArrowLeft.svg"
          alt="끝으로"
          width={20}
          height={20}
          className="opacity-40"
        />
      </button>
    </nav>
  );
}
