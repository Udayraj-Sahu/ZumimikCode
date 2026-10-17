import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TimePicker, formatTime24, parseTime24 } from "@/components/ui/time-picker";

if (typeof Element !== "undefined" && typeof Element.prototype.scrollTo !== "function") {
  Element.prototype.scrollTo = () => {};
}

describe("parseTime24", () => {
  it("maps a morning time to 12-hour + AM", () => {
    expect(parseTime24("08:00")).toEqual({ hour: "8", minute: "00", meridiem: "AM" });
  });

  it("maps an evening time to 12-hour + PM", () => {
    expect(parseTime24("20:05")).toEqual({ hour: "8", minute: "05", meridiem: "PM" });
  });

  it("maps midnight to 12 AM", () => {
    expect(parseTime24("00:00")).toEqual({ hour: "12", minute: "00", meridiem: "AM" });
  });

  it("maps noon to 12 PM", () => {
    expect(parseTime24("12:00")).toEqual({ hour: "12", minute: "00", meridiem: "PM" });
  });

  it("falls back to 08:00 AM on empty/invalid input", () => {
    expect(parseTime24("")).toEqual({ hour: "8", minute: "00", meridiem: "AM" });
    expect(parseTime24("99:99")).toEqual({ hour: "8", minute: "00", meridiem: "AM" });
  });
});

describe("formatTime24", () => {
  it("converts 12 AM to 00:00 and 12 PM to 12:00", () => {
    expect(formatTime24("12", "00", "AM")).toBe("00:00");
    expect(formatTime24("12", "00", "PM")).toBe("12:00");
  });

  it("converts an evening hour and pads the minute", () => {
    expect(formatTime24("8", "00", "PM")).toBe("20:00");
    expect(formatTime24("1", "5", "AM")).toBe("01:05");
  });

  it("round-trips every hour of the day", () => {
    for (let h = 0; h < 24; h++) {
      const key = `${String(h).padStart(2, "0")}:00`;
      const parsed = parseTime24(key);
      expect(formatTime24(parsed.hour, parsed.minute, parsed.meridiem)).toBe(key);
    }
  });
});

describe("TimePicker", () => {
  it("selecting PM emits the 24-hour evening value", () => {
    const onChange = vi.fn();
    render(<TimePicker value="08:00" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "PM" }));
    expect(onChange).toHaveBeenCalledWith("20:00");
  });

  it("selecting a minute keeps the hour and meridiem", () => {
    const onChange = vi.fn();
    render(<TimePicker value="08:00" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "30" }));
    expect(onChange).toHaveBeenCalledWith("08:30");
  });

  it("selecting hour 1 in the morning emits 01:00", () => {
    const onChange = vi.fn();
    render(<TimePicker value="08:00" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "1" }));
    expect(onChange).toHaveBeenCalledWith("01:00");
  });

  it("renders the column labels and meridiem options", () => {
    render(<TimePicker value="08:00" onChange={vi.fn()} />);

    expect(screen.getByText("HH")).toBeInTheDocument();
    expect(screen.getByText("MM")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AM" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PM" })).toBeInTheDocument();
  });
});
