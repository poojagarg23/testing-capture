import React, { useEffect, useRef, useState } from 'react';
import Scheduler from './Scheduler/index.js';
import Loader from './Loader.tsx';

import { getEmployeeCalendarData } from '../../helpers/employee-calendar/index.ts';
import { CalendarEvent, DateInfo } from '../../types/EmployeeCalendar.types.ts';
import PageHeader from './custom/PageHeader.tsx';

declare global {
  interface Window {
    scheduler: {
      loading: boolean;
    };
  }
}

const EmployeeCalendar: React.FC = () => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const startDate = useRef<DateInfo | null>(null);
  window.scheduler.loading = false;

  useEffect(() => {
    // Load the scheduler script
    const script = document.createElement('script');
    script.src = 'https://cdn.dhtmlx.com/scheduler/edge/dhtmlxscheduler.js';
    script.async = true;
    script.onload = () => {
      if (sessionStorage.getItem('refreshScheduler') === 'true') {
        sessionStorage.removeItem('refreshScheduler');
        window.location.reload();
      } else {
        fetchCalendarData();
      }
    };
    document.body.appendChild(script);

    // Load the scheduler CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.dhtmlx.com/scheduler/edge/dhtmlxscheduler.css';
    document.head.appendChild(link);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  const handleEventAdded = (start_date: string | null) => {
    if (start_date) {
      startDate.current = extractDateInfo(start_date.split(' ')[0]);
    }
    fetchCalendarData();
  };

  const refreshCalendarOnFailure = () => {
    fetchCalendarData();
  };

  const extractDateInfo = (start_date: string): DateInfo => {
    const startDate = new Date(start_date);

    return {
      date: startDate.getDate(),
      month: startDate.getMonth(),
      year: startDate.getFullYear(),
    };
  };

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const data = await getEmployeeCalendarData();
      setCalendarEvents(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message || error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6  py-2 md:py-6 flex flex-col">
      <PageHeader title="Team Calendar" showBackButton />
      {/* Loader or Calendar */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Scheduler
            events={calendarEvents}
            onEventAdded={handleEventAdded}
            startDate={startDate.current}
            refreshCalendarOnFailure={refreshCalendarOnFailure}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeCalendar;
