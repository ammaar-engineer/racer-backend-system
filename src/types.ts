export interface consistent_output<dataschema = {}> {
  message: string;
  data?: dataschema | any;
  statusCode?: number;
  errorCode?: string;
  success?: boolean;
}
