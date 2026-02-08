import { TransactionTable } from '@/components/transactions/TransactionTable';
import { ManualEntryDialog } from '@/components/transactions/ManualEntryDialog';
import { useTransactions } from '@/hooks/useMpesa';

export default function B2CTransactions() {
  const { data: transactions, isLoading } = useTransactions('B2C');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">B2C Transactions</h1>
          <p className="text-muted-foreground">
            Business to Customer disbursements
          </p>
        </div>
        <ManualEntryDialog />
      </div>

      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        title="All B2C Transactions"
        type="B2C"
      />
    </div>
  );
}
