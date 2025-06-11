import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  LabelProps,
} from 'recharts';
import { Project, PurchaseOrder } from '@/contexts/DataContext';

interface BudgetSpentChartProps {
  spentByProject: Array<{
    name: string;
    projectId: string;
    spent: number;
  }>;
  budgetColors: string[];
}

// Custom label to always show value outside the bar
const CustomValueLabel = (props: LabelProps) => {
  const { x, y, width, value } = props;
  // Always place label outside the bar for clarity
  return (
    <text
      x={Number(x) + Number(width) + 12}
      y={Number(y) + 20}
      fontWeight={700}
      fontSize={16}
      fill="#006400"
      style={{ textShadow: '0 1px 4px #fff' }}
    >
      {`$${Number(value).toLocaleString()}`}
    </text>
  );
};

export function BudgetSpentChart({ spentByProject, budgetColors }: BudgetSpentChartProps) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Budget Spent Analysis by Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spentByProject}
              layout="vertical"
              margin={{
                top: 20,
                right: 100,
                left: 40,
                bottom: 20,
              }}
              barCategoryGap={24}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                width={220}
                tick={{ fontSize: 15, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount Spent']} />
              <Bar
                dataKey="spent"
                name="Amount Spent"
                fill="url(#budgetGradient)"
                radius={[12, 12, 12, 12]}
                barSize={32}
              >
                <LabelList dataKey="spent" content={CustomValueLabel} />
              </Bar>
              <defs>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#bfa800" />
                  <stop offset="50%" stopColor="#7bbf24" />
                  <stop offset="100%" stopColor="#228B22" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
