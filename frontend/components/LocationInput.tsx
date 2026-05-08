"use client";

import { useState, useEffect, useRef } from "react";
import useDebounce from "@/hooks/useDebounce";

// 1. The standard shape of your location data for the whole app
export interface LocationData {
    name: string;
    country: string;
    formattedAddress: string;
    lat: number;
    lon: number;
}

// Add this right under your LocationData interface
export interface GeoapifySuggestion {
    city?: string;
    name?: string;
    state?: string;
    country: string;
    formatted: string;
    lat: number;
    lon: number;
}

interface LocationInputProps {
    onLocationSelect: (location: LocationData | null) => void;
    error?: string;
    placeholder?: string;
}

export default function LocationInput({ onLocationSelect, error, placeholder }: LocationInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const skipSearch = useRef(false);

    // Protect API limits using the hook we just made
    const debouncedSearch = useDebounce(inputValue, 500);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 2. Fetch from Geoapify when the debounced value changes
    useEffect(() => {
        if (debouncedSearch.length < 3) {
            setSuggestions([]);
            return;
        }

        if (skipSearch.current) {
            return;
        }

        const fetchLocations = async () => {
            setIsLoading(true);
            try {
                // 'type=city' ensures we get cities/destinations, not cafes or street addresses
                const res = await fetch(
                    `https://api.geoapify.com/v1/geocode/autocomplete?text=${debouncedSearch}&bias=countrycode:in&format=json&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_KEY}`
                );
                const data = await res.json();
                setSuggestions(data.results || []);
                setIsOpen(true);
            } catch (error) {
                console.error("Failed to fetch locations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocations();
    }, [debouncedSearch]);

    // 3. Handle user clicking a city
    const handleSelect = (item: GeoapifySuggestion) => {
        skipSearch.current = true;
        const selectedData: LocationData = {
            name: item.city || item.state || item.country || item.name || "",
            country: item.country,
            formattedAddress: item.formatted,
            lat: item.lat,
            lon: item.lon,
        };

        setInputValue(selectedData.name);
        setIsOpen(false);
        onLocationSelect(selectedData);
    };

    // 4. Handle "Lock-In" - if they click away without selecting, clear it
    const handleBlur = () => {
        // Timeout allows the click event on the dropdown to fire before closing
        setTimeout(() => {
            setIsOpen(false);
            const exactMatch = suggestions.find(
                (s) => (s.city || s.state || s.country || s.name) === inputValue
            );
            if (!exactMatch) {
                setInputValue("");
                onLocationSelect(null);
            }
        }, 200);
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                    skipSearch.current = false;
                    setInputValue(e.target.value);
                    setIsOpen(true);
                }}
                onBlur={handleBlur}
                placeholder={placeholder || "Search for a city..."}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-travel-text placeholder-travel-text-muted focus:outline-none focus:ring-1 sm:text-sm bg-travel-bg transition-colors ${error ? "border-red-500 focus:border-red-500" : "border-travel-border focus:border-travel-accent"
                    }`}
            />

            {/* Loading Indicator */}
            {isLoading && <span className="absolute right-3 top-3 text-xs text-travel-text-muted">Searching...</span>}

            {/* Dropdown Menu */}
            {isOpen && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-travel-card border border-travel-border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((item, index) => (

                        <li
                            key={index}
                            onMouseDown={() => handleSelect(item)}
                            className="px-4 py-2 hover:bg-travel-accent/10 cursor-pointer text-sm text-travel-text border-b border-travel-border/50 last:border-none"
                        >
                            {/* Show the primary name (City, State, or Country) */}
                            <div className="font-medium">
                                {item.name || item.city || item.state || item.country}
                            </div>
                            <div className="text-xs text-travel-text-muted">
                                {item.city ? `${item.city}, ` : ""}{item.country}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}