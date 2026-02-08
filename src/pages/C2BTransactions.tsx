import { TransactionTable } from '@/components/transactions/TransactionTable';
import { ManualEntryDialog } from '@/components/transactions/ManualEntryDialog';
import { useTransactions } from '@/hooks/useMpesa';

export default function C2BTransactions() {
  const { data: transactions, isLoading } = useTransactions('C2B');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">C2B Transactions</h1>
          <p className="text-muted-foreground">
            Customer to Business payment collections
          </p>
        </div>
        <ManualEntryDialog />
      </div>

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        title="All C2B Transactions"
        type="C2B"
      />
    </div>
  );
}
