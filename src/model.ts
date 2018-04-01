export abstract class JSONApiModel {
  static __type: string;
  static __endpoint: string;

  constructor(...args: any[]) {
    Object.assign(this, args[0]);
  }
}
