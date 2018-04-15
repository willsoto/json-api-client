import { JSONApiModel } from '../../src/model';

export class Article extends JSONApiModel {
  public static __type = 'articles';
  public static __endpoint = '/articles';

  constructor(...args) {
    super(...args);
  }
}
