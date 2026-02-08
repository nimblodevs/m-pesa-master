import { TransactionTable } from '@/components/transactions/TransactionTable';
import { ManualEntryDialog } from '@/components/transactions/ManualEntryDialog';
import { mockTransactions } from '@/data/mockData';

export default function C2BTransactions() {
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
        transactions={mockTransactions}
        title="All C2B Transactions"
        type="C2B"
      />
    </div>
  );
}
