import { AsyncResponse, IResponse, parseHttpRequestReponse, ResponseError } from "./AsyncResponse";

type HttpMode = 'fetch' | 'xhr';

let mode: HttpMode = 'fetch';
let host: string = undefined;
let debug: boolean = false;

function logIt(...args: any){
    if(debug) {
        console.log(...args)
    }
}

const GetRequestUrl = (endPoint: string) => {
    if (endPoint.startsWith('http')) {
        return endPoint;
    }

    let RequestUrl: string = (typeof host !== 'undefined' && host.startsWith('http')) ? host : '';
    endPoint = endPoint.startsWith('/') ? endPoint.substring(1) : endPoint;
    return RequestUrl + '/' + endPoint;
};

const HttpRequest = async <Method extends "get" | "post" | "put" | "delete" | "upload">(
    method: Method,
    endPoint: string,
    body: Method extends "upload" ? FileList : Object,
    headers = {}): Promise<IResponse> => {

    const modifiedheader = {};
    if (typeof window !== 'undefined' && 'sessionStorage' in window) {
        for (const [key, value] of Object.entries(sessionStorage)) {
            modifiedheader[key] = value;
        };
    }

    let bodyFetch: RequestInit = {};

    if (method.toLocaleLowerCase() === 'upload') {
        if (!body || (body as FileList)?.length < 1) {
            throw new Error("[Invalid File List]");
        }

        let data = new FormData()
        let fileList = body as FileList;

        for (const file of fileList) {
            data.append('file', file, file.name)
        }

        bodyFetch = {
            method: 'post',
            body: data,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...modifiedheader
            }
        }
    } else {

        bodyFetch = {
            method: method.toUpperCase(),
            body: JSON.stringify(body),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Econding': 'gzip',
                ...headers,
                ...modifiedheader
            }
        };
    }

    const RequestUrl = GetRequestUrl(endPoint);
    try {

        if (mode === 'fetch' && typeof fetch !== 'undefined') {
            const response = await fetch(RequestUrl, bodyFetch);
            logIt({mode, method: bodyFetch.method, RequestUrl, response});
            return AsyncResponse(response);
        }

        else if (mode === 'xhr' && typeof XMLHttpRequest !== 'undefined') {

            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open(bodyFetch.method, RequestUrl);

                for (const key in bodyFetch.headers) {
                    request.setRequestHeader(key, bodyFetch.headers[key]);
                }

                request.onload = async function (ev) {
                    const response = await AsyncResponse(parseHttpRequestReponse(this));
                    logIt({ev: 'loaded', mode, method: bodyFetch.method, RequestUrl, response});
                    resolve(response)
                };
                request.onerror = async function () {
                    const response = await AsyncResponse(parseHttpRequestReponse(this));
                    logIt({ev: 'error', mode, method: bodyFetch.method, RequestUrl, response});
                    request.abort();
                    reject(response);
                };
                request.send(bodyFetch.body as XMLHttpRequestBodyInit);
            })
        } else {
            console.warn("Mode must be xrh|fetch")
        }

    } catch (error) {
        const errorMessage = error.status === 0 ? error.statusText : 'ECONNREFUSED';
        const errorData = error.status === 0 ? error : { status: 503, statusText: 'ECONNREFUSED' };

        logIt({ev: 'catch', mode, method: bodyFetch.method, RequestUrl, errorMessage, errorData});
        throw new ResponseError(errorMessage, errorData);
    }
};

HttpRequest.setMode = (newmode: HttpMode) => {
    mode = newmode
};

HttpRequest.setHost = (newhost: string) => {
    host = newhost
};

HttpRequest.setDebug = (x: boolean) => {
    debug = x
};


export default HttpRequest;
