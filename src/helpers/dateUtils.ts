import { format, isValid } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

// Default timezone - can be configured based on application needs
const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Parse a date string or Date object to a standardized Date object
 * Handles ISO strings, date objects, and various string formats
 * Preserves the exact date regardless of timezone
 */
export const parseDate = (dateInput: string | Date | null | undefined): Date | null => {
  if (!dateInput) return null;
  try {
    // If it's already a Date object
    if (dateInput instanceof Date) {
      return isValid(dateInput) ? dateInput : null;
    }

    // If it's an ISO string (with T)
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      // For ISO strings, we need to preserve the exact date regardless of timezone
      // Extract just the date part to avoid timezone shifts
      const datePart = dateInput.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      // Create date with local timezone but same Y-M-D values
      const localDate = new Date(year, month - 1, day);
      return isValid(localDate) ? localDate : null;
    }

    // If it's a simple date string (YYYY-MM-DD)
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const [year, month, day] = dateInput.split('-').map(Number);
      // Create date with local timezone
      const localDate = new Date(year, month - 1, day);
      return isValid(localDate) ? localDate : null;
    }

    // If it's MM/DD/YYYY format
    if (typeof dateInput === 'string' && dateInput.includes('/')) {
      const [month, day, year] = dateInput.split('/').map(Number);
      // Create date with local timezone
      const localDate = new Date(year, month - 1, day);
      return isValid(localDate) ? localDate : null;
    }

    // Handle MMDDYYYY format (8 digits without separators)
    if (typeof dateInput === 'string' && /^\d{8}$/.test(dateInput)) {
      const month = parseInt(dateInput.substring(0, 2), 10);
      const day = parseInt(dateInput.substring(2, 4), 10);
      const year = parseInt(dateInput.substring(4, 8), 10);

      // Create date with local timezone - using the Date constructor with full 4-digit year
      const localDate = new Date(year, month - 1, day);

      // Verify the year was set correctly
      if (localDate.getFullYear() !== year) {
        // Force the year to be correct
        localDate.setFullYear(year);
      }

      return isValid(localDate) ? localDate : null;
    }

    // Last resort - try native Date parsing
    const fallbackDate = new Date(dateInput);
    return isValid(fallbackDate) ? fallbackDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Format a date to display format (MM/DD/YYYY)
 * Ensures the displayed date matches the actual calendar date from the input
 */
export const formatDisplayDate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';

  try {
    // For ISO strings, extract just the date part to avoid timezone shifts
    if (typeof dateInput === 'string' && dateInput.includes('T')) {
      const datePart = dateInput.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
    }

    // For other cases, use our parseDate function which preserves the date
    const parsedDate = parseDate(dateInput);
    if (!parsedDate) return '';

    return format(parsedDate, 'MM/dd/yyyy');
  } catch (error) {
    console.error('Error formatting display date:', error);
    return '';
  }
};

/**
 * Format a date to ISO format for API/database (YYYY-MM-DD)
 * Ensures the ISO date matches the actual calendar date from the input
 */
export const formatISODate = (dateInput: string | Date | null | undefined): string => {
  if (!dateInput) return '';

  try {
    // Special case for YYYY-MM-DD format already
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }

    const parsedDate = parseDate(dateInput);

    if (!parsedDate) return '';

    // Ensure we use the date's actual year, month, day rather than UTC converted values
    const year = parsedDate.getFullYear();
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = parsedDate.getDate().toString().padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return typeof dateInput === 'string' ? dateInput : '';
  }
};

/**
 * Format a date with time for display (MM/DD/YYYY hh:mm a)
 */
export const formatDisplayDateTime = (dateInput: string | Date | null | undefined): string => {
  const parsedDate = parseDate(dateInput);
  if (!parsedDate) return '';
  return format(parsedDate, 'MM/dd/yyyy hh:mm a');
};

/**
 * Convert UTC date to local timezone
 */
export const utcToLocal = (dateInput: string | Date | null | undefined): Date | null => {
  const parsedDate = parseDate(dateInput);
  if (!parsedDate) return null;
  return new Date(formatInTimeZone(parsedDate, DEFAULT_TIMEZONE, 'yyyy-MM-dd HH:mm:ss'));
};

/**
 * Convert local date to UTC
 */
export const localToUTC = (dateInput: string | Date | null | undefined): Date | null => {
  const parsedDate = parseDate(dateInput);
  if (!parsedDate) return null;

  // Create a UTC date by adjusting for the timezone offset
  if (parsedDate) {
    const utcDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
    return utcDate;
  }
  return null;
};

/**
 * Check if a date is valid
 */
export const isDateValid = (dateInput: string | Date | null | undefined): boolean => {
  return parseDate(dateInput) !== null;
};

/**
 * Utility to calculate if a date is older than N days
 */
export const isOlderThanNDays = (
  dateInput: string | Date | null | undefined,
  days: number,
): boolean => {
  if (!dateInput) return false;
  const date = new Date(dateInput as string);
  if (isNaN(date.getTime())) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs > days * 24 * 60 * 60 * 1000;
};

/**
 * Calculate age in years from a date of birth.
 * Returns null if the input is invalid or cannot be parsed.
 */
export const calculateAge = (dateInput: string | Date | null | undefined): number | null => {
  const dob = parseDate(dateInput);
  if (!dob) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};
