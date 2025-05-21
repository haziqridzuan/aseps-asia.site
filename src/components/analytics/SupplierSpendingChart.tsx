import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import { DateRangeFilter } from "./DateRangeFilter";
import { PurchaseOrder, Supplier } from "@/contexts/DataContext";

interface SupplierSpendingChartProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
}

export function SupplierSpendingChart({ purchaseOrders, suppliers }: SupplierSpendingChartProps) {
  const [dateRange, setDateRange] = useState("all");

  // Filter data based on date range
  const filterByDateRange = (date: string) => {
    if (dateRange === "all") return true;
    
    const itemDate = new Date(date);
    const today = new Date();
    
    if (dateRange === "month") {
      // Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return itemDate >= thirtyDaysAgo;
    } else if (dateRange === "quarter") {
      // Last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      return itemDate >= ninetyDaysAgo;
    } else if (dateRange === "year") {
      // Last 365 days
      const yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 365);
      return itemDate >= yearAgo;
    }
    
    return false;
  };

  // Filter POs by date range
  const filteredPOs = purchaseOrders.filter(po => filterByDateRange(po.issuedDate));

  // Calculate spent by supplier
  const spentBySupplier = suppliers.map(supplier => {
    // Get all POs for this supplier
    const supplierPOs = filteredPOs.filter(po => po.supplierId === supplier.id);
    // Calculate total spent from these POs using PO amount
    const totalSpent = supplierPOs.reduce((sum, po) => sum + (po.amount || 0), 0);
    return {
      name: supplier.name, // show full name
      supplierId: supplier.id,
      spent: totalSpent,
    };
  }).filter(item => item.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 8);

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Amount Spent by Supplier</CardTitle>
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spentBySupplier}
              margin={{
                top: 20,
                right: 40,
                left: 40,
                bottom: 80,
              }}
              barCategoryGap={32}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={90} tick={{ fontSize: 15, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 14 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount Spent']} />
              <Bar
                dataKey="spent"
                name="Amount Spent"
                fill="url(#supplierGradientOrange)"
                radius={[12, 12, 0, 0]}
                barSize={40}
              >
                <LabelList dataKey="spent" position="top" formatter={(v: number) => `$${v.toLocaleString()}`} style={{ fontWeight: 700, fill: '#FF6A00', fontSize: 16, textShadow: '0 1px 4px #fff' }} />
              </Bar>
              <defs>
                <linearGradient id="supplierGradientOrange" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFD600" />
                  <stop offset="100%" stopColor="#FF6A00" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
