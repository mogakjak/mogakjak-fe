"use client";
import { Box, Paper } from "@mui/material";

type PomodoroProps = {
  size?: number;
  color?: string;
  ticks?: number;
  tickLen?: number;
  tickStroke?: number;
  ringPadding?: number;
  centerRatio?: number;
};

export default function Pomodoro({
  size = 360,
  color = "#F54E32",
  ticks = 12,
  tickLen = 14,
  tickStroke = 5,
  ringPadding = 18,
  centerRatio = 0.46,
}: PomodoroProps) {
  const radius = size / 2;

  const toXY = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return {
      x: radius + r * Math.sin(a),
      y: radius - r * Math.cos(a),
    };
  };

  const innerR = radius - ringPadding;
  const tickOuter = innerR + 8;
  const tickInner = innerR - tickLen;
  const centerR = size * centerRatio * 0.25;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 6,
        p: 3,
        bgcolor: (t) => t.palette.grey[50],
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          boxShadow: (t) => `inset 0 0 0 1px ${t.palette.divider}`,
        }}
      >
        <svg
          width={size}
          height={size}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle cx={radius} cy={radius} r={innerR} fill={color} />
          {Array.from({ length: ticks }).map((_, i) => {
            const deg = (i * 360) / ticks;
            const p1 = toXY(deg, tickOuter);
            const p2 = toXY(deg, tickInner);

            const strokeColor = i === 0 || i === 6 ? "#FA5332" : "#FDB8AB";

            return (
              <line
                key={i}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke={strokeColor}
                strokeWidth={tickStroke}
              />
            );
          })}

          <circle
            cx={radius}
            cy={radius}
            r={centerR}
            fill="#FDB8AB"
            stroke="#FFEEEB"
            strokeWidth={4}
          />
        </svg>
      </Box>
    </Paper>
  );
}
