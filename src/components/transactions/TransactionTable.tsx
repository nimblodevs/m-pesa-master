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
import { Transaction, TransactionType } from '@/types/mpesa';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  title: string;
  type?: TransactionType;
}

export function TransactionTable({ transactions, title, type }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(
    (t) =>
      (!type || t.type === type) &&
      (t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.phoneNumber.includes(searchTerm))
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

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
                  {transaction.transactionId}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium">
                    {transaction.type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.customerName || '-'}</TableCell>
                <TableCell className="font-mono text-sm">
                  {transaction.phoneNumber}
                </TableCell>
                <TableCell className="font-semibold">
                  {formatAmount(transaction.amount)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {transaction.accountReference}
                </TableCell>
                <TableCell className="text-sm">
                  {format(transaction.timestamp, 'MMM dd, yyyy HH:mm')}
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
      </CardContent>
    </Card>
  );
}
