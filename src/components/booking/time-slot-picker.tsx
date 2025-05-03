
import { Button } from "@/components/ui/button";

interface TimeSlotPickerProps {
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotPicker({ selectedTime, onTimeSelect }: TimeSlotPickerProps) {
  // Mock time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", 
    "16:00", "16:30", "17:00", "17:30"
  ];
  
  // Mock unavailable slots (in a real app, this would come from the API)
  const unavailableSlots = ["10:00", "13:30", "15:00"];

  return (
    <div className="grid grid-cols-4 gap-2">
      {timeSlots.map((time) => {
        const isUnavailable = unavailableSlots.includes(time);
        const isSelected = selectedTime === time;
        
        return (
          <Button
            key={time}
            variant="outline"
            size="sm"
            className={`
              ${isSelected ? "bg-barber-gold text-white hover:bg-barber-gold/90" : ""}
              ${isUnavailable ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => !isUnavailable && onTimeSelect(time)}
            disabled={isUnavailable}
          >
            {time}
          </Button>
        );
      })}
    </div>
  );
}
