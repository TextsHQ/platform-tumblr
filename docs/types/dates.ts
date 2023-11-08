export enum DateLocaleFormats { // eslint-disable-line no-restricted-syntax
  Notes = 'notes', // "Dec. 20, 2017"
  ArchiveMonth = 'archive-month', // December 2017
  MonthNameLong = 'month-name-long', // Full month only ("January", "June", "October", etc.)
  WeekdayShort = 'weekday-short', // "Wed"
  MonthDayShort = 'month-day-short', // Jan 5
  MonthDayYearLong = 'month-day-year-long', // January 5 2022
  MonthDayYearShort = 'month-day-year-short', // Jan 5 2022
  WeekdayMonthYear = 'weekday-month-year', // "Wednesday, March 14"
  DateAndTime = 'date-and-time',
  DateAndTimeShort = 'date-and-time-short',
  DateAndTimeLongWithTimezone = 'date-and-time-long-with-timezone', // March 17 at 6:00 AM GMT+11
  WeekDayDateAndTime = 'weekday-day-and-time',
  Time = 'time', // "4:00 PM"
  TimeUTC = 'time-utc', // "4:00 PM" converted to UTC
  NumericDayMonth = 'numeric-day-month', // "12/31",
  LeadingDayMonthYear = 'leading-day-month-year', // "01/28/2020" or "28/01/2020"
  NumericDayMonthHour = 'numeric-day-month-hour', // "12/31, 1 PM"
  NumericDayMonthShortYear = 'numeric-short-day-month-year', // "1/28/22"
  NumericMonth = 'numeric-month', // "2" for February
  NumericYear = 'numeric-year', // "2023"
}

export enum RelativeDateStringFormats { // eslint-disable-line no-restricted-syntax
  Days = 'days',
  Relative = 'relative',
  Simple = 'simple',
  /**
   * A representation that's relative for recent dates and absolute for more distant events.
   * @example 12m ago
   * @example September 18, 2016
   */
  Automatic = 'auto',
  /**
   * A compact representation that's relative for recent dates and absolute for more distant events.
   * @example 12m
   * @example September 18, 2016
   */
  AutomaticCompact = 'autocompact',
}

/**
 * Number formats that can be used with `Intl.NumberFormat`.
 *
 * short: "4,000" becomes "4k"
 * compact: only 10k and above gets shortened
 */
export type NumberLocaleFormats = 'short' | 'compact';
