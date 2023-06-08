import { Buffer } from "buffer";
import { GLOBALS } from "../Globals";

export let apiKeyInput: string;
export let deepLinkingUrl: string;

export const Api = {

    setApiKey(key: string): void { apiKeyInput = key },
    getApiKey(): string { return apiKeyInput ? apiKeyInput : GLOBALS.REEPAY_PRIVATE_API_KEY; },

    setDeepLinkingUrl(url: string): void { deepLinkingUrl = url },
    getDeepLinkingUrl(): string { return deepLinkingUrl; },

    /**
     * Convert api key to base64-encoded string
     * @returns string
     */
    ApiKeyBase64(): string {
        const key: string = this.getApiKey();
        return Buffer.from(key, "utf-8").toString("base64");
    },

    /**
       * Returns an auto-generated customer handle
       * @returns Promise<string> e.g. customer-007
       */
    // getCustomerHandle(): Promise<string> {
    //     const requestOptions = {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //             Authorization: this.ApiKeyBase64(),
    //         },
    //         body: JSON.stringify({
    //             generate_handle: false,
    //             handle: this.generateCustomerHandle(),
    //         }),
    //     };

    //     return new Promise<string>((resolve, reject) => {
    //         fetch(GLOBALS.REEPAY_API_CUSTOMER_URL, requestOptions)
    //             .then(async (response) => {
    //                 const isJson = response.headers
    //                     .get("content-type")
    //                     ?.includes("application/json");
    //                 const data = isJson && (await response.json());

    //                 resolve(data.handle);

    //                 if (!response.ok) {
    //                     const error = (data && data.message) || response.status;
    //                     reject(error);
    //                 }
    //             })
    //             .catch((error) => {
    //                 console.error("There was an error!", error);
    //             });
    //     });
    // },

    /**
   * Create charge session URL and ID for WebView
   * @param customerHandle e.g. customer-007
   * @param orderHandle e.g. order-123
   * @returns Promise<any> Session object e.g. { url: "<session_url>", id:"<session_id>" }
   */
    async getChargeSession(
        customerHandle: string,
        orderHandle: string,
        mobilepay?: boolean,
        phoneNumber?: string,
    ): Promise<any> {

        if (!customerHandle) { customerHandle = this.generateCustomerHandle(); }
        if (!orderHandle) { orderHandle = this.generateOrderHandle(); }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
            body: JSON.stringify({
                configuration: "default",
                locale: "en_GB",
                recurring: false,
                recurring_optional: false,
                order: {
                    handle: "order_test_1686217531940",
                    amount: 20000,
                    currency: "DKK",
                    customer_handle: "cust-0068"
                },
                accept_url: this.getDeepLinkingUrl() + "?accept=true",
                // "https://sandbox.reepay.com/api/httpstatus/200/accept/" + orderHandle,
                cancel_url: this.getDeepLinkingUrl() + "?cancel=true",
                // "https://sandbox.reepay.com/api/httpstatus/200/cancel/" + orderHandle,
                payment_methods: [
                    mobilepay ? "mobilepay" : "card"
                ],
                phone: phoneNumber ? phoneNumber : "",
            }),
        };

        return new Promise<object>((resolve, reject) => {
            fetch(GLOBALS.REEPAY_CHECKOUT_API_SESSION_URL, requestOptions)
                .then(async (response) => {
                    const isJson = response.headers
                        .get("content-type")
                        ?.includes("application/json");
                    const data = isJson && (await response.json());

                    if (!response.ok) {
                        const error = (data && data.message) || response.status;
                        // console.error('Charge session error:', error);
                        reject(data);
                    }

                    resolve({
                        url: data.url,
                        id: data.id,
                    });
                })
                .catch((error) => {
                    console.error("There was an error!", error);
                });
        });
    },

    /**
     * Generate example of Order Handle
     * @returns order handle as "order-reactnative-<timestamp>"
     */
    generateOrderHandle(): string {
        const currentTime = new Date().getTime().toString();
        return `order-reactnative-${currentTime}`;
    },

    /**
     * Generate example of Customer Handle
     * @returns customer handle as "customer-reactnative-<timestamp>"
     */
    generateCustomerHandle(): string {
        const currentTime = new Date().getTime().toString();
        return `customer-reactnative-${currentTime}`;
    },
}

