import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
  const [minValue, maxValue] = nilaiValue;
  const sliderMin = Math.min(nilaiRange[0], nilaiRange[1]);
  const rawMax = Math.max(nilaiRange[0], nilaiRange[1]);
  const sliderMax = rawMax === sliderMin ? sliderMin + 1 : rawMax;
  const currentMin = Math.min(Math.max(minValue, sliderMin), sliderMax);
  const currentMax = Math.min(Math.max(maxValue, currentMin), sliderMax);
  const plafondValue = 200_000_000;
  const plafondPosition =
    sliderMax > sliderMin
      ? Math.min(Math.max((plafondValue - sliderMin) / (sliderMax - sliderMin), 0), 1)
      : 0;
  const showPlafondMarker = plafondValue >= sliderMin && plafondValue <= sliderMax;

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
              align="start"
              className="w-[250px] sm:w-[280px] space-y-4 rounded-2xl border border-[#E5E7F1] bg-white"
            >
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

              <div className="space-y-2">
                <p className="text-xs font-normal text-muted-foreground uppercase tracking-wide">
                  Nilai Project
                </p>
                <div className="rounded-xl bg-muted/30 border border-muted px-4 py-3">
                  <Slider
                    min={sliderMin}
                    max={sliderMax}
                    step={Math.max(
                      1000000,
                      Math.floor((sliderMax - sliderMin) / 100) || 1
                    )}
                    value={[currentMin, currentMax]}
                    onValueChange={(value) => {
                      const [start, end = value[0]] = value;
                      onNilaiChange([start, end]);
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(currentMin)}</span>
                    <span>{formatCurrency(currentMax)}</span>
                  </div>
                  {showPlafondMarker && (
                    <div className="relative mt-3 h-5 text-[11px] text-muted-foreground">
                      <div className="absolute inset-y-0" style={{ left: `${plafondPosition * 100}%` }}>
                        <div className="h-full w-px bg-primary/60 mx-auto" />
                        <div className="mt-1 -translate-x-1/2 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                          Rp 200 jt (Plafon)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
