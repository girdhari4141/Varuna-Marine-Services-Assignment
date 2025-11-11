export interface RouteComparison {
  routeId: string;
  baselineIntensity: number;
  comparisonIntensity: number;
  percentDiff: number;
  compliant: boolean;
}
