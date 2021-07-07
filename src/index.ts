import axios, { AxiosInstance } from 'axios';
import { isEmpty, isFunc } from '@frade-sam/samtools';

export type NetworkStatusFunc<D = any> = (data: D) => D;

export class Network {
    private static instance: Network;
    private _client: AxiosInstance = axios.create();
    private status_monitor: Map<number, NetworkStatusFunc> = new Map([]);
    private token: string = '';

    static Get(url: string, headers?: any) {
        return (_target: Network, _key: string, descriptor: any) => {
            const func = descriptor.value;
            descriptor.value = async function (params: any, defaultData?: any) {
                const response = await Network.instance
                    .client({ url, method: 'GET', params, headers })
                    .then((res) => (isEmpty(res) || isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, data: defaultData }));
                return func.apply(Network.instance, [params, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }

    static Post(url: string, headers?: any) {
        return (_target: Network, _key: string, descriptor: any) => {
            const func = descriptor.value;
            descriptor.value = async function (data: any, defaultData?: any) {
                const response = await Network.instance.client({ url, method: 'POST', data, headers })
                    .then((res) => (isEmpty(res) || isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, ...defaultData }));
                return func.apply(Network.instance, [data, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }

    static Delete(url: string, headers?: any) {
        return (_target: Network, _key: string, descriptor: any) => {
            const func = descriptor.value;
            descriptor.value = async function (data: any, defaultData?: any) {
                const response = await Network.instance.client({ url, method: 'DELETE', data, headers })
                    .then((res) => (isEmpty(res) || isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, ...defaultData }));
                return func.apply(Network.instance, [data, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }

    constructor(private readonly url?: string) {
        this.initial();
    }

    private initial() {
        this._client = axios.create({ baseURL: this.url });
        this._client.interceptors.request.use((value) => {
            return {
                ...value,
                headers: { ...value.headers, authorization: this.token },
            };
        });
        this._client.interceptors.response.use(
            (res) => {
                const { status, data, headers } = res;
                const func = this.status_monitor.get(status);
                this.token = headers['authorization'];
                if (!isFunc(func)) return data;
                return func(data);
            },
            () => {
                return { code: -1, data: null, message: '网络异常' };
            },
        );
        if (!Network.instance) Network.instance = this;
    }

    protected status<R = any>(status: number, func: NetworkStatusFunc<R>) {
        this.status_monitor.set(status, func);
    }

    get client() {
        return this._client;
    }
}
