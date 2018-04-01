import { JSONApiModel } from "../../src/model";

export class Author extends JSONApiModel {
  static __type = "authors";
  static __endpoint = "/authors";

  constructor(...args) {
    super(...args);
  }
}
