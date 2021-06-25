import { AxiosInstance } from 'axios';
export declare type NetworkStatusFunc<D = any> = (data: D) => D;
export declare class Network {
    private readonly url?;
    private static client;
    private static axios;
    static Get(url: string): (target: Network, key: string, descriptor: any) => any;
    static Post(url: string): (target: Network, key: string, descriptor: any) => any;
    constructor(url?: string | undefined);
    private status_monitor;
    private token;
    private initial;
    protected status<R = any>(status: number, func: NetworkStatusFunc<R>): void;
    get send(): AxiosInstance;
}
