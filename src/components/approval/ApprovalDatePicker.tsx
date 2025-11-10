import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalDatePickerProps {
  value?: string | null;
  maxDate: Date;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ApprovalDatePicker({
  value,
  maxDate,
  onChange,
  onSave,
  onCancel,
}: ApprovalDatePickerProps) {
  const selectedDate = useMemo(() => {
    if (!value) return undefined;
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }, [value]);

  const initialMonth = selectedDate && !isAfter(selectedDate, maxDate) ? selectedDate : maxDate;
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));
  const headerText = format(currentMonth, "MMMM yyyy");

  const generateCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days: Date[] = [];
    let cursor = start;

    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  };

  const days = generateCalendarDays();

  const toDateInputValue = (date: Date) => format(date, "yyyy-MM-dd");

  const handleSelect = (date: Date) => {
    if (isAfter(date, maxDate)) return;
    onChange(toDateInputValue(date));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    const nextMonth = addMonths(currentMonth, direction === "prev" ? -1 : 1);
    if (direction === "next" && isAfter(startOfMonth(nextMonth), startOfMonth(maxDate))) return;
    setCurrentMonth(startOfMonth(nextMonth));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/0">
      
        <div className="rounded-[28px] bg-card shadow-inner overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              type="button"
              onClick={() => handleMonthChange("prev")}
              className="h-7 w-7 rounded-full flex items-center justify-center text-foreground focus:outline-none focus-visible:outline-none focus:ring-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-semibold tracking-wide">{headerText}</p>
            <button
              type="button"
              onClick={() => handleMonthChange("next")}
              className="h-7 w-7 rounded-full flex items-center justify-center text-foreground disabled:opacity-30 focus:outline-none focus-visible:outline-none focus:ring-0"
              disabled={!isAfter(startOfMonth(maxDate), startOfMonth(currentMonth))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="h-px bg-border/70 mx-4" />

          <div className="p-4">
            <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground mb-3 uppercase tracking-wide font-semibold">
              {dayNames.map((name) => (
                <span key={name}>{name}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-[13px]">
              {days.map((date) => {
                const outsideMonth = !isSameMonth(date, currentMonth);
                const disabled = isAfter(date, maxDate);
                const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => handleSelect(date)}
                    disabled={disabled}
                    className={[
                      "mx-auto h-8 w-8 rounded-lg flex items-center justify-center text-[13px] border border-transparent",
                      outsideMonth ? "text-muted-foreground/60 font-normal opacity-80" : "text-foreground font-normal",
                      disabled ? "text-muted-foreground/30 opacity-40 cursor-not-allowed" : "",
                    isSelected ? "bg-primary text-primary-foreground shadow border-transparent" : "",
                      "focus:outline-none focus-visible:outline-none focus:ring-0"
                    ].join(" ")}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-9 rounded-xl text-sm font-medium focus:outline-none focus-visible:outline-none focus:ring-0 hover:bg-transparent hover:text-foreground"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 h-9 rounded-xl text-sm font-semibold focus:outline-none focus-visible:outline-none focus:ring-0 hover:bg-primary"
                onClick={onSave}
                disabled={!value}
              >
                OK
              </Button>
            </div>
          </div>
        </div>

    </div>
  );
}
