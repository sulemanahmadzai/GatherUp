"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardCardSkeleton() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="border-b">
        <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-32 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
