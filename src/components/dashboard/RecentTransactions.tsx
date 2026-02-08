import { ArrowUpRight, ArrowDownLeft, Building2, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockTransactions } from '@/data/mockData';
import { Transaction, TransactionType } from '@/types/mpesa';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeIcons: Record<TransactionType, React.ReactNode> = {
  C2B: <ArrowDownLeft className="w-4 h-4" />,
  B2C: <ArrowUpRight className="w-4 h-4" />,
  B2B: <Building2 className="w-4 h-4" />,
  RATIBA: <CalendarClock className="w-4 h-4" />,
};

const typeColors: Record<TransactionType, string> = {
  C2B: 'bg-success/10 text-success',
  B2C: 'bg-info/10 text-info',
  B2B: 'bg-primary/10 text-primary',
  RATIBA: 'bg-warning/10 text-warning',
};

export function RecentTransactions() {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <a href="/c2b" className="text-sm text-primary hover:underline">
          View all
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg table-row-hover"
            >
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', typeColors[transaction.type])}>
                  {typeIcons[transaction.type]}
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.transactionId}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {transaction.type === 'B2C' ? '-' : '+'}
                  {formatAmount(transaction.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(transaction.timestamp, 'HH:mm')}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'ml-4',
                  transaction.status === 'completed' && 'status-success',
                  transaction.status === 'pending' && 'status-pending',
                  transaction.status === 'failed' && 'status-failed'
                )}
              >
                {transaction.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
