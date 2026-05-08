import { useState, useEffect } from "react";

// This hook delays updating the value until the user stops typing for 'delay' milliseconds.
export default function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up the timer
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function: If the user types again before the timer finishes, 
        // it clears the old timer and starts a new one.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}