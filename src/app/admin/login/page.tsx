import { adminSignIn } from "@/app/admin/actions";
import { LogoMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <LogoMark className="size-10 rounded-xl" />
            <ShieldCheck className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">Sela Admin</h1>
            <p className="text-sm text-neutral-400">Superadmin dashboard — restricted access</p>
          </div>
        </div>
        <Card className="border-neutral-800 bg-neutral-900 text-white">
          <CardHeader>
            <CardTitle>Admin sign in</CardTitle>
            <CardDescription className="text-neutral-400">
              This is a separate login from the regular Sela app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form action={adminSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-neutral-300">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <Button type="submit" className="w-full">
                Sign in to admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
