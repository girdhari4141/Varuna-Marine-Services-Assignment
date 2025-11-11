
export interface AdjustedCB {
  shipId: string;
  vesselType: string;
  cb_before: number;
}

export interface ComplianceCalculation {
  shipId: string;
  vesselType: string;
  targetIntensity: number;
  actualIntensity: number;
  fuelConsumption: number;
  energyInScope: number;
  cb: number;
}
