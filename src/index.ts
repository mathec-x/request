import { IResponse, ResponseError } from "./functions/AsyncResponse";
import HttpRequest from "./functions/HttpRequest";
import SerializeQueryString from "./functions/SerializeQueryString";

function Request<Res = any>(endPoint: string, queryString: Object = null) {
    if (queryString) {
        endPoint += '?' + SerializeQueryString(queryString);
    }
    return {
        get: async (body?: any, headers?: HeadersInit): Promise<IResponse<Res>> => await HttpRequest('get', endPoint, body, headers),
        put: async (body?: any, headers?: HeadersInit): Promise<IResponse<Res>> => await HttpRequest('put', endPoint, body, headers),
        post: async (body?: any, headers?: HeadersInit): Promise<IResponse<Res>> => await HttpRequest('post', endPoint, body, headers),
        delete: async (body?: any, headers?: HeadersInit): Promise<IResponse<Res>> => await HttpRequest('delete', endPoint, body, headers),
        upload: async (body: FileList, headers?: HeadersInit): Promise<IResponse<Res>> => await HttpRequest('upload', endPoint, body, headers)
    }
}


Request.Error = ResponseError;
Request.setMode = HttpRequest.setMode;
export default Request;