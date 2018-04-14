import { JSONApiModel } from '../../src/model';

export class Article extends JSONApiModel {
  static __type = 'articles';
  static __endpoint = '/articles';

  constructor(...args) {
    super(...args);
  }
}
