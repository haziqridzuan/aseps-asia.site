import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';
import React from "react";

interface PartStatus {
  name: string;
  value: number;
  color: string;
}

interface PartsProgressPieChartProps {
  data: PartStatus[];
}

// Badge colors from the second image
const statusColors: Record<string, string> = {
  "Manufacturing": "#3b9cff", // blue with glow
  "Not Started": "#ff9800",   // orange with glow
  "Preparation": "#b983ff",   // purple with glow
  "Purchasing": "#bdbdbd",    // gray with glow
  "Ready to Check": "#ffe066", // yellow with glow
  "Finished": "#4ade80",      // green with glow
};

// Custom Tooltip for Pie Chart, positioned to the right or left of the donut
const CustomPieTooltip = ({ active, payload, coordinate, viewBox }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length && coordinate && viewBox) {
    const { name, value, color } = payload[0].payload;
    // Calculate position: right by default, left if near right edge
    const chartWidth = viewBox.width;
    const chartLeft = viewBox.x;
    const tooltipWidth = 160; // px
    let left = coordinate.x + 20;
    if (left + tooltipWidth > chartLeft + chartWidth) {
      left = coordinate.x - tooltipWidth - 20;
    }
    const top = coordinate.y - 24;
    return (
      <div
        style={{
          position: 'fixed',
          left,
          top,
          background: color,
          color: '#222',
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          fontSize: 15,
          boxShadow: `0 2px 8px 0 ${color}55`,
          border: `2px solid ${color}`,
          zIndex: 9999,
          pointerEvents: 'none',
          minWidth: tooltipWidth,
        }}
      >
        {name}: {value} parts
      </div>
    );
  }
  return null;
};

// SVG filter for glow
const GlowDefs = () => (
  <defs>
    <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3b9cff" floodOpacity="0.7" />
    </filter>
    <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff9800" floodOpacity="0.7" />
    </filter>
    <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#b983ff" floodOpacity="0.7" />
    </filter>
    <filter id="glow-gray" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#bdbdbd" floodOpacity="0.7" />
    </filter>
    <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ffe066" floodOpacity="0.7" />
    </filter>
    <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#4ade80" floodOpacity="0.7" />
    </filter>
  </defs>
);

function getGlowFilter(status: string) {
  switch (status) {
    case "Manufacturing": return "url(#glow-blue)";
    case "Not Started": return "url(#glow-orange)";
    case "Preparation": return "url(#glow-purple)";
    case "Purchasing": return "url(#glow-gray)";
    case "Ready to Check": return "url(#glow-yellow)";
    case "Finished": return "url(#glow-green)";
    default: return undefined;
  }
}

export function PartsProgressPieChart({ data }: PartsProgressPieChartProps) {
  const total = data.reduce((sum, s) => sum + s.value, 0);
  // Map data to use the new badge colors
  const coloredData = data.map(d => ({ ...d, color: statusColors[d.name] || d.color }));

  return (
    <Card className="card-hover h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Parts Manufacturing Progress Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-2">
          {/* Donut Chart with Center Label and segment glow */}
          <div className="relative w-[175px] h-[175px] mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <GlowDefs />
                <Pie
                  data={coloredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {coloredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} filter={getGlowFilter(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomPieTooltip />}
                  wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
              <span className="text-3xl font-bold text-primary">{total}</span>
            </div>
          </div>
          {/* Legend below the chart, moved 20% lower */}
          <div className="w-full grid grid-cols-2 gap-y-2 gap-x-4 mt-8">
            {coloredData.map((status) => (
              <div key={status.name} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block shadow"
                  style={{ backgroundColor: status.color, boxShadow: `0 0 6px 2px ${status.color}55` }}
                ></span>
                <span className="text-sm text-gray-700 flex-1">{status.name}</span>
                <span className="text-sm font-semibold tabular-nums">{status.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 