import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { registrationNumber } = await req.json();

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Registration number is required" },
        { status: 400 }
      );
    }

    // Get DVLA API key from environment
    const apiKey = process.env.DVLA_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "DVLA API key not configured" },
        { status: 500 }
      );
    }

    // Call DVLA API
    const response = await fetch(
      "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber: registrationNumber
            .toUpperCase()
            .replace(/\s/g, ""),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DVLA API Error:", errorText);

      if (response.status === 404) {
        return NextResponse.json(
          { error: "Vehicle not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch vehicle data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract only the required fields
    const vehicleData = {
      registrationNumber: data.registrationNumber,
      make: data.make,
      model: data.model || data.engineCapacity,
      colour: data.colour,
      fuelType: data.fuelType,
      motExpiry: data.motExpiryDate,
      taxDueDate: data.taxDueDate || data.taxStatus,
    };

    return NextResponse.json(vehicleData);
  } catch (error) {
    console.error("DVLA API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

