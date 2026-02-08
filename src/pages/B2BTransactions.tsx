import { TransactionTable } from '@/components/transactions/TransactionTable';
import { ManualEntryDialog } from '@/components/transactions/ManualEntryDialog';
import { useTransactions } from '@/hooks/useMpesa';

export default function B2BTransactions() {
  const { data: transactions, isLoading } = useTransactions('B2B');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">B2B Transactions</h1>
          <p className="text-muted-foreground">
            Business to Business payments
          </p>
        </div>
        <ManualEntryDialog />
      </div>

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        title="All B2B Transactions"
        type="B2B"
      />
    </div>
  );
}
