# JSON API Client

## Installation

```bash
yarn add @willsoto/json-api-client
```

```bash
npm install @willsoto/json-api-client
```

## 30 second look

```js
import { JSONApiClient, JSONApiModel } from '@willsoto/json-api-client';

const client = new JSONApiClient();

class Author extends JSONApiModel {
  static __type = 'authors';
  static __endpoint = '/authors';

  constructor(...args) {
    super(...args);
  }
}

// this is optional
client.register(Author.__type, () => {
  // callback to instantiate model, etc
});

client
  .query(Author)
  .all()
  .then((response) => {
    // response.data is now a usable document
  })
  .catch((err) => {
    // normal error object
  });
```

## Usage

### API Client

`JSONApiClient` is backed by [axios](https://github.com/axios/axios) and any options that axios expects can be passed during creation as `axiosOptions`:

```js
const client = new JSONApiClient({
  axiosOptions: {
    /* See https://github.com/axios/axios#request-config */
  }
});
```

Once a client is created, you can begin making API calls:

```js
// will make a request to `/authors`
const response = client
  .query({
    __endpoint: '/authors'
  })
  .all();
```

```js
// will make a request to `/authors/1`
const response = client
  .query({
    __endpoint: '/authors'
  })
  .get('1');
```
