import { TransactionTable } from '@/components/transactions/TransactionTable';
import { ManualEntryDialog } from '@/components/transactions/ManualEntryDialog';
import { mockTransactions } from '@/data/mockData';

export default function B2BTransactions() {
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
        transactions={mockTransactions}
        title="All B2B Transactions"
        type="B2B"
      />
    </div>
  );
}
