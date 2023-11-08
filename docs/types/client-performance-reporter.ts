// https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
export interface ClientPerformanceReporterConnection {
  downlink: number;
  effectiveType: string;
  rtt: number;
}

export interface ClientPerformanceReporterResults {
  timing?: PerformanceTiming;
  connection?: ClientPerformanceReporterConnection;
  paint?: PerformanceEntry[];
  // Should be PerformanceResourceTiming[]
  // @see https://github.com/microsoft/TypeScript/issues/33866
  resources?: PerformanceEntryList;
}

export const CLIENT_PERFORMANCE_REPORTER_SAMPLE_RATE = 0.1;
