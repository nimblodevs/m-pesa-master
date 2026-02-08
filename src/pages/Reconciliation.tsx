import { format } from 'date-fns';
import { RefreshCw, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
import { mockReconciliations } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Reconciliation() {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const totalReconciled = mockReconciliations.filter(
    (r) => r.status === 'reconciled'
  ).length;
  const totalDiscrepancies = mockReconciliations.filter(
    (r) => r.status === 'discrepancy'
  ).length;

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
          <Button className="gradient-mpesa shadow-mpesa">
            <RefreshCw className="w-4 h-4 mr-2" />
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
            <div className="text-2xl font-bold">
              {formatAmount(
                mockReconciliations.reduce((sum, r) => sum + r.discrepancyAmount, 0)
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total Discrepancy Amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {(
                (mockReconciliations.reduce(
                  (sum, r) => sum + r.matchedTransactions,
                  0
                ) /
                  mockReconciliations.reduce(
                    (sum, r) => sum + r.totalTransactions,
                    0
                  )) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-sm text-muted-foreground">Match Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Reconciliation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Reconciliation History
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              {mockReconciliations.map((record) => {
                const matchRate =
                  (record.matchedTransactions / record.totalTransactions) * 100;
                return (
                  <TableRow key={record.id} className="table-row-hover">
                    <TableCell className="font-medium">
                      {format(record.date, 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{record.totalTransactions}</TableCell>
                    <TableCell className="font-semibold">
                      {formatAmount(record.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 w-40">
                        <Progress value={matchRate} className="h-2" />
                        <span className="text-sm text-muted-foreground">
                          {matchRate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{record.unmatchedTransactions}</TableCell>
                    <TableCell
                      className={cn(
                        'font-medium',
                        record.discrepancyAmount > 0 && 'text-destructive'
                      )}
                    >
                      {formatAmount(record.discrepancyAmount)}
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
        </CardContent>
      </Card>
    </div>
  );
}
