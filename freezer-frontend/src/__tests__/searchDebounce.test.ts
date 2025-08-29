import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "react";

// Mock the search callback
const mockOnSearch = vi.fn();

describe("Search Debounce", () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces search input and only calls onSearch after delay", async () => {
    let timeoutRef: number | null = null;

    const debouncedSearch = (value: string) => {
      if (timeoutRef !== null) window.clearTimeout(timeoutRef);
      timeoutRef = window.setTimeout(() => {
        mockOnSearch(value.trim());
      }, 300);
    };

    // Simulate rapid typing
    debouncedSearch("a");
    debouncedSearch("ab");
    debouncedSearch("abc");

    // Should not have called onSearch yet
    expect(mockOnSearch).not.toHaveBeenCalled();

    // Fast forward past the debounce delay (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called onSearch with the final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith("abc");
  });

  it("cancels previous debounce when new input is typed", async () => {
    let timeoutRef: number | null = null;

    const debouncedSearch = (value: string) => {
      if (timeoutRef !== null) window.clearTimeout(timeoutRef);
      timeoutRef = window.setTimeout(() => {
        mockOnSearch(value.trim());
      }, 300);
    };

    // Type first character
    debouncedSearch("a");

    // Wait 200ms (not enough to trigger debounce)
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Type second character (should cancel previous debounce)
    debouncedSearch("ab");

    // Wait 300ms more (should trigger debounce for "ab")
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should have called onSearch only once with final value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith("ab");
  });

  it("handles empty search input correctly", async () => {
    let timeoutRef: number | null = null;

    const debouncedSearch = (value: string) => {
      if (timeoutRef !== null) window.clearTimeout(timeoutRef);
      timeoutRef = window.setTimeout(() => {
        mockOnSearch(value.trim());
      }, 300);
    };

    // Set empty search
    debouncedSearch("");

    // Fast forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should call onSearch with empty string
    expect(mockOnSearch).toHaveBeenCalledWith("");
  });

  it("trims whitespace from search input", async () => {
    let timeoutRef: number | null = null;

    const debouncedSearch = (value: string) => {
      if (timeoutRef !== null) window.clearTimeout(timeoutRef);
      timeoutRef = window.setTimeout(() => {
        mockOnSearch(value.trim());
      }, 300);
    };

    // Set search with whitespace
    debouncedSearch("  test  ");

    // Fast forward past debounce delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Should call onSearch with trimmed string
    expect(mockOnSearch).toHaveBeenCalledWith("test");
  });
});
