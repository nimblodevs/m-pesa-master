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
import { mockDashboardStats } from '@/data/mockData';

export default function Dashboard() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your M-Pesa integration performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value={mockDashboardStats.totalTransactions.toLocaleString()}
          change="+12.5% from last month"
          changeType="positive"
          icon={Activity}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Volume"
          value={formatCurrency(mockDashboardStats.totalVolume)}
          change="+8.2% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Success Rate"
          value={`${mockDashboardStats.successRate}%`}
          change="+0.3% from last week"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-info/10 text-info"
        />
        <StatCard
          title="Pending"
          value={mockDashboardStats.pendingCount.toString()}
          change="Requires attention"
          changeType="neutral"
          icon={Clock}
          iconColor="bg-warning/10 text-warning"
        />
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Today's Transactions"
          value={mockDashboardStats.todayTransactions.toLocaleString()}
          icon={ArrowDownToLine}
          iconColor="bg-primary/10 text-primary"
        />
        <StatCard
          title="Today's Volume"
          value={formatCurrency(mockDashboardStats.todayVolume)}
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
