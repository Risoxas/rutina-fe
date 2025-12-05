'use client';

import { useActionState, useState } from 'react';
import { authenticate, registerUser } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const [activeTab, setActiveTab] = useState('login');
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  async function handleRegister(formData: FormData) {
    setRegisterError(null);
    const result = await registerUser(formData);
    if (result?.error) {
      setRegisterError(result.error);
    } else if (result?.success) {
      setRegisterSuccess(true);
      setActiveTab('login');
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to Rutina</CardTitle>
          <CardDescription className="text-center">
            Manage your gym routines efficiently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' && (
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="login">
              {registerSuccess && (
                <div className="mb-4 p-2 bg-green-100 text-green-700 rounded text-sm text-center">
                  Registration successful! Please login.
                </div>
              )}
              <form action={formAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" name="email" placeholder="m@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" name="password" required />
                </div>
                {errorMessage && (
                  <div className="text-sm text-red-500 font-medium">{errorMessage}</div>
                )}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>

            {process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' && (
              <TabsContent value="register">
                <form action={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Name</Label>
                    <Input id="reg-name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" name="email" placeholder="m@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input id="reg-password" type="password" name="password" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Select name="role" defaultValue="TRAINEE">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRAINEE">Trainee</SelectItem>
                        <SelectItem value="TRAINER">Trainer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {registerError && (
                    <div className="text-sm text-red-500 font-medium">{registerError}</div>
                  )}
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
