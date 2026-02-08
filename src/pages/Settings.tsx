import { useState } from 'react';
import { Save, Eye, EyeOff, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function Settings() {
  const [showKeys, setShowKeys] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your M-Pesa integration settings
        </p>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="callbacks">Callbacks</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-6">
          {/* Sandbox Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Sandbox Configuration
                    <Badge variant="outline" className="bg-warning/10 text-warning">
                      Testing
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Credentials for testing in M-Pesa sandbox environment
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeys(!showKeys)}
                >
                  {showKeys ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sandbox-consumer-key">Consumer Key</Label>
                  <Input
                    id="sandbox-consumer-key"
                    type={showKeys ? 'text' : 'password'}
                    defaultValue="sandbox_consumer_key_xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sandbox-consumer-secret">Consumer Secret</Label>
                  <Input
                    id="sandbox-consumer-secret"
                    type={showKeys ? 'text' : 'password'}
                    defaultValue="sandbox_consumer_secret_xxxx"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sandbox-shortcode">Business Shortcode</Label>
                  <Input id="sandbox-shortcode" defaultValue="174379" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sandbox-passkey">Lipa Na M-Pesa Passkey</Label>
                  <Input
                    id="sandbox-passkey"
                    type={showKeys ? 'text' : 'password'}
                    defaultValue="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    Production Configuration
                    <Badge variant="outline" className="bg-destructive/10 text-destructive">
                      Live
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Credentials for live M-Pesa transactions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
                <p className="text-sm text-warning">
                  Production credentials are not configured. Contact Safaricom to get
                  your live API credentials.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 opacity-50">
                <div className="space-y-2">
                  <Label htmlFor="prod-consumer-key">Consumer Key</Label>
                  <Input id="prod-consumer-key" disabled placeholder="Not configured" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-consumer-secret">Consumer Secret</Label>
                  <Input
                    id="prod-consumer-secret"
                    disabled
                    placeholder="Not configured"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">IP Whitelisting</CardTitle>
              <CardDescription>
                Only allow callbacks from specific IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable IP Whitelisting</p>
                  <p className="text-sm text-muted-foreground">
                    Restrict callback endpoints to whitelisted IPs only
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Whitelisted IPs</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">196.201.214.200</Badge>
                  <Badge variant="secondary">196.201.214.206</Badge>
                  <Badge variant="secondary">196.201.213.114</Badge>
                  <Badge variant="secondary">196.201.214.207</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  These are Safaricom's official M-Pesa callback IPs
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Signature Validation
              </CardTitle>
              <CardDescription>
                Verify callback authenticity using cryptographic signatures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Signature Validation</p>
                  <p className="text-sm text-muted-foreground">
                    Validate HMAC signatures on incoming callbacks
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-sm text-success">
                  Signature validation is properly configured and active
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="callbacks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Callback URLs</CardTitle>
              <CardDescription>
                Configure endpoints for M-Pesa transaction callbacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c2b-validation">C2B Validation URL</Label>
                <Input
                  id="c2b-validation"
                  defaultValue="https://api.yourapp.com/mpesa/c2b/validation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c2b-confirmation">C2B Confirmation URL</Label>
                <Input
                  id="c2b-confirmation"
                  defaultValue="https://api.yourapp.com/mpesa/c2b/confirmation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b2c-result">B2C Result URL</Label>
                <Input
                  id="b2c-result"
                  defaultValue="https://api.yourapp.com/mpesa/b2c/result"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b2c-timeout">B2C Timeout URL</Label>
                <Input
                  id="b2c-timeout"
                  defaultValue="https://api.yourapp.com/mpesa/b2c/timeout"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure email alerts for important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Failed Transactions</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when transactions fail
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reconciliation Discrepancies</p>
                  <p className="text-sm text-muted-foreground">
                    Alert when reconciliation finds mismatches
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Daily Summary</p>
                  <p className="text-sm text-muted-foreground">
                    Receive daily transaction summary
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gradient-mpesa shadow-mpesa">
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
