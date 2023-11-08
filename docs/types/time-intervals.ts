/* eslint-disable @typescript-eslint/prefer-literal-enum-member */

export enum SecondsPer { // eslint-disable-line no-restricted-syntax
  Minute = 60,
  Hour = 60 * 60,
  Day = 60 * 60 * 24,
  Week = 60 * 60 * 24 * 7,
  Month = 60 * 60 * 24 * 30,
  Year = 60 * 60 * 24 * 365,
}

export enum MillisecondsPer { // eslint-disable-line no-restricted-syntax
  Second = 1000,
  Minute = 60 * 1000,
  Hour = 60 * 60 * 1000,
  Day = 60 * 60 * 24 * 1000,
  Week = 60 * 60 * 24 * 7 * 1000,
  Month = 60 * 60 * 24 * 30 * 1000, // Assume 30d is approximately a month
  Year = 60 * 60 * 24 * 365 * 1000,
}
