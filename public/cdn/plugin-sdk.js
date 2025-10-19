console.log("SDK loaded inside the plugin from the host public folder");

const SDK = {
    send: (type, payload) => {
        parent.postMessage({ type, message: payload }, "*");
    },
    getPluginApi: (name) => {
        return {};
    },
}

