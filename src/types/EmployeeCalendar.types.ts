export interface DateInfo {
  date: number;
  month: number;
  year: number;
}

export interface CalendarEvent {
  text: string;
  start_date: string;
  end_date: string;
  id?: string | number | null;
  classname?: string;
}
