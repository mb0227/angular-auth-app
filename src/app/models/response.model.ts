export interface ResponseVM<T = any> {
  statusCode: number;
  responseMessage?: string;
  errorMessage?: string;
  data?: T;
}