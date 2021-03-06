"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const axios_1 = __importDefault(require("axios"));
const samtools_1 = require("@frade-sam/samtools");
class Network {
    constructor(options) {
        this.options = options;
        this._client = axios_1.default.create();
        this.status_monitor = new Map([]);
        this.token = '';
        this.initial();
    }
    static Get(url, headers) {
        return (_target, _key, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (params, defaultData) {
                const response = await Network.instance
                    .client({ url: Network.instance.path(url), method: 'GET', params, headers })
                    .then((res) => (samtools_1.isEmpty(res) || samtools_1.isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, data: defaultData }));
                return func.apply(Network.instance, [params, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }
    static Post(url, headers) {
        return (_target, _key, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (data, defaultData) {
                const response = await Network.instance.client({ url: Network.instance.path(url), method: 'POST', data, headers })
                    .then((res) => (samtools_1.isEmpty(res) || samtools_1.isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, ...defaultData }));
                return func.apply(Network.instance, [data, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }
    static Delete(url, headers) {
        return (_target, _key, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (data, defaultData) {
                const response = await Network.instance.client({ url: Network.instance.path(url), method: 'DELETE', data, headers })
                    .then((res) => (samtools_1.isEmpty(res) || samtools_1.isEmpty(res.data)) ? ({ ...res, data: defaultData }) : res)
                    .catch((error) => ({ ...error, ...defaultData }));
                return func.apply(Network.instance, [data, response]);
            };
            descriptor.writable = false;
            return descriptor;
        };
    }
    getUrl() {
        if (!this.options)
            return undefined;
        return this.options.url;
    }
    initial() {
        this._client = axios_1.default.create({ baseURL: this.getUrl() });
        this._client.interceptors.request.use((value) => {
            return {
                ...value,
                headers: { ...value.headers, authorization: this.token },
            };
        });
        this._client.interceptors.response.use((res) => {
            const { status, data, headers } = res;
            const func = this.status_monitor.get(status);
            this.token = headers['authorization'];
            if (!samtools_1.isFunc(func))
                return data;
            return func(data);
        }, () => {
            return { code: -1, data: null, message: '????????????' };
        });
        if (!Network.instance)
            Network.instance = this;
    }
    status(status, func) {
        this.status_monitor.set(status, func);
    }
    get client() {
        return this._client;
    }
    get isMock() {
        if (!this.options)
            return false;
        return this.options.isMock;
    }
    path(url) {
        if (!url.startsWith('/')) {
            if (!!this.isMock)
                return `/mock/${url}`;
            return `/${url}`;
        }
        if (!!this.isMock)
            return `/mock${url}`;
        return url;
    }
}
exports.Network = Network;
