import { useState } from 'react';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Environment } from '@/types/mpesa';
import { cn } from '@/lib/utils';

interface HeaderProps {
  environment: Environment;
  onEnvironmentChange: (env: Environment) => void;
}

export function Header({ environment, onEnvironmentChange }: HeaderProps) {
  const [notifications] = useState(3);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions, customers..."
            className="pl-10 bg-muted/50 border-0 input-focus"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Environment Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'gap-2 font-medium',
                  environment === 'production'
                    ? 'border-destructive/50 text-destructive bg-destructive/5'
                    : 'border-warning/50 text-warning bg-warning/5'
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    environment === 'production' ? 'bg-destructive' : 'bg-warning'
                  )}
                />
                {environment === 'production' ? 'Production' : 'Sandbox'}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Environment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEnvironmentChange('sandbox')}>
                <span className="w-2 h-2 rounded-full bg-warning mr-2" />
                Sandbox (Testing)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEnvironmentChange('production')}>
                <span className="w-2 h-2 rounded-full bg-destructive mr-2" />
                Production (Live)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                variant="destructive"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="w-8 h-8 rounded-full gradient-mpesa flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-medium">Admin</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>API Keys</DropdownMenuItem>
              <DropdownMenuItem>Team Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
