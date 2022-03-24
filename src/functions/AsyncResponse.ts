export type IResponse<Data = any> = {
    status: number;
    statusText: string;
    data: Data;
    headers: Headers;
}

export class ResponseError extends Error {
    status: number;
    statusText: string;
    data: any;
    headers: Headers;
    
    constructor(message: string, res: any) {
        super(message);
        this.status = res.status;
        this.statusText = res.statusText;
        this.data = res.data;
        this.headers = res.headers;
    }
}

export const AsyncResponse = async (res: Response) => {
    const data = await res.json().then(jsobjct => jsobjct).catch(() => undefined);

    if (!res.ok) throw new ResponseError(res.statusText, {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    });
    // if (!res.ok) throw {
    //     status: res.status,
    //     statusText: res.statusText,
    //     data: await res.json().then(jsobjct => jsobjct).catch(() => undefined),
    //     headers: res.headers
    // };

    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

export const EConnRefused = () => {
    return {
        status: 503,
        statusText: 'ECONNREFUSED',
        data: undefined,
        headers: undefined
    };
};

export const parseHttpRequestReponse = (request: XMLHttpRequest) => {
    const { responseText, status, statusText} = request;
    const ok = (status >= 200 && status < 300);

    const headers = new Map();
    for (const header of request.getAllResponseHeaders().split("\r\n")) {
        const [key, value] = header.split(": ")
        headers.set(key, value)
    }

    return AsyncResponse({ 
        json: async () => JSON.parse(responseText),
        statusText,
        status,
        ok: ok,
        headers: headers
    } as any);
};