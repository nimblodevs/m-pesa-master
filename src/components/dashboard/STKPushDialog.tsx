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
import { Smartphone, Loader2 } from 'lucide-react';
import { useSTKPush } from '@/hooks/useMpesa';
import { toast } from 'sonner';
import { z } from 'zod';

const stkSchema = z.object({
  phoneNumber: z.string().regex(/^(254|0)\d{9}$/, 'Enter a valid Kenyan phone number (e.g. 254712345678)'),
  amount: z.number().min(1, 'Amount must be at least KES 1').max(150000, 'Amount cannot exceed KES 150,000'),
  accountReference: z.string().trim().min(1, 'Account reference is required').max(50),
  transactionDesc: z.string().trim().min(1, 'Description is required').max(100),
});

export function STKPushDialog() {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stkPush = useSTKPush();

  const handleSubmit = () => {
    setErrors({});

    const result = stkSchema.safeParse({
      phoneNumber,
      amount: Number(amount),
      accountReference,
      transactionDesc,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    stkPush.mutate(
      {
        phoneNumber: result.data.phoneNumber,
        amount: result.data.amount,
        accountReference: result.data.accountReference,
        transactionDesc: result.data.transactionDesc,
        environment,
      },
      {
        onSuccess: (data) => {
          toast.success('STK Push sent successfully', {
            description: `Check your phone (${phoneNumber}) to complete payment.`,
          });
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error('STK Push failed', {
            description: error.message,
          });
        },
      }
    );
  };

  const resetForm = () => {
    setPhoneNumber('');
    setAmount('');
    setAccountReference('');
    setTransactionDesc('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Smartphone className="h-4 w-4" />
          STK Push
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Initiate STK Push</DialogTitle>
          <DialogDescription>
            Send a payment prompt to the customer's phone via Lipa Na M-Pesa Online.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={12}
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
              max={150000}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ref">Account Reference</Label>
            <Input
              id="ref"
              placeholder="INV-001"
              value={accountReference}
              onChange={(e) => setAccountReference(e.target.value)}
              maxLength={50}
            />
            {errors.accountReference && <p className="text-sm text-destructive">{errors.accountReference}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              placeholder="Payment for services"
              value={transactionDesc}
              onChange={(e) => setTransactionDesc(e.target.value)}
              maxLength={100}
            />
            {errors.transactionDesc && <p className="text-sm text-destructive">{errors.transactionDesc}</p>}
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={stkPush.isPending} className="gap-2">
            {stkPush.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send STK Push
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
