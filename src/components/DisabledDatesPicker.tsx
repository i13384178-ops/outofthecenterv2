import { useMemo } from 'react';
import { SingleDatePicker } from './SingleDatePicker';

export function DisabledDatesPicker() {
  const { disabledDates, minDate, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable some specific dates
    const disabled: Date[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + (i * 3) + 2);
      disabled.push(d);
    }

    // Set min/max range
    const min = new Date(today);
    min.setDate(min.getDate() - 5);
    const max = new Date(today);
    max.setDate(max.getDate() + 45);

    return { disabledDates: disabled, minDate: min, maxDate: max };
  }, []);

  return (
    <SingleDatePicker
      disabledDates={disabledDates}
      minDate={minDate}
      maxDate={maxDate}
      variant="default"
      title="With Disabled Dates"
      subtitle="Some dates are unavailable (strikethrough)"
    />
  );
}
