import { format } from 'date-fns';
import { Download, Filter, Shield, Database, Settings, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockAuditLogs } from '@/data/mockData';
import { cn } from '@/lib/utils';

const categoryIcons = {
  transaction: Database,
  security: Shield,
  configuration: Settings,
  reconciliation: RefreshCw,
};

const categoryColors = {
  transaction: 'bg-primary/10 text-primary',
  security: 'bg-destructive/10 text-destructive',
  configuration: 'bg-warning/10 text-warning',
  reconciliation: 'bg-info/10 text-info',
};

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            Complete audit trail for compliance and security
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Input placeholder="Search logs..." className="w-64" />
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                All
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
              >
                <Database className="w-3 h-3" />
                Transaction
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
              >
                <Shield className="w-3 h-3" />
                Security
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
              >
                <Settings className="w-3 h-3" />
                Configuration
              </Badge>
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-muted gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Reconciliation
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="max-w-md">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAuditLogs.map((log) => {
                const IconComponent = categoryIcons[log.category];
                return (
                  <TableRow key={log.id} className="table-row-hover">
                    <TableCell className="font-mono text-sm">
                      {format(log.timestamp, 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                          categoryColors[log.category]
                        )}
                      >
                        <IconComponent className="w-3 h-3" />
                        {log.category}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>{log.userName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {log.details}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
