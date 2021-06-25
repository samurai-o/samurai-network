"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const axios_1 = __importDefault(require("axios"));
const samtools_1 = require("@frade-sam/samtools");
class Network {
    constructor(url) {
        this.url = url;
        this.status_monitor = new Map([]);
        this.token = '';
        this.initial();
    }
    static Get(url) {
        return (target, key, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (params) {
                const res = await Network.client.send({ url, method: 'GET', params });
                return func.apply(target, [params, res]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }
    static Post(url) {
        return (target, key, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (data, _res) {
                const res = await Network.client
                    .send({ url, method: 'POST', data })
                    .then((res) => {
                    if (samtools_1.isEmpty(res) || samtools_1.isEmpty(res.data))
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
    initial() {
        Network.axios = axios_1.default.create({ baseURL: this.url });
        Network.axios.interceptors.request.use((value) => {
            return {
                ...value,
                headers: { ...value.headers, authorization: this.token },
            };
        });
        Network.axios.interceptors.response.use((res) => {
            const { status, data, headers } = res;
            const func = this.status_monitor.get(status);
            this.token = headers['authorization'];
            if (!samtools_1.isFunc(func))
                return data;
            return func(data);
        }, () => {
            return { code: 1, data: null, message: '' };
        });
        if (!Network.client)
            Network.client = this;
    }
    status(status, func) {
        this.status_monitor.set(status, func);
    }
    get send() {
        return Network.axios;
    }
}
exports.Network = Network;
