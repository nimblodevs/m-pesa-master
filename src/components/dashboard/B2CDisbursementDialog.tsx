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
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useB2CPayment } from '@/hooks/useMpesa';
import { toast } from 'sonner';
import { z } from 'zod';

const b2cSchema = z.object({
  phoneNumber: z.string().regex(/^(254|0)\d{9}$/, 'Enter a valid Kenyan phone number (e.g. 254712345678)'),
  amount: z.number().min(10, 'Minimum amount is KES 10').max(150000, 'Maximum amount is KES 150,000'),
  occasion: z.string().trim().min(1, 'Occasion is required').max(100),
  remarks: z.string().trim().min(1, 'Remarks are required').max(100),
});

type CommandId = 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment';

export function B2CDisbursementDialog() {
  const [open, setOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [occasion, setOccasion] = useState('');
  const [remarks, setRemarks] = useState('');
  const [commandId, setCommandId] = useState<CommandId>('BusinessPayment');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const b2cPayment = useB2CPayment();

  const handleSubmit = () => {
    setErrors({});

    const result = b2cSchema.safeParse({
      phoneNumber,
      amount: Number(amount),
      occasion,
      remarks,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((e) => {
        fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    b2cPayment.mutate(
      {
        phoneNumber: result.data.phoneNumber,
        amount: result.data.amount,
        occasion: result.data.occasion,
        remarks: result.data.remarks,
        commandId,
        environment,
      },
      {
        onSuccess: () => {
          toast.success('B2C payment initiated', {
            description: `KES ${result.data.amount} disbursement to ${phoneNumber} is being processed.`,
          });
          setOpen(false);
          resetForm();
        },
        onError: (error) => {
          toast.error('B2C payment failed', {
            description: error.message,
          });
        },
      }
    );
  };

  const resetForm = () => {
    setPhoneNumber('');
    setAmount('');
    setOccasion('');
    setRemarks('');
    setCommandId('BusinessPayment');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Send className="h-4 w-4" />
          B2C Disbursement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>B2C Disbursement</DialogTitle>
          <DialogDescription>
            Send money directly to a customer's M-Pesa account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="b2c-phone">Phone Number</Label>
            <Input
              id="b2c-phone"
              placeholder="254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={12}
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="b2c-amount">Amount (KES)</Label>
            <Input
              id="b2c-amount"
              type="number"
              placeholder="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={10}
              max={150000}
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
          </div>

          <div className="space-y-2">
            <Label>Payment Type</Label>
            <Select value={commandId} onValueChange={(v) => setCommandId(v as CommandId)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BusinessPayment">Business Payment</SelectItem>
                <SelectItem value="SalaryPayment">Salary Payment</SelectItem>
                <SelectItem value="PromotionPayment">Promotion Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="b2c-occasion">Occasion</Label>
            <Input
              id="b2c-occasion"
              placeholder="January salary"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              maxLength={100}
            />
            {errors.occasion && <p className="text-sm text-destructive">{errors.occasion}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="b2c-remarks">Remarks</Label>
            <Textarea
              id="b2c-remarks"
              placeholder="Payment for services rendered"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={100}
              rows={2}
            />
            {errors.remarks && <p className="text-sm text-destructive">{errors.remarks}</p>}
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
          <Button onClick={handleSubmit} disabled={b2cPayment.isPending} className="gap-2">
            {b2cPayment.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Send Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
