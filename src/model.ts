import { CallbackArgs } from "./interfaces";

export abstract class JSONApiModel {
  static __type: string;
  static __endpoint: string;

  constructor(args: CallbackArgs) {
    Object.assign(this, args.data);
  }
}
