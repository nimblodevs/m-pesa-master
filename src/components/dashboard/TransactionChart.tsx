import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useMpesa';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';

export function TransactionChart() {
  const { data: transactions } = useTransactions();

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        dateStr: format(date, 'yyyy-MM-dd'),
        C2B: 0,
        B2C: 0,
        B2B: 0,
        RATIBA: 0,
      };
    });

    if (transactions) {
      transactions.forEach((tx) => {
        const txDate = format(new Date(tx.created_at), 'yyyy-MM-dd');
        const dayData = last7Days.find((d) => d.dateStr === txDate);
        if (dayData && tx.type in dayData) {
          dayData[tx.type as 'C2B' | 'B2C' | 'B2B' | 'RATIBA']++;
        }
      });
    }

    return last7Days;
  }, [transactions]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Transaction Volume</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorC2B" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(151 100% 32%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(151 100% 32%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB2C" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(151 76% 42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(151 76% 42%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorB2B" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="C2B"
                stroke="hsl(151 100% 32%)"
                fillOpacity={1}
                fill="url(#colorC2B)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="B2C"
                stroke="hsl(151 76% 42%)"
                fillOpacity={1}
                fill="url(#colorB2C)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="B2B"
                stroke="hsl(199 89% 48%)"
                fillOpacity={1}
                fill="url(#colorB2B)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
