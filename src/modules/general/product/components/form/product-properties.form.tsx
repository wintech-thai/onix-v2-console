"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductSchemaType } from "../../schema/product.schema";
import { fetchProductsPropertiesApi } from "../../api/fetch-product-properties.api";
import { useParams } from "next/navigation";

type PropertyItem = {
  name: string;
  value: string;
};

// Define which properties should be numbers
const NUMBER_PROPERTIES = new Set([
  "Width",
  "Height",
  "Weight",
]);

// Helper function to convert property value based on its type
const convertPropertyValue = (name: string, value: string): string | number | null => {
  // If empty, return null
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  // If it's a number property, convert to number
  if (NUMBER_PROPERTIES.has(name)) {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? null : numValue;
  }

  // Otherwise, keep as string
  return value;
};

export const ProductPropertiesForm = () => {
  const params = useParams<{ orgId: string }>();
  const form = useFormContext<ProductSchemaType>();

  const { properties } = form.watch();

  const [availableProperties, setAvailableProperties] = useState<
    PropertyItem[]
  >([]);
  const [selectedProperties, setSelectedProperties] = useState<PropertyItem[]>(
    []
  );
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const fetchProductPropertiesQuery = fetchProductsPropertiesApi.useQuery(
    params.orgId
  );

  // Initialize available and selected properties from API (only once)
  useEffect(() => {
    if (fetchProductPropertiesQuery.data?.data) {
      const allProperties = fetchProductPropertiesQuery.data.data;
      const formProperties = properties || {};

      // Separate properties into selected (with values) and available (without values)
      const selected: PropertyItem[] = [];
      const available: PropertyItem[] = [];

      allProperties.forEach((prop) => {
        if (
          formProperties[prop.name] !== undefined &&
          formProperties[prop.name] !== null &&
          formProperties[prop.name] !== ""
        ) {
          selected.push(prop);
        } else {
          available.push(prop);
        }
      });

      // Sort both arrays alphabetically
      selected.sort((a, b) => a.name.localeCompare(b.name));
      available.sort((a, b) => a.name.localeCompare(b.name));

      setSelectedProperties(selected);
      setAvailableProperties(available);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProductPropertiesQuery.data]);

  // Handle moving properties from left to right
  const handleMoveToSelected = () => {
    const propertiesToMove = availableProperties.filter((prop) =>
      leftChecked.has(prop.name)
    );

    const newSelected = [...selectedProperties, ...propertiesToMove].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setSelectedProperties(newSelected);
    setAvailableProperties(
      availableProperties.filter((prop) => !leftChecked.has(prop.name))
    );
    setLeftChecked(new Set());
  };

  // Handle moving properties from right to left (with reset)
  const handleMoveToAvailable = () => {
    const propertiesToMove = selectedProperties.filter((prop) =>
      rightChecked.has(prop.name)
    );

    // Reset values when moving back
    const resetProperties = propertiesToMove.map((prop) => ({
      ...prop,
      value:
        fetchProductPropertiesQuery.data?.data.find(
          (p: PropertyItem) => p.name === prop.name
        )?.value || "",
    }));

    const newAvailable = [...availableProperties, ...resetProperties].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    setAvailableProperties(newAvailable);
    setSelectedProperties(
      selectedProperties.filter((prop) => !rightChecked.has(prop.name))
    );

    // Update form properties
    const updatedProperties = { ...properties };
    propertiesToMove.forEach((prop) => {
      delete updatedProperties[prop.name];
    });
    form.setValue("properties", updatedProperties);

    setRightChecked(new Set());
  };

  // Handle checkbox toggle for left panel
  const handleLeftCheckboxChange = (name: string, checked: boolean) => {
    const newChecked = new Set(leftChecked);
    if (checked) {
      newChecked.add(name);
    } else {
      newChecked.delete(name);
    }
    setLeftChecked(newChecked);
  };

  // Handle checkbox toggle for right panel
  const handleRightCheckboxChange = (name: string, checked: boolean) => {
    const newChecked = new Set(rightChecked);
    if (checked) {
      newChecked.add(name);
    } else {
      newChecked.delete(name);
    }
    setRightChecked(newChecked);
  };

  // Handle property value change with type conversion
  const handlePropertyValueChange = (name: string, value: string) => {
    const updatedProperties = { ...properties };
    updatedProperties[name] = convertPropertyValue(name, value);
    form.setValue("properties", updatedProperties);
  };

  // Handle select all for left panel
  const handleSelectAllLeft = (checked: boolean) => {
    if (checked) {
      setLeftChecked(new Set(availableProperties.map((prop) => prop.name)));
    } else {
      setLeftChecked(new Set());
    }
  };

  // Handle select all for right panel
  const handleSelectAllRight = (checked: boolean) => {
    if (checked) {
      setRightChecked(new Set(selectedProperties.map((prop) => prop.name)));
    } else {
      setRightChecked(new Set());
    }
  };

  if (fetchProductPropertiesQuery.isLoading) {
    return (
      <div className="p-4 md:p-6 border">
        <header className="text-lg font-bold">Properties</header>
        <div className="mt-4 text-center text-muted-foreground">
          Loading properties...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 border rounded-lg">
      <header className="text-lg font-bold">Properties</header>

      <div className="flex flex-col lg:flex-row w-full gap-4 mt-4">
        {/* Left Panel - Available Properties */}
        <div className="w-full md:w-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      availableProperties.length > 0 &&
                      leftChecked.size === availableProperties.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllLeft(checked as boolean)
                    }
                  />
                </TableHead>
                <TableHead>Available Properties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableProperties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground"
                  >
                    No available properties
                  </TableCell>
                </TableRow>
              ) : (
                availableProperties.map((prop) => (
                  <TableRow key={prop.name}>
                    <TableCell>
                      <Checkbox
                        checked={leftChecked.has(prop.name)}
                        onCheckedChange={(checked) =>
                          handleLeftCheckboxChange(
                            prop.name,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{prop.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Control Buttons */}
        <div className="flex lg:flex-col flex-row justify-center items-center gap-2">
          <Button
            size="icon"
            type="button"
            onClick={handleMoveToAvailable}
            disabled={rightChecked.size === 0}
            className="lg:rotate-0 rotate-90"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            size="icon"
            type="button"
            onClick={handleMoveToSelected}
            disabled={leftChecked.size === 0}
            className="lg:rotate-0 rotate-90"
          >
            <ChevronRightIcon />
          </Button>
        </div>

        {/* Right Panel - Selected Properties */}
        <div className="flex-1 min-w-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedProperties.length > 0 &&
                      rightChecked.size === selectedProperties.length
                    }
                    onCheckedChange={(checked) =>
                      handleSelectAllRight(checked as boolean)
                    }
                  />
                </TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedProperties.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground"
                  >
                    No selected properties
                  </TableCell>
                </TableRow>
              ) : (
                selectedProperties.map((prop) => (
                  <TableRow key={prop.name}>
                    <TableCell>
                      <Checkbox
                        checked={rightChecked.has(prop.name)}
                        onCheckedChange={(checked) =>
                          handleRightCheckboxChange(
                            prop.name,
                            checked as boolean
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>{prop.name}</TableCell>
                    <TableCell>
                      <Input
                        type={NUMBER_PROPERTIES.has(prop.name) ? "number" : "text"}
                        placeholder={prop.value}
                        value={properties?.[prop.name] ?? ""}
                        onChange={(e) =>
                          handlePropertyValueChange(prop.name, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
