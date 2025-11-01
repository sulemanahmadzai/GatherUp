"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/app/(login)/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";

export default function SignUpPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();

  const [invitation, setInvitation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate invitation token on mount
  useEffect(() => {
    async function validateToken() {
      try {
        const response = await fetch(`/api/invitations/validate/${token}`);
        const data = await response.json();

        if (data.valid) {
          setInvitation(data);
          setEmail(data.email); // Pre-fill email from invitation
        } else {
          setValidationError(data.error || "Invalid invitation link");
        }
      } catch (error) {
        setValidationError("Failed to validate invitation");
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      formData.append("password", password);
      formData.append("token", token);

      // validatedAction expects (prevState, formData) parameters
      const result = await signUp({}, formData);

      if (result?.error) {
        setError(result.error);
        setIsSubmitting(false);
      }
      // Success - redirects to onboarding automatically via signUp action
      // The redirect() call in the server action will handle the navigation
    } catch (error: any) {
      // Check if this is a Next.js redirect error (not an actual error)
      if (error?.message?.includes("NEXT_REDIRECT")) {
        // This is expected - redirect is happening, don't show error
        return;
      }

      console.error("Signup error:", error);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2CC] to-[#BCE8E7] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-12 text-center">
            <Loader2 className="w-12 h-12 text-[#053D3D] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid invitation
  if (validationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2CC] to-[#BCE8E7] p-4">
        <Card className="w-full max-w-md border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-6 h-6" />
              Invalid Invitation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{validationError}</p>
            <p className="text-sm text-gray-600">
              Please contact your administrator to get a new invitation link.
            </p>
            <Link href="/sign-in">
              <Button variant="outline" className="w-full">
                Go to Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show signup form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2CC] to-[#BCE8E7] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-[#053D3D]">GatherUp</h1>
            <p className="text-sm text-gray-600 mt-1">
              Accountability Partner Platform
            </p>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            You've been invited to join GatherUp
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="mt-1 bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                This email is from your invitation
              </p>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 555-5555"
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your phone number will be shared with your accountability partner
              </p>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#053D3D] hover:bg-[#0a5555] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-[#053D3D] font-medium hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
