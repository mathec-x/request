import { AsyncResponse,  IResponse, parseHttpRequestReponse, ResponseError } from "./AsyncResponse";
import GetRequestUrl from "./GetRequestUrl";

type HttpMode = 'fetch' | 'xhr';

let mode: HttpMode = 'fetch';

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
            const ar = await fetch(RequestUrl, bodyFetch);
            return AsyncResponse(ar);
        }

        else if (mode === 'xhr' && typeof XMLHttpRequest !== 'undefined') {

            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open(bodyFetch.method, RequestUrl);

                for (const key in bodyFetch.headers) {
                    request.setRequestHeader(key, bodyFetch.headers[key]);
                }

                request.onload = function() { 
                    resolve(parseHttpRequestReponse(this)) 
                };
                request.onerror = function() { 
                    reject(parseHttpRequestReponse(this)) 
                };
                request.send(bodyFetch.body as XMLHttpRequestBodyInit);
            })
        } else {
            console.warn("Mode must be xrh|fetch")
        }

    } catch (error) {
        const errorMessage = error.status ? error.statusText : 'ECCONREFUSED';
        const errorData = error.status ? error : { status: 503, statusText: 'ECCONREFUSED' }

        throw new ResponseError(errorMessage , errorData);
    }
};

HttpRequest.setMode = (newmode: HttpMode) => {
    mode = newmode
};

export default HttpRequest;
