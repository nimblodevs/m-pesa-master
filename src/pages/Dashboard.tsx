import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionChart } from '@/components/dashboard/TransactionChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { useDashboardStats } from '@/hooks/useMpesa';
import { STKPushDialog } from '@/components/dashboard/STKPushDialog';
import { B2CDisbursementDialog } from '@/components/dashboard/B2CDisbursementDialog';
import { TransactionStatusDialog } from '@/components/dashboard/TransactionStatusDialog';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your M-Pesa integration performance
          </p>
        </div>
        <div className="flex gap-2">
          <STKPushDialog />
          <B2CDisbursementDialog />
          <TransactionStatusDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={(stats?.totalTransactions || 0).toLocaleString()}
          change="All time"
          changeType="neutral"
          icon={Activity}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(stats?.totalVolume || 0)}
          change="Completed transactions"
          changeType="neutral"
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          change="All time average"
          changeType={stats?.successRate && stats.successRate > 95 ? 'positive' : 'neutral'}
          icon={TrendingUp}
          iconColor="bg-info/10 text-info"
        />
        <StatCard
          title="Pending"
          value={(stats?.pendingCount || 0).toString()}
          change={stats?.pendingCount && stats.pendingCount > 0 ? 'Requires attention' : 'All clear'}
          changeType={stats?.pendingCount && stats.pendingCount > 0 ? 'negative' : 'positive'}
          icon={Clock}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Today's Transactions"
          value={(stats?.todayTransactions || 0).toLocaleString()}
          icon={ArrowDownToLine}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Today's Volume"
          value={formatCurrency(stats?.todayVolume || 0)}
          icon={ArrowUpFromLine}
          iconColor="bg-success/10 text-success"
        />
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionChart />
        <RecentTransactions />
      </div>
    </div>
  );
}
