import { ArrowUpRight, ArrowDownLeft, Building2, CalendarClock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransactions } from '@/hooks/useMpesa';
import { TransactionType } from '@/types/mpesa';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

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
  const { data: transactions, isLoading } = useTransactions();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="w-24 h-4 mb-2" />
                    <Skeleton className="w-20 h-3" />
                  </div>
                </div>
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = transactions?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <Link to="/c2b" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Initiate your first M-Pesa transaction.
          </p>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg table-row-hover"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', typeColors[transaction.type])}>
                    {typeIcons[transaction.type]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.customer_name || transaction.phone_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transaction_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {transaction.type === 'B2C' ? '-' : '+'}
                    {formatAmount(Number(transaction.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.created_at), 'HH:mm')}
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
        )}
      </CardContent>
    </Card>
  );
}
