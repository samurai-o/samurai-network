import { AxiosInstance } from 'axios';
export declare type NetworkStatusFunc<D = any> = (data: D) => D;
export declare type NetworkOptions = {
    readonly url?: string;
    readonly isMock?: boolean;
};
export declare class Network {
    private readonly options?;
    private static instance;
    private _client;
    private status_monitor;
    private token;
    static Get(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    static Post(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    static Delete(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    constructor(options?: NetworkOptions | undefined);
    private getUrl;
    private initial;
    protected status<R = any>(status: number, func: NetworkStatusFunc<R>): void;
    get client(): AxiosInstance;
    get isMock(): boolean | undefined;
    path(url: string): string;
}
