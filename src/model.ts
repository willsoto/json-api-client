import { ICallbackArgs } from './interfaces';

export abstract class JSONApiModel {
  public static __type: string;
  public static __endpoint: string;

  constructor(args: ICallbackArgs) {
    Object.assign(this, args.data);
  }
}
