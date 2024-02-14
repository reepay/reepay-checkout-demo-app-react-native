import { Buffer } from "buffer";
import { GLOBALS } from "../Globals";

export let apiKeyInput: string;
export let deepLinkingUrl: string;

interface Payload {
    [key: string]: any;
}

export const Api = {
    setApiKey(key: string): void {
        apiKeyInput = key;
    },
    getApiKey(): string {
        return apiKeyInput ? apiKeyInput : GLOBALS.REEPAY_PRIVATE_API_KEY;
    },

    setDeepLinkingUrl(url: string): void {
        deepLinkingUrl = url;
    },
    getDeepLinkingUrl(): string {
        return deepLinkingUrl;
    },

    /**
     * Convert api key to base64-encoded string
     * @returns string
     */
    ApiKeyBase64(): string {
        const key: string = this.getApiKey();
        return Buffer.from(key, "utf-8").toString("base64");
    },

    /**
     * Returns customers
     * @returns Promise<Customer> e.g. { handle: 'customer-007', ... }
     */
    getCustomers(): Promise<object[]> {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
        };

        return new Promise<object[]>((resolve, reject) => {
            fetch(`${GLOBALS.REEPAY_API}/list/customer?interval=P100Y&size=40`, requestOptions)
                .then(async (response) => {
                    const isJson = response.headers.get("content-type")?.includes("application/json");
                    const data = isJson && (await response.json());

                    resolve(data.content);

                    if (!response.ok) {
                        const error = (data && data.message) || response.status;
                        reject(error);
                    }
                })
                .catch((error) => {
                    console.error("There was an error!", error);
                });
        });
    },

    /**
     * Returns customer
     * @returns Promise<string> e.g. customer-007
     */
    getCustomer(handle: string): Promise<string> {
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
        };

        return new Promise<string>((resolve, reject) => {
            fetch(`${GLOBALS.REEPAY_API}/customer/${handle}`, requestOptions)
                .then(async (response) => {
                    const isJson = response.headers.get("content-type")?.includes("application/json");
                    const data = isJson && (await response.json());

                    resolve(data.handle);

                    if (!response.ok) {
                        const error = (data && data.message) || response.status;
                        reject(error);
                    }
                })
                .catch((error) => {
                    console.error("There was an error!", error);
                });
        });
    },

    /**
     * Create charge session URL and ID for WebView
     * @param customerHandle e.g. customer-007
     * @param orderHandle e.g. order-123
     * @returns Promise<any> Session object e.g. { url: "<session_url>", id:"<session_id>" }
     */
    async getChargeSession(customerHandle: string, orderHandle: string, mobilepay?: boolean, phoneNumber?: string): Promise<any> {
        const payload: Payload = this.getPayload(customerHandle, orderHandle, mobilepay, phoneNumber);

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
            body: JSON.stringify(payload),
        };

        return new Promise<object>((resolve, reject) => {
            fetch(`${GLOBALS.REEPAY_CHECKOUT_API}/session/charge`, requestOptions)
                .then(async (response) => {
                    const isJson = response.headers.get("content-type")?.includes("application/json");
                    const data = isJson && (await response.json());

                    if (!response.ok) {
                        const error = (data && data.message) || response.status;
                        // console.error('Charge session error:', error);
                        reject(data);
                    }

                    resolve({
                        url: data.url,
                        id: data.id,
                        customerHandle: payload.order.customer?.handle ?? payload.order.customer_handle,
                    });
                })
                .catch((error) => {
                    console.error("There was an error!", error);
                });
        });
    },

    getPayload(customerHandle: string, orderHandle: string, mobilepay?: boolean, phoneNumber?: string): object {
        const timestamp: string = new Date().getTime().toString();

        if (!orderHandle) {
            orderHandle = this.generateOrderHandle(timestamp);
        }

        const body: Payload = {
            configuration: "default",
            locale: "en_GB",
            recurring: false,
            recurring_optional: false,
            order: {
                handle: orderHandle,
                amount: 30000,
                currency: "DKK",
            },
            accept_url: `${this.getDeepLinkingUrl()}?accept=true`,
            // "https://sandbox.reepay.com/api/httpstatus/200/accept/" + orderHandle,
            cancel_url: `${this.getDeepLinkingUrl()}?cancel=true`,
            // "https://sandbox.reepay.com/api/httpstatus/200/cancel/" + orderHandle,
            phone: phoneNumber ? phoneNumber : "",
        };

        let generatedCustomerHandle: string = "";
        if (customerHandle) {
            body.order.customer_handle = customerHandle;
        } else {
            generatedCustomerHandle = this.generateCustomerHandle(timestamp);
            body.order.customer = {
                handle: generatedCustomerHandle,
            };
        }

        if (mobilepay) {
            body.payment_methods = ["mobilepay"];
        } else {
            delete body.payment_methods;
        }

        console.log(body);

        return body;
    },

    /**
     * Generate example of Order Handle
     * @returns order handle as "order-reactnative-<timestamp>"
     */
    generateOrderHandle(timestamp: string): string {
        return `order-reactnative-${timestamp}`;
    },

    /**
     * Generate example of Customer Handle
     * @returns customer handle as "customer-reactnative-<timestamp>"
     */
    generateCustomerHandle(timestamp: string): string {
        return `customer-reactnative-${timestamp}`;
    },
};
