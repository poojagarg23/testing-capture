import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';
import { CalendarEvent } from '../../types/EmployeeCalendar.types.ts';

export const getEmployeeCalendarData = async () => {
  const response = await fetch(`${BASE_API_URL}/calendar/employee-calendar`, {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching calendar data: ${response.status}`);
  }

  return response.json();
};

export const saveEmployeeCalendarEvent = async ({
  text,
  start_date,
  end_date,
  id = null,
  classname = 'purple',
}: CalendarEvent) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify({ text, start_date, end_date, id, classname }),
  };

  const response = await fetch(`${BASE_API_URL}/calendar/employee-calendar`, requestOptions);
  const data = await response.json();
  return { data, ok: response.ok };
};

export const deleteEmployeeCalendarEventAPI = async (id: number | string) => {
  const requestOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
  };

  const response = await fetch(`${BASE_API_URL}/calendar/employee-calendar/${id}`, requestOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete calendar event');
  }

  return data;
};
