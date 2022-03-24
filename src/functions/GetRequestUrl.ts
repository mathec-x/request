const GetRequestUrl = (endPoint: string) => {
    if (endPoint.startsWith('http')) {
        return endPoint
    }

    let RequestUrl: string = (typeof window !== 'undefined' && 'host' in window)
        ? (window as any)?.host
        : (global as any)?.host || '';

    if (endPoint.startsWith('/')) endPoint = endPoint.substring(1);

    return RequestUrl + '/' + endPoint;

}

export default GetRequestUrl;
