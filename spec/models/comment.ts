import { JSONApiModel } from '../../src/model';

export class Comment extends JSONApiModel {
  public static __type = 'comments';
  public static __endpoint = '/comments';

  constructor(...args) {
    super(...args);
  }
}
