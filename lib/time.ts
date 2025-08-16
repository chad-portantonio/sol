import { format, addHours, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns'

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy h:mm a')
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM d, yyyy')
}

export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a')
}

export function isInNext24Hours(date: Date): boolean {
  const now = new Date()
  const tomorrow = addHours(now, 24)
  return isAfter(date, now) && isBefore(date, tomorrow)
}

export function getTodayRange() {
  const now = new Date()
  return {
    start: startOfDay(now),
    end: endOfDay(now)
  }
}

export function getNext24HoursRange() {
  const now = new Date()
  const tomorrow = addHours(now, 24)
  return {
    start: now,
    end: tomorrow
  }
}

