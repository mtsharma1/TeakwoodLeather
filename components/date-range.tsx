"use client"
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./DatePickerWithRange"
import { useState } from "react";

export const DateRangePicker = () =>{
    const defaultToDate = new Date();
    const defaultFromDate = new Date();
    defaultFromDate.setDate(defaultToDate.getDate() - 10);
  
    const [date, setDate] = useState<DateRange | undefined>({
      from: defaultFromDate,
      to: defaultToDate,
    })
    return <DatePickerWithRange date={date} setDate={setDate} disabledDates={{ after: new Date() }} />
    
}