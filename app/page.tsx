"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validation } from "@/lib/validations";
import { toast } from "sonner";
import { api, getErrorMessage } from "@/lib/utils";
import { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import useCurrentUser from "@/lib/store/user.store";
import { Role } from "@/lib/enums";
import { useRouter } from "next/navigation";
// import Password from "@/components/ui/password";
import { Sparkles, Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { checkUserSession, isLoading, user } = useCurrentUser();

  useEffect(() => {
    if (user) {
      const path = user.role === Role.EMPLOYEE ? "/attendance" : "/dashboard";
      router.replace(path);
    }
  }, [user])

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      return await api.post('/auth/login', { email, password })
    },
    onSuccess: async () => {
      const validUser = await checkUserSession();
      if (validUser) {
        toast.success("Welcome back! You've been logged in successfully")
      } else {
        toast.error("There was an error logging in! Please try again")
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error as AxiosError));
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailValidation = validation.email(email);
    const passwordValidation = validation.password(password);

    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return;
    }
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }

    mutate({ email, password });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-2 md:p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center md:w-16 md:h-16 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Parlour Dashboard
          </h1>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl  border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="space-y-1  md:pb-4">
            <CardTitle className="md:text-2xl text-xl font-semibold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="md:space-y-4 space-y-2">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 bg-background/50 border-muted-foreground/20 focus:border-primary transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isPending || isLoading}
              >
                {(isPending || isLoading) ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


