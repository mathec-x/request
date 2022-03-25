# xhrfetch

## client http request

- installation

```bash
npm i xhrfetch
```

### using fetch

```js
// on main app
import Request from 'xhrfetch';
Request.setMode("fetch"); // default 
```

### using xhr
```js
// on main app
import Request from 'xhrfetch';
Request.setMode("xhr");
```

### declare a global host for all fetchers
```js
window.host = process.env.API_DEFAULT_URL
```

### inside nodejs server

``` js
global.host = 'http://localhost:3001';
global.fetch = require("node-fetch");
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
```

- get with querystring and xhr receive 200 json body

```js
        const req = await Request<{name: string}>("/api", { id: 1, name: 'Jhon Doe' }).get()
        expect(req.data.name).toBe('Jhon Doe');
        expect(req.status).toBe(200);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })
```

- post and receive 201 with empty body plain text

```js
        const req = await Request("/api").post({ id: 1, name: 'Jhon Doe' })
        expect(req.data).toBe(undefined);
        expect(req.status).toBe(201);
        expect(req.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    })
```

- put and receive 202 with json reponse

```js
        const req = await Request("/api").put({ id: 1 })
        expect(req.status).toBe(202);
        expect(req.data).toBeInstanceOf(Object);
        expect(req.headers.get('content-type')).toBe('application/json; charset=utf-8');
    })
```

- delete and receive 401 unauthorized

```js
        try {
            await Request("/api").delete({ id: 1 });

        } catch (error) {
            if(error instanceof Request.Error){
                expect(error.data).toBeInstanceOf(Object);
                expect(error.status).toBe(401);
                expect(error.headers.get('content-type')).toBe('application/json; charset=utf-8');
            }
        }
    })

```