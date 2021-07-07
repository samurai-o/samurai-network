import { AxiosInstance } from 'axios';
export declare type NetworkStatusFunc<D = any> = (data: D) => D;
export declare class Network {
    private readonly url?;
    private static instance;
    private _client;
    private status_monitor;
    private token;
    static Get(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    static Post(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    static Delete(url: string, headers?: any): (_target: Network, _key: string, descriptor: any) => any;
    constructor(url?: string | undefined);
    private initial;
    protected status<R = any>(status: number, func: NetworkStatusFunc<R>): void;
    get client(): AxiosInstance;
}
