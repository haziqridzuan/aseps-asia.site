export type TrendStringValue = {
  value: string;
  positive: boolean;
};

export type TrendNumericValue = {
  value: number;
  positive: boolean;
};

export type TrendValue = TrendStringValue | TrendNumericValue;

// Type guard to check if a trend value is numeric
export const isNumericTrend = (trend: TrendValue): trend is TrendNumericValue => {
  return typeof trend.value === 'number';
};

// Type guard to check if a trend value is a string
export const isStringTrend = (trend: TrendValue): trend is TrendStringValue => {
  return typeof trend.value === 'string';
};
