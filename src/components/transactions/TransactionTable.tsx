import { useState } from 'react';
import { format } from 'date-fns';
import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction, TransactionType } from '@/types/mpesa';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[] | undefined;
  isLoading?: boolean;
  title: string;
  type?: TransactionType;
}

export function TransactionTable({ transactions, isLoading, title, type }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = (transactions || []).filter(
    (t) =>
      (!type || t.type === type) &&
      (t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phone_number.includes(searchTerm))
  );

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
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-4"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="table-row-hover">
                  <TableCell className="font-mono text-sm">
                    {transaction.transaction_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.customer_name || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {transaction.phone_number}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatAmount(Number(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {transaction.account_reference}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        transaction.status === 'completed' && 'status-success',
                        transaction.status === 'pending' && 'status-pending',
                        transaction.status === 'failed' && 'status-failed'
                      )}
                    >
                      {transaction.status}
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
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Query Status
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
  );
}
