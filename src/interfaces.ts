export interface Options {
  baseURL?: string;
  basePath: string;
}

export interface DenmoralizedResponseObject {
  id?: string | number;
  [key: string]: any;
}

export type DenmoralizedResponse =
  | DenmoralizedResponseObject
  | DenmoralizedResponseObject[];

export interface Creator<T> {
  new (...args: any[]): T;
}
