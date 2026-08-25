import Link from "next/link";
import { signUp, signInWithGoogle } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { GoogleIcon } from "@/components/google-icon";
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

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo showWordmark={false} markClassName="size-14 rounded-2xl shadow-lg shadow-primary/25" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sela</h1>
          <p className="text-sm text-muted-foreground">
            Your money, watched over.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Track your income, expenses, and savings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form action={signUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </form>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full gap-2">
              <GoogleIcon className="size-4" />
              Continue with Google
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        A product of Ratel Systems
      </p>
    </div>
  );
}
