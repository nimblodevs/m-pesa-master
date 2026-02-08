import { format } from 'date-fns';
import { Plus, MoreHorizontal, Pause, Play, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRatibaSubscriptions } from '@/hooks/useMpesa';
import { cn } from '@/lib/utils';

export default function RatibaSubscriptions() {
  const { data: subscriptions, isLoading } = useRatibaSubscriptions();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
  const pausedSubscriptions = subscriptions?.filter(s => s.status === 'paused') || [];
  const monthlyRevenue = activeSubscriptions.reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">M-Pesa Ratiba</h1>
          <p className="text-muted-foreground">
            Manage recurring payment subscriptions
          </p>
        </div>
        <Button className="gradient-mpesa shadow-mpesa">
          <Plus className="w-4 h-4 mr-2" />
          New Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatAmount(monthlyRevenue)}</div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pausedSubscriptions.length}</div>
            <p className="text-sm text-muted-foreground">Paused Subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !subscriptions?.length ? (
            <p className="text-center text-muted-foreground py-8">
              No subscriptions yet. Create your first recurring payment.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Next Payment</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id} className="table-row-hover">
                    <TableCell className="font-medium">
                      {subscription.customer_name}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {subscription.phone_number}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(Number(subscription.amount))}
                    </TableCell>
                    <TableCell className="capitalize">{subscription.frequency}</TableCell>
                    <TableCell>
                      {format(new Date(subscription.next_payment_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {subscription.account_reference}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          subscription.status === 'active' && 'status-success',
                          subscription.status === 'paused' && 'status-pending',
                          subscription.status === 'cancelled' && 'status-failed'
                        )}
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status === 'active' ? (
                            <DropdownMenuItem>
                              <Pause className="w-4 h-4 mr-2" />
                              Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Play className="w-4 h-4 mr-2" />
                              Resume
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
