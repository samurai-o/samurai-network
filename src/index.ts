import axios, { AxiosInstance } from 'axios';
import { isEmpty, isFunc } from '@frade-sam/samtools';

export type NetworkStatusFunc<D = any> = (data: D) => D;

export class Network {
    private static client: Network;
    private static axios: AxiosInstance;

    static Get(url: string) {
        return (target: Network, key: string, descriptor: any) => {
            const func = descriptor.value;
            descriptor.value = async function (params: any) {
                const res = await Network.client.send({ url, method: 'GET', params });
                return func.apply(target, [params, res]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }

    static Post(url: string) {
        return (target: Network, key: string, descriptor: any) => {
            const func = descriptor.value;
            descriptor.value = async function (data: any, _res?: any) {
                const res = await Network.client
                    .send({ url, method: 'POST', data })
                    .then((res) => {
                        if (isEmpty(res) || isEmpty(res.data))
                            return { ...res, data: _res };
                        return res;
                    })
                    .catch(() => ({ data: _res }));
                return func.apply(target, [data, res]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }

    constructor(private readonly url?: string) {
        this.initial();
    }
    private status_monitor: Map<number, NetworkStatusFunc> = new Map([]);
    private token: string = '';
    private initial() {
        Network.axios = axios.create({ baseURL: this.url });
        Network.axios.interceptors.request.use((value) => {
            return {
                ...value,
                headers: { ...value.headers, authorization: this.token },
            };
        });
        Network.axios.interceptors.response.use(
            (res) => {
                const { status, data, headers } = res;
                const func = this.status_monitor.get(status);
                this.token = headers['authorization'];
                if (!isFunc(func)) return data;
                return func(data);
            },
            () => {
                return { code: 1, data: null, message: '' };
            },
        );
        if (!Network.client) Network.client = this;
    }

    protected status<R = any>(status: number, func: NetworkStatusFunc<R>) {
        this.status_monitor.set(status, func);
    }

    get send() {
        return Network.axios;
    }
}
