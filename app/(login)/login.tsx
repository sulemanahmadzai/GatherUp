"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, Target, TrendingUp, Home } from "lucide-react";
import { signIn, signUp } from "./actions";
import { ActionState } from "@/lib/auth/middleware";
import { Card, CardContent } from "@/components/ui/card";

export function Login({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const priceId = searchParams.get("priceId");
  const inviteId = searchParams.get("inviteId");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    mode === "signin" ? signIn : signUp,
    { error: "" }
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-gradient-to-br from-[#E0F2CC] via-[#BCE8E7] to-[#E0F2CC]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#A6FF48] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#053D3D] rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl border-[#A6FF48]/20">
        <CardContent className="p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#053D3D] rounded-2xl mb-4">
              <span className="text-[#A6FF48] font-bold text-3xl">G</span>
            </div>
            <h1 className="text-3xl font-bold text-[#053D3D] mb-2">GatherUp</h1>
            <p className="text-gray-600 text-sm">
              {mode === "signin"
                ? "Welcome! Sign in to start"
                : "Join GatherUp and start your accountability journey today"}
            </p>
          </div>

          {/* Features Preview (Sign Up Only) */}
          {mode === "signup" && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-xs font-semibold text-[#053D3D] text-center mb-4 uppercase tracking-wide">
                What you'll get
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-[#053D3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Accountability Partners
                    </p>
                    <p className="text-xs text-gray-600">
                      Get matched with partners who share your goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-[#053D3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Goal Tracking
                    </p>
                    <p className="text-xs text-gray-600">
                      Set and track SMART goals with progress updates
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E0F2CC] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#053D3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Progress Insights
                    </p>
                    <p className="text-xs text-gray-600">
                      Visualize your journey and celebrate wins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="redirect" value={redirect || ""} />
            <input type="hidden" name="priceId" value={priceId || ""} />
            <input type="hidden" name="inviteId" value={inviteId || ""} />

            {/* Email Field */}
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-semibold text-[#053D3D] mb-2 block"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={state.email}
                required
                maxLength={50}
                className="h-11 border-gray-300 focus:border-[#A6FF48] focus:ring-[#A6FF48]"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label
                htmlFor="password"
                className="text-sm font-semibold text-[#053D3D] mb-2 block"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                defaultValue={state.password}
                required
                minLength={6}
                maxLength={100}
                className="h-11 border-gray-300 focus:border-[#A6FF48] focus:ring-[#A6FF48]"
                placeholder="••••••••"
              />
              {mode === "signup" && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 6 characters
                </p>
              )}
            </div>

            {/* Error Message */}
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <span className="text-red-500 text-lg leading-none">⚠</span>
                <span>{state.error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#053D3D] hover:bg-[#0a5555] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Loading...
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Link to Home Page */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#053D3D] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home Page</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
