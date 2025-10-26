"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [goalText, setGoalText] = useState("");
  const [category, setCategory] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [measurableOutcome, setMeasurableOutcome] = useState("");

  const [preferredCommunication, setPreferredCommunication] = useState("");
  const [preferredMatchType, setPreferredMatchType] = useState("");

  const [accountabilityStyle, setAccountabilityStyle] = useState("");
  const [commitmentLevel, setCommitmentLevel] = useState("5");
  const [knowsOtherMembers, setKnowsOtherMembers] = useState("");

  const handleNext = (e?: React.MouseEvent) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setError(null);

    if (step === 1) {
      // Validate step 1
      if (!goalText.trim()) {
        setError("Please enter your goal");
        return;
      }
      if (!category) {
        setError("Please select a goal category");
        return;
      }
    }

    if (step === 2) {
      // Validate step 2
      if (!preferredCommunication) {
        setError("Please select your preferred communication method");
        return;
      }
      if (!preferredMatchType) {
        setError("Please select your preferred match type");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = (e?: React.MouseEvent) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only submit if we're on step 3
    if (step !== 3) {
      console.log(
        "Form submission blocked - not on step 3. Current step:",
        step
      );
      return;
    }

    // Prevent double submission
    if (isSubmitting) {
      console.log("Form submission blocked - already submitting");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/members/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalText,
          category,
          targetDate,
          measurableOutcome,
          preferredCommunication,
          preferredMatchType,
          accountabilityStyle,
          commitmentLevel: parseInt(commitmentLevel),
          knowsOtherMembers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh the router to clear any cached data
        router.refresh();
        // Show success and redirect to dashboard
        router.push("/member");
      } else {
        setError(data.error || "Failed to complete onboarding");
        setIsSubmitting(false);
        // Stay on step 3 to show error
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
      // Stay on step 3 to show error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0F2CC] to-[#BCE8E7] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[#053D3D]">
              Welcome to GatherUp!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Let's set up your accountability journey
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full ${
                  s <= step ? "bg-[#A6FF48]" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of 3</p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            autoComplete="off"
          >
            {/* Step 1: SMART Goal */}
            {step === 1 && (
              <div className="space-y-4">
                <CardTitle className="text-lg">Your SMART Goal</CardTitle>
                <p className="text-sm text-gray-600">
                  A SMART goal is Specific, Measurable, Achievable, Relevant,
                  and Time-bound.
                </p>

                <div>
                  <Label htmlFor="goalText">What's your goal? *</Label>
                  <Textarea
                    id="goalText"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    placeholder="e.g., Lose 10 pounds in 3 months by exercising 4x per week and eating 1800 calories daily"
                    rows={4}
                    className="mt-1"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific! Include what, how much, and by when.
                  </p>
                </div>

                <div>
                  <Label htmlFor="category">Goal Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitness">
                        Fitness & Exercise
                      </SelectItem>
                      <SelectItem value="nutrition">
                        Nutrition & Diet
                      </SelectItem>
                      <SelectItem value="mental-health">
                        Mental Health & Wellness
                      </SelectItem>
                      <SelectItem value="habit">Habit Building</SelectItem>
                      <SelectItem value="career">
                        Career & Professional
                      </SelectItem>
                      <SelectItem value="financial">Financial Goals</SelectItem>
                      <SelectItem value="relationships">
                        Relationships & Social
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="targetDate">Target Date (Optional)</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="measurableOutcome">
                    How will you measure success? (Optional)
                  </Label>
                  <Textarea
                    id="measurableOutcome"
                    value={measurableOutcome}
                    onChange={(e) => setMeasurableOutcome(e.target.value)}
                    placeholder="e.g., Track weight weekly, log workouts in app, calorie count daily"
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preferences */}
            {step === 2 && (
              <div className="space-y-4">
                <CardTitle className="text-lg">Your Preferences</CardTitle>
                <p className="text-sm text-gray-600">
                  Help us find the perfect accountability partner for you.
                </p>

                <div>
                  <Label htmlFor="preferredCommunication">
                    Preferred Communication Method *
                  </Label>
                  <Select
                    value={preferredCommunication}
                    onValueChange={setPreferredCommunication}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="How do you want to communicate?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preferredMatchType">
                    Preferred Match Type *
                  </Label>
                  <Select
                    value={preferredMatchType}
                    onValueChange={setPreferredMatchType}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="What type of accountability?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-on-one">1:1 Partner</SelectItem>
                      <SelectItem value="group">
                        Group Pod (3-5 people)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    1:1 is more intimate, group pods provide community support
                  </p>
                </div>

                <div>
                  <Label htmlFor="knowsOtherMembers">
                    Do you know anyone else in the program?
                  </Label>
                  <Textarea
                    id="knowsOtherMembers"
                    value={knowsOtherMembers}
                    onChange={(e) => setKnowsOtherMembers(e.target.value)}
                    placeholder="Names of people you'd like to be paired with (optional)"
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Accountability Style */}
            {step === 3 && (
              <div className="space-y-4">
                <CardTitle className="text-lg">Accountability Style</CardTitle>
                <p className="text-sm text-gray-600">
                  Tell us how you work best with an accountability partner.
                </p>

                <div>
                  <Label htmlFor="accountabilityStyle">
                    What accountability style works for you?
                  </Label>
                  <Textarea
                    id="accountabilityStyle"
                    value={accountabilityStyle}
                    onChange={(e) => setAccountabilityStyle(e.target.value)}
                    placeholder="e.g., I need gentle encouragement, tough love, daily check-ins, or weekly reviews"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="commitmentLevel">
                    How badly do you want to achieve this goal?
                  </Label>
                  <div className="mt-2 space-y-2">
                    <input
                      id="commitmentLevel"
                      type="range"
                      min="1"
                      max="10"
                      value={commitmentLevel}
                      onChange={(e) => setCommitmentLevel(e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#A6FF48]"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Just trying</span>
                      <span className="text-lg font-bold text-[#053D3D]">
                        {commitmentLevel}/10
                      </span>
                      <span>Extremely committed</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#E0F2CC] rounded-lg border border-[#A6FF48]">
                  <h3 className="font-semibold text-[#053D3D] mb-2">
                    What happens next?
                  </h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ You'll receive an email confirmation</li>
                    <li>✓ We'll match you with a partner within 1 week</li>
                    <li>✓ You'll get partner details via email</li>
                    <li>✓ Start your accountability journey!</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={(e) => handleBack(e)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={(e) => handleNext(e)}
                  className="flex-1 bg-[#053D3D] hover:bg-[#0a5555] text-white"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#A6FF48] hover:bg-[#95ee37] text-[#053D3D] font-semibold"
                  onClick={(e) => {
                    // Only allow submit if on step 3 and not already submitting
                    if (step !== 3 || isSubmitting) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  {isSubmitting ? (
                    "Completing..."
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
