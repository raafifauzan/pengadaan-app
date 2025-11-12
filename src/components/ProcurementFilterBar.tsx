import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Search, Filter } from "lucide-react";

type Option = {
  value: string;
  label: string;
};

interface ProcurementFilterBarProps {
  className?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusOptions: Option[];
  statusValue: string;
  onStatusChange: (value: string) => void;
  jenisOptions: Option[];
  jenisValue: string;
  onJenisChange: (value: string) => void;
  nilaiRange: [number, number];
  nilaiValue: [number, number];
  onNilaiChange: (value: [number, number]) => void;
}

export function ProcurementFilterBar({
  className,
  searchPlaceholder = "Cari data...",
  searchValue,
  onSearchChange,
  statusOptions,
  statusValue,
  onStatusChange,
  jenisOptions,
  jenisValue,
  onJenisChange,
  nilaiRange,
  nilaiValue,
  onNilaiChange,
}: ProcurementFilterBarProps) {
  const minSliderBase = 0;
  const [minValue, maxValue] = nilaiValue;
  const sliderMin = Math.min(minSliderBase, Math.min(nilaiRange[0], nilaiRange[1]));
  const rawMax = Math.max(nilaiRange[0], nilaiRange[1]);
  const sliderMax = rawMax === sliderMin ? sliderMin + 1 : rawMax;
  const currentMin = Math.min(Math.max(minValue, sliderMin), sliderMax);
  const currentMax = Math.min(Math.max(maxValue, currentMin), sliderMax);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div
      className={cn(
        "w-fit rounded-xl border border-[#E1E7EF] bg-white px-4 py-3",
        className
      )}
    >
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search bar */}
        <div className="w-full sm:w-[450px]">
          <div className="relative rounded-full bg-muted/40 border border-muted">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              className="h-11 rounded-full border-none bg-transparent pl-12 pr-4 focus-visible:ring-1 focus-visible:ring-primary/40"
            />
          </div>
        </div>

        {/* Filter button */}
        <div className="w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-muted/40 border border-muted px-5 text-sm font-normal text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Filter className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              className="w-[375px] grid grid-cols-2 gap-6 rounded-2xl border border-[#E5E7F1] bg-white p-6"
            >
              {/* Baris pertama: Status & Jenis */}
              <div className="space-y-1">
                <p className="text-xs font-normal text-muted-foreground uppercase tracking-wide">
                  Status
                </p>
                <Select value={statusValue} onValueChange={onStatusChange}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted/40 border border-muted">
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-normal text-muted-foreground uppercase tracking-wide">
                  Jenis Project
                </p>
                <Select value={jenisValue} onValueChange={onJenisChange}>
                  <SelectTrigger className="h-10 rounded-xl bg-muted/40 border border-muted">
                    <SelectValue placeholder="Semua jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Baris kedua: Nilai Project */}
              <div className="col-span-2 space-y-2">
                <p className="text-xs font-normal text-muted-foreground uppercase tracking-wide">
                  Nilai Project
                </p>
                <div className="rounded-xl bg-muted/30 border border-muted px-4 py-3 relative">
                  <SliderPrimitive.Root
                    min={sliderMin}
                    max={sliderMax}
                    step={Math.max(
                      1000000,
                      Math.floor((sliderMax - sliderMin) / 100) || 1
                    )}
                    value={[currentMin, currentMax]}
                    onValueChange={(value) =>
                      onNilaiChange(value as [number, number])
                    }
                    className="relative flex w-full touch-none select-none items-center"
                  >
                    <SliderPrimitive.Track className="bg-gray-200 relative grow rounded-full h-2">
                      <SliderPrimitive.Range
                        className={cn(
                          "absolute rounded-full h-full transition-colors",
                          currentMax >= 200_000_000
                            ? "bg-primary"
                            : "bg-primary/50"
                        )}
                      />
                      {/* Marker 200jt */}
                      <div
                        className="absolute top-[-1px] h-3 w-[3px] bg-red-500 rounded-full"
                        style={{
                          left: `${((200_000_000 - sliderMin) /
                            (sliderMax - sliderMin)) *
                            100}%`,
                          transform: "translateX(-50%)",
                        }}
                      />
                      <span
                        className="absolute -top-7 px-2 py-0.5 text-[10px] text-white bg-red-500 rounded-full shadow-sm"
                        style={{
                          left: `${((200_000_000 - sliderMin) /
                            (sliderMax - sliderMin)) *
                            100}%`,
                          transform: "translateX(-50%)",
                        }}
                      >
                        200jt
                      </span>
                    </SliderPrimitive.Track>
                    {/* Thumb putih-biru */}
                    <SliderPrimitive.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md hover:scale-110 transition-transform" />
                    <SliderPrimitive.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-md hover:scale-110 transition-transform" />
                  </SliderPrimitive.Root>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(currentMin)}</span>
                    <span>{formatCurrency(currentMax)}</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
