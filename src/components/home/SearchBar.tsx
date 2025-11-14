/**
 * SearchBar component - search input with icon and clear button
 */

import { useState, useEffect } from "react";
import { SearchIcon, CloseIcon } from "../shared/icons";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search notes...",
  debounceMs = 300,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);

  // Update local state when value prop changes (e.g., when cleared externally)
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs, onChange]);

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
      />
      {/* Search Icon */}
      <div className="absolute left-3 top-2.5 text-gray-400">
        <SearchIcon />
      </div>
      {/* Clear Button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-all duration-200 active:scale-90 animate-fade-in-scale"
          aria-label="Clear search"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
