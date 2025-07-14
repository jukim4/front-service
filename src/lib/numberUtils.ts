export const safeNumber = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return value;
};

export const formatNumber = (value: number, fractionDigits: number = 0): string => {
  return value.toLocaleString(undefined, { maximumFractionDigits: fractionDigits });
};