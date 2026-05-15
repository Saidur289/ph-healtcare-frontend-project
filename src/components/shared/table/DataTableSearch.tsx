"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DataTableSearchProps {
  initialValue?: string;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  onDebounceChange: (value: string) => void;
}

const DataTableSearch = ({
  initialValue = "",
  placeholder = "Search......",
  debounceMs = 700,
  isLoading,
  onDebounceChange,
}: DataTableSearchProps) => {
  const [value, setValue] = useState(initialValue);
  const skipNextDebounceRef = useRef(false);
  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      onDebounceChange(value.trim());
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, onDebounceChange]);
  const handleClear = () => {
    skipNextDebounceRef.current = true;
    setValue("");
    onDebounceChange("");
  };
  return (
    <div className="relative w-full md:max-w-sm">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-1/2 " />
      <Input
        value={value}
        placeholder={placeholder}
        className="h-9 pr-9 pl-9"
        onChange={(e) => setValue(e.target.value)}
        disabled={isLoading}
      />
      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size={"icon-xs"}
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={handleClear}
          disabled={isLoading}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default DataTableSearch;
