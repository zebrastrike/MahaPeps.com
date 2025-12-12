import { RoleShell } from "@/components/layout/role-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <RoleShell title="Settings" description="Manage profile details, security, and shipping addresses.">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Full name</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm"
                defaultValue="Alex Morgan"
              />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Work email</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm"
                type="email"
                defaultValue="alex.morgan@example.com"
              />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Company</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm"
                defaultValue="Nova Research Lab"
              />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Phone</span>
              <input
                className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm"
                type="tel"
                defaultValue="(555) 102-4455"
              />
            </label>
          </CardContent>
          <CardFooter>
            <Button type="button" size="sm">Save profile</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Password</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Current password</span>
              <input className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm" type="password" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">New password</span>
              <input className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm" type="password" />
            </label>
            <label className="space-y-2 text-sm text-muted-foreground">
              <span className="text-foreground">Confirm password</span>
              <input className="w-full rounded-md border bg-background px-3 py-2 text-foreground shadow-sm" type="password" />
            </label>
          </CardContent>
          <CardFooter>
            <Button type="button" size="sm" variant="secondary">
              Update password
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between text-foreground">
                <p className="font-medium">Primary shipping</p>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">Default</span>
              </div>
              <p>Nova Research Lab</p>
              <p>221B Market St, Suite 300</p>
              <p>San Francisco, CA 94103</p>
              <p>Attn: Receiving</p>
              <Button type="button" size="sm" variant="outline" className="mt-2">
                Edit
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Billing contact</p>
              <p>Atlas Analytics</p>
              <p>77 Industrial Way</p>
              <p>Austin, TX 78701</p>
              <p>Attn: Accounts payable</p>
              <Button type="button" size="sm" variant="outline" className="mt-2">
                Edit
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" size="sm" variant="ghost">
              Add new address
            </Button>
          </CardFooter>
        </Card>
      </div>
    </RoleShell>
  );
}
