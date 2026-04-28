"use client";

interface EquityCurveChartProps {
  data: { date: number; equity: number; label?: string }[];
  currency: string;
  isPositive: boolean;
}

export function EquityCurveChart({ data, currency, isPositive }: EquityCurveChartProps) {
  if (data.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-zinc-400">
        Not enough data for chart
      </div>
    );
  }

  const values = data.map((d) => d.equity);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const width = 400;
  const height = 180;
  const padding = 10;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + (1 - (d.equity - minValue) / range) * (height - padding * 2);
    return { x, y, ...d };
  });

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div className="h-48 w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#equityGradient)"
          stroke="none"
        />
      </svg>

      <div className="flex justify-between mt-2 text-[10px] text-zinc-400">
        <span>{new Date(data[0].date).toLocaleDateString()}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString()}</span>
      </div>
    </div>
  );
}