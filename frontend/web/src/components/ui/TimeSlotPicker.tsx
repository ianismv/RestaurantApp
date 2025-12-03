import { cn } from '../../lib/cn';

interface TimeSlot {
  start: string; // HH:mm
  end: string; // HH:mm
  label: string;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  disabled?: boolean;
}

export const TimeSlotPicker = ({
  slots,
  selectedSlot,
  onSelect,
  disabled = false,
}: TimeSlotPickerProps) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {slots.map((slot) => {
        const isSelected =
          selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

        return (
          <button
            key={`${slot.start}-${slot.end}`}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(slot)}
            className={cn(
              'px-4 py-2 rounded-lg border-2 transition-all',
              'hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background border-border hover:bg-accent'
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
};