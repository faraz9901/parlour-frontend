"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { validation } from "@/lib/validations";
import { toast } from "sonner";
import { api } from "@/lib/utils";

export default function LoginPage() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


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

    try {
      const response = await api.post('/auth/login', { email, password });
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }

  }


  return (
    <div className="flex items-start mt-20  justify-center h-[80vh]">
      <div className=" w-full max-w-md bg-white dark:bg-gray-900 shadow-xl rounded-xl p-8 flex flex-col gap-6">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-300 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="you@example.com" className="mt-1" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">Password</Label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="••••••••" className="mt-1" required autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full mt-2">Login</Button>
        </form>
      </div>
    </div>
  );
}


