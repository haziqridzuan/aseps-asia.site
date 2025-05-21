import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SupplierPerformanceModernProps {
  data: {
    name: string;
    rating: number;
    onTimeDelivery: number;
  }[];
}

export const SupplierPerformanceModern: React.FC<SupplierPerformanceModernProps> = ({ data }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Supplier Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-7">
          {data.map((supplier, idx) => (
            <div key={supplier.name} className="flex items-center gap-4 w-full">
              {/* Supplier Name */}
              <div className="w-40 flex-shrink-0 text-right pr-2 font-semibold text-base text-gray-800 dark:text-gray-100 truncate">
                {supplier.name}
              </div>
              {/* Rating Dots */}
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <span
                    key={i}
                    className={cn(
                      "inline-block w-2.5 h-2.5 rounded-full",
                      i <= Math.round(supplier.rating)
                        ? "bg-yellow-400 shadow-md"
                        : "bg-yellow-100 dark:bg-gray-700"
                    )}
                  />
                ))}
              </div>
              {/* Progress Bar with Knob */}
              <div className="relative flex-1 flex items-center h-7 ml-4">
                <div className="absolute left-0 top-0 h-7 w-full rounded-full bg-gray-200 dark:bg-gray-800" />
                <div
                  className="absolute left-0 top-0 h-7 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 transition-all"
                  style={{ width: `${supplier.onTimeDelivery}%` }}
                />
                {/* White Knob with Value */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg border-2 border-cyan-300 flex items-center justify-center"
                  style={{ left: `calc(${supplier.onTimeDelivery}% - 20px)`, width: 40, height: 40, zIndex: 2 }}
                >
                  <span className="font-bold text-cyan-500 text-lg drop-shadow-md">
                    {supplier.onTimeDelivery}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex gap-8 items-center justify-center mt-8">
          <div className="flex items-center gap-2">
            <span className="inline-block w-6 h-3 rounded-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400" />
            <span className="text-sm text-gray-700 dark:text-gray-200">On-Time Delivery (%)</span>
          </div>
          <div className="flex items-center gap-2">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-md" />
            ))}
            <span className="text-sm text-gray-700 dark:text-gray-200 ml-2">Rating (out of 5)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 