import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { useTransactionStatus } from '@/hooks/useMpesa';
import { toast } from 'sonner';
import { z } from 'zod';

const statusSchema = z.object({
  transactionId: z.string().trim().min(1, 'Transaction ID is required').max(50),
});

const statusIcons: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-5 w-5 text-green-600" />,
  failed: <XCircle className="h-5 w-5 text-destructive" />,
  pending: <Clock className="h-5 w-5 text-yellow-600" />,
  reversed: <RotateCcw className="h-5 w-5 text-blue-600" />,
};

export function TransactionStatusDialog() {
  const [open, setOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const statusQuery = useTransactionStatus();

  const handleQuery = () => {
    setErrors({});
    setResult(null);

    const validation = statusSchema.safeParse({ transactionId });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    statusQuery.mutate(
      { transactionId: validation.data.transactionId, environment },
      {
        onSuccess: (data) => {
          setResult(data);
          toast.success('Status retrieved successfully');
        },
        onError: (error) => {
          toast.error('Failed to query status', { description: error.message });
        },
      }
    );
  };

  const resetForm = () => {
    setTransactionId('');
    setResult(null);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Search className="h-4 w-4" />
          Check Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Status Query</DialogTitle>
          <DialogDescription>
            Query the status of an M-Pesa transaction using its ID.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="txn-id">Transaction ID</Label>
            <Input
              id="txn-id"
              placeholder="e.g. STK1234567890 or OEI2AK32CA"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              maxLength={50}
            />
            {errors.transactionId && <p className="text-sm text-destructive">{errors.transactionId}</p>}
          </div>

          <div className="space-y-2">
            <Label>Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as 'sandbox' | 'production')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {result && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-2">
                  {statusIcons[result.status] || statusIcons.pending}
                  <Badge variant={
                    result.status === 'completed' ? 'default' :
                    result.status === 'failed' ? 'destructive' :
                    'secondary'
                  }>
                    {result.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              {result.resultDesc && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Description</span>
                  <span className="text-sm text-right max-w-[200px]">{result.resultDesc}</span>
                </div>
              )}
              {result.mpesaReceiptNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Receipt</span>
                  <span className="text-sm font-mono">{result.mpesaReceiptNumber}</span>
                </div>
              )}
              {result.amount != null && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm font-semibold">KES {Number(result.amount).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleQuery} disabled={statusQuery.isPending} className="gap-2">
            {statusQuery.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Query Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
