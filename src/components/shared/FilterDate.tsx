'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDateTime, formUrlQuery, removeKeysFromQuery } from '@/lib/utils';

import DatePicker from 'react-datepicker';
import { CalendarRangeIcon } from 'lucide-react';

interface Props {
  urlParam: 'to' | 'from';
  className?: string;
}
const FilterCategory = ({ urlParam, className }: Props) => {
  const [date, setDate] = useState<Date | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const onSelectDate = (date: Date | null) => {
    let newUrl: string;

    setDate(date);

    if (date) {
      newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: urlParam,
        value: formatDateTime(date).dateIso,
      });
    } else {
      newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: [urlParam],
      });
    }

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <div className={`input-wrapper ${className}`}>
        <CalendarRangeIcon className='filter-grey h-6 w-6' />
        <DatePicker
          selected={date}
          onChange={(date: Date | null) => onSelectDate(date)}
          timeInputLabel='Time:'
          dateFormat='dd/MM/yyyy'
          wrapperClassName='datePicker'
        />
      </div>
    </>
  );
};

export default FilterCategory;
