"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface CustomerFormProps {
  onSuccess?: () => void;
  editData?: any;
  onCancel?: () => void;
}

export function CustomerForm({
  onSuccess,
  editData,
  onCancel,
}: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [dvlaLoading, setDvlaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: editData?.id || null,
    name: editData?.name || "",
    mobileNumber: editData?.mobileNumber || "",
    email: editData?.email || "",
    address: editData?.address || "",
    registrationNumber: editData?.registrationNumber || "",
    make: editData?.make || "",
    model: editData?.model || "",
    colour: editData?.colour || "",
    fuelType: editData?.fuelType || "",
    motExpiry: editData?.motExpiry || "",
    taxDueDate: editData?.taxDueDate || "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchVehicleData = async () => {
    if (!formData.registrationNumber) {
      setError("Please enter a registration number");
      return;
    }

    setDvlaLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dvla", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationNumber: formData.registrationNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch vehicle data");
      }

      const vehicleData = await response.json();

      setFormData((prev) => ({
        ...prev,
        registrationNumber:
          vehicleData.registrationNumber || prev.registrationNumber,
        make: vehicleData.make || prev.make,
        model: vehicleData.model || prev.model,
        colour: vehicleData.colour || prev.colour,
        fuelType: vehicleData.fuelType || prev.fuelType,
        motExpiry: vehicleData.motExpiry || prev.motExpiry,
        taxDueDate: vehicleData.taxDueDate || prev.taxDueDate,
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDvlaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = "/api/customers";
      const method = editData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save customer");
      }

      // Reset form if creating new
      if (!editData) {
        setFormData({
          id: null,
          name: "",
          mobileNumber: "",
          email: "",
          address: "",
          registrationNumber: "",
          make: "",
          model: "",
          colour: "",
          fuelType: "",
          motExpiry: "",
          taxDueDate: "",
        });
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="border-b bg-white pb-6">
        <CardTitle className="text-2xl font-bold text-foreground">
          {editData ? "Edit Customer" : "Add New Customer"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-8 pb-8">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Customer Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="h-11"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="mobileNumber"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    handleInputChange("mobileNumber", e.target.value)
                  }
                  className="h-11"
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="h-11"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label
                  htmlFor="address"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="h-11"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 border-t border-gray-200"></div>

          {/* Vehicle Information */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">
              Vehicle Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
              <div className="md:col-span-2">
                <Label
                  htmlFor="registrationNumber"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Registration Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "registrationNumber",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g., AB12 CDE"
                    className="h-11 uppercase font-mono flex-1"
                    required
                  />
                  <Button
                    type="button"
                    onClick={fetchVehicleData}
                    disabled={dvlaLoading || !formData.registrationNumber}
                    variant="outline"
                    className="border-orange-400 text-orange-600 hover:bg-orange-50 hover:border-orange-500 h-11"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {dvlaLoading ? "Loading..." : "Auto-fill"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <Label
                  htmlFor="make"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Make
                </Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange("make", e.target.value)}
                  className="h-11"
                  placeholder="e.g., Toyota"
                />
              </div>

              <div>
                <Label
                  htmlFor="model"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Model
                </Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  className="h-11"
                  placeholder="e.g., Corolla"
                />
              </div>

              <div>
                <Label
                  htmlFor="colour"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Colour
                </Label>
                <Input
                  id="colour"
                  value={formData.colour}
                  onChange={(e) => handleInputChange("colour", e.target.value)}
                  className="h-11"
                  placeholder="e.g., Silver"
                />
              </div>

              <div>
                <Label
                  htmlFor="fuelType"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Fuel Type
                </Label>
                <Input
                  id="fuelType"
                  value={formData.fuelType}
                  onChange={(e) =>
                    handleInputChange("fuelType", e.target.value)
                  }
                  className="h-11"
                  placeholder="e.g., Petrol"
                />
              </div>

              <div>
                <Label
                  htmlFor="motExpiry"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  MOT Expiry
                </Label>
                <Input
                  id="motExpiry"
                  type="date"
                  value={formData.motExpiry}
                  onChange={(e) =>
                    handleInputChange("motExpiry", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <div>
                <Label
                  htmlFor="taxDueDate"
                  className="text-sm font-semibold text-foreground mb-2 inline-block"
                >
                  Tax Due Date
                </Label>
                <Input
                  id="taxDueDate"
                  type="date"
                  value={formData.taxDueDate}
                  onChange={(e) =>
                    handleInputChange("taxDueDate", e.target.value)
                  }
                  className="h-11"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-11 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {loading
                  ? "Saving..."
                  : editData
                  ? "Update Customer"
                  : "Submit"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="border-gray-300 hover:bg-gray-50 px-8 h-11 text-red-600 hover:text-red-700 font-semibold"
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

