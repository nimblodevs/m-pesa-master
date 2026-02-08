import { format } from 'date-fns';
import { RefreshCw, Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useReconciliations, useRunReconciliation } from '@/hooks/useMpesa';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Reconciliation() {
  const { data: reconciliations, isLoading } = useReconciliations();
  const runReconciliation = useRunReconciliation();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const handleRunReconciliation = async () => {
    try {
      await runReconciliation.mutateAsync(undefined);
      toast.success('Reconciliation completed successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to run reconciliation');
    }
  };

  const totalReconciled = reconciliations?.filter(r => r.status === 'reconciled').length || 0;
  const totalDiscrepancies = reconciliations?.filter(r => r.status === 'discrepancy').length || 0;
  const totalDiscrepancyAmount = reconciliations?.reduce((sum, r) => sum + Number(r.discrepancy_amount), 0) || 0;

  const overallMatchRate = reconciliations?.length 
    ? (reconciliations.reduce((sum, r) => sum + r.matched_transactions, 0) / 
       reconciliations.reduce((sum, r) => sum + r.total_transactions, 0)) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reconciliation</h1>
          <p className="text-muted-foreground">
            Automated transaction reconciliation and reporting
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button 
            className="gradient-mpesa shadow-mpesa"
            onClick={handleRunReconciliation}
            disabled={runReconciliation.isPending}
          >
            {runReconciliation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Run Reconciliation
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalReconciled}</div>
                <p className="text-sm text-muted-foreground">Fully Reconciled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalDiscrepancies}</div>
                <p className="text-sm text-muted-foreground">With Discrepancies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatAmount(totalDiscrepancyAmount)}</div>
            <p className="text-sm text-muted-foreground">Total Discrepancy Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{overallMatchRate.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">Match Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Reconciliation History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !reconciliations?.length ? (
            <p className="text-center text-muted-foreground py-8">
              No reconciliation records yet. Run reconciliation to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Transactions</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Match Progress</TableHead>
                  <TableHead>Unmatched</TableHead>
                  <TableHead>Discrepancy</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliations.map((record) => {
                  const matchRate = record.total_transactions > 0 
                    ? (record.matched_transactions / record.total_transactions) * 100 
                    : 0;
                  return (
                    <TableRow key={record.id} className="table-row-hover">
                      <TableCell className="font-medium">
                        {format(new Date(record.reconciliation_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.total_transactions}</TableCell>
                      <TableCell className="font-semibold">
                        {formatAmount(Number(record.total_amount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 w-40">
                          <Progress value={matchRate} className="h-2" />
                          <span className="text-sm text-muted-foreground">
                            {matchRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{record.unmatched_transactions}</TableCell>
                      <TableCell
                        className={cn(
                          'font-medium',
                          Number(record.discrepancy_amount) > 0 && 'text-destructive'
                        )}
                      >
                        {formatAmount(Number(record.discrepancy_amount))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            record.status === 'reconciled' && 'status-success',
                            record.status === 'pending' && 'status-pending',
                            record.status === 'discrepancy' && 'status-failed'
                          )}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
