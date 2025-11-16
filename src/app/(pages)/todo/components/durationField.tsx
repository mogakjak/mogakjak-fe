"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DurationField({
  seconds,
  onChange,
  className,
}: {
  seconds: number;
  onChange?: (sec: number) => void;
  className?: string;
}) {
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;

  const [h, setH] = useState(hh);
  const [m, setM] = useState(mm);
  const [s, setS] = useState(ss);

  const total = useMemo(() => h * 3600 + m * 60 + s, [h, m, s]);
  const invalid = total < 60 || total > 24 * 3600;

  const sync = (nh = h, nm = m, ns = s) => {
    const th = clamp(nh, 0, 24);
    const tm = clamp(nm, 0, 59);
    const ts = clamp(ns, 0, 59);
    setH(th);
    setM(tm);
    setS(ts);
    onChange?.(th * 3600 + tm * 60 + ts);
  };

  return (
    <div className={clsx("w-full", className)}>
      <div className="px-10 py-5 bg-gray-100 rounded-xl outline-1 outline-gray-200 flex items-center justify-center gap-2">
        <input
          type="number"
          value={String(h).padStart(2, "0")}
          onChange={(e) => sync(parseInt(e.target.value || "0", 10), m, s)}
          className="w-12 bg-transparent text-center text-xl leading-7 text-neutral-900 outline-none"
          min={0}
          max={24}
        />
        <span className="text-xl text-neutral-900">:</span>
        <input
          type="number"
          value={String(m).padStart(2, "0")}
          onChange={(e) => sync(h, parseInt(e.target.value || "0", 10), s)}
          className="w-12 bg-transparent text-center text-xl leading-7 text-neutral-900 outline-none"
          min={0}
          max={59}
        />
        <span className="text-xl text-neutral-900">:</span>
        <input
          type="number"
          value={String(s).padStart(2, "0")}
          onChange={(e) => sync(h, m, parseInt(e.target.value || "0", 10))}
          className="w-12 bg-transparent text-center text-xl leading-7 text-neutral-900 outline-none"
          min={0}
          max={59}
        />
      </div>

      {invalid && (
        <p className="mt-2 w-full text-center text-red-500 text-sm">
          최소 1분~ 최대 24시간까지만 입력 가능해요
        </p>
      )}
    </div>
  );
}
