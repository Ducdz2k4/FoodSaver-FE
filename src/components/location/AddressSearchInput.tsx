"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, MapPin, X } from "lucide-react";
import { forwardGeocode, GeocodeSuggestion } from "@/services/mapboxService";

interface AddressSearchInputProps {
  onSelect: (item: GeocodeSuggestion) => void;
  placeholder?: string;
  initialValue?: string;
  autoFocus?: boolean;
  proximity?: [number, number];
}

export function AddressSearchInput({
  onSelect,
  placeholder = "Nhập số nhà, tên đường, phường/xã...",
  initialValue = "",
  autoFocus = false,
  proximity,
}: AddressSearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await forwardGeocode(trimmed, {
          proximity: proximity || [106.695, 10.7769],
          signal: controller.signal,
          limit: 5,
        });

        if (!controller.signal.aborted) {
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setActiveIndex(-1);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("[AddressSearchInput] Search failed:", err);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, proximity]);

  const handleSelect = useCallback(
    (item: GeocodeSuggestion) => {
      setQuery(item.fullAddress || item.name);
      setIsOpen(false);
      setSuggestions([]);
      onSelect(item);
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-4 text-stone-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-[#00615f] focus:ring-2 focus:ring-[#00615f]/20 rounded-xl outline-none transition text-stone-900 placeholder:text-stone-400 font-medium"
        />
        {isLoading ? (
          <div className="absolute right-3.5 flex items-center">
            <Loader2 className="size-4 animate-spin text-[#00615f]" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 text-stone-400 hover:text-stone-600 transition p-0.5 rounded-full"
            aria-label="Xóa địa chỉ"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-stone-100 py-1"
        >
          {suggestions.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`px-3.5 py-2.5 cursor-pointer flex items-start gap-2.5 text-left transition ${
                  isSelected ? "bg-emerald-50 text-[#00615f]" : "hover:bg-stone-50 text-stone-800"
                }`}
              >
                <MapPin className="size-4 text-[#00615f] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-stone-900">{item.name}</p>
                  <p className="text-[11px] text-stone-500 truncate">{item.fullAddress}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Empty State when search has query but no results */}
      {isOpen && !isLoading && query.trim().length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-stone-200 rounded-xl shadow-lg p-3 text-center">
          <p className="text-xs text-stone-500 font-medium">
            Không tìm thấy địa chỉ phù hợp. Bạn có thể thử kéo ghim trên bản đồ.
          </p>
        </div>
      )}
    </div>
  );
}
