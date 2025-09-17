"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signInAction } from "@/actions/auth";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErr("");
    
    try {
      const formData = new FormData();
      formData.append("email", username);
      formData.append("password", password);
      
      const result = await signInAction(formData);
      
      if (!result.ok) {
        setErr(result.message);
      } else {
        toast.success("Login successful!");
        router.push(next);
      }
    } catch (error) {
      setErr("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardHeader className="space-y-1 text-center pb-2">
        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-gray-600">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-2">
        <form
          className={cn("flex flex-col gap-5", className)}
          {...props}
          onSubmit={handleSubmit}
        >
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="pl-10 h-11 focus:ring-2 focus:ring-primary/20 border-gray-300"
                value={username}
                onChange={(e) => setU(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <a
                href="#"
                className="text-xs text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 focus:ring-2 focus:ring-primary/20 border-gray-300"
                value={password}
                onChange={(e) => setP(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {err && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {err}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 font-medium mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </Button>

          {/* Sign up Link */}
          <div className="text-center text-sm text-gray-600 pt-2">
            Don't have an account?{" "}
            <a 
              href="/register" 
              className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
            >
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}