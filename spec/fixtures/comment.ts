import { JSONApiModel } from '../../src/model';

export class Comment extends JSONApiModel {
  static __type = 'comments';
  static __endpoint = '/comments';

  constructor(...args) {
    super(...args);
  }
}
