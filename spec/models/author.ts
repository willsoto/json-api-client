import { JSONApiModel } from '../../src/model';

export class Author extends JSONApiModel {
  public static __type = 'authors';
  public static __endpoint = '/authors';

  constructor(...args) {
    super(...args);
  }
}
