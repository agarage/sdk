
export type PluginApi = {
    name: string;
}

export type PluginSdk = {
    send: (type: string, payload: any) => void;
    getPluginApi: <T extends PluginApi>(name: string) => T;
    defineHandler: (handler: (type: string, payload: any) => void) => void;
}
