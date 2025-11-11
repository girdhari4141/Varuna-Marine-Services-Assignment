// Domain types for Banking operations (Fuel EU Article 20)

export interface BankRequest {
  shipId: string;
  year: number;
  amount: number;
}

export interface BankResponse {
  message: string;
  result: {
    shipId: string;
    year: number;
    amount: number;
  };
}

export interface ApplyRequest {
  shipId: string;
  year: number;
  applyAmount: number;
}

export interface ApplyResponse {
  cb_before: number;
  applied: number;
  cb_after: number;
}
