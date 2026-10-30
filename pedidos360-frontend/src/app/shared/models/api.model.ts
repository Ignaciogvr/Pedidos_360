export interface ApiError {
  status: number;
  message: string;
  originalError: any;
  timestamp: Date;
}
