import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "data-testid"?: string;
}

export function DatePicker({ value, onChange, placeholder = "Selecciona una fecha", ...props }: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const date = value ? new Date(value + "T00:00:00") : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-testid={props["data-testid"]}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={es}
          defaultMonth={date}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "data-testid"?: string;
}

export function DateTimePicker({ value, onChange, placeholder = "Selecciona fecha y hora", ...props }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  const parseValue = (val?: string) => {
    if (!val) return { date: undefined, hour: "15", minute: "00" };
    const d = new Date(val);
    if (isNaN(d.getTime())) return { date: undefined, hour: "15", minute: "00" };
    return {
      date: d,
      hour: String(d.getHours()).padStart(2, "0"),
      minute: String(d.getMinutes()).padStart(2, "0"),
    };
  };

  const { date, hour, minute } = parseValue(value);

  const buildISOString = (d: Date, h: string, m: string) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T${h}:${m}`;
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(buildISOString(selectedDate, hour, minute));
    }
  };

  const handleHourChange = (h: string) => {
    if (date) {
      onChange(buildISOString(date, h, minute));
    }
  };

  const handleMinuteChange = (m: string) => {
    if (date) {
      onChange(buildISOString(date, hour, m));
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-testid={props["data-testid"]}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? format(date, "d 'de' MMMM, yyyy", { locale: es }) + ` - ${hour}:${minute}`
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={es}
          defaultMonth={date}
          initialFocus
        />
        <div className="border-t p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Hora:</span>
            <Select value={hour} onValueChange={handleHourChange}>
              <SelectTrigger className="w-[70px]" data-testid="select-hour">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {hours.map((h) => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-lg font-bold">:</span>
            <Select value={minute} onValueChange={handleMinuteChange}>
              <SelectTrigger className="w-[70px]" data-testid="select-minute">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {minutes.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
