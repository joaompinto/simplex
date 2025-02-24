export class WebSocketManager extends EventTarget {
    constructor() {
        super();
        this.ws = null;
    }

    async connect() {
        try {
            if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
                // If connecting, wait for it
                if (this.ws.readyState === WebSocket.CONNECTING) {
                    await new Promise((resolve, reject) => {
                        this.ws.onopen = resolve;
                        this.ws.onerror = reject;
                    });
                }
                return this.ws; // Already connected
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = window.location.hostname + (window.location.port ? ':' + window.location.port : '');
            this.ws = new WebSocket(`${protocol}//${host}/ws`);
            
            await this.setupHandlers();
            return this.ws;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async setupHandlers() {
        if (!this.ws) return;

        return new Promise((resolve, reject) => {
            const onOpen = () => {
                this.ws.removeEventListener('open', onOpen);
                this.ws.removeEventListener('error', onError);
                this.dispatchEvent(new CustomEvent('connection-status', {
                    detail: { connected: true }
                }));
                resolve();
            };

            const onError = (error) => {
                this.ws.removeEventListener('open', onOpen);
                this.ws.removeEventListener('error', onError);
                this.handleError(error);
                reject(error);
            };

            this.ws.addEventListener('open', onOpen);
            this.ws.addEventListener('error', onError);

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.dispatchEvent(new CustomEvent('message', { detail: data }));
                } catch (error) {
                    this.handleError(error);
                }
            };

            this.ws.onclose = () => {
                this.dispatchEvent(new CustomEvent('connection-status', {
                    detail: { connected: false }
                }));
            };
        });
    }

    handleError(error) {
        this.dispatchEvent(new CustomEvent('error', {
            detail: { error }
        }));
    }

    async send(type, content, metadata = {}) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket not connected');
        }

        this.ws.send(JSON.stringify({
            type,
            content,
            metadata
        }));
    }

    get connection() {
        return this.ws;
    }

    get isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }
}
