import { GLOBALS } from "../Globals";
import { Buffer } from "buffer";

export let apiKeyInput: string;

export const Api = {

    setApiKey(key: string): void { apiKeyInput = key },
    getApiKey(): string { return apiKeyInput },

    /**
     * Convert api key to base64-encoded string
     * @returns string
     */
    ApiKeyBase64(): string {
        const key: string = apiKeyInput ? apiKeyInput : GLOBALS.REEPAY_PRIVATE_API_KEY;
        return Buffer.from(key, "utf-8").toString("base64");
    },

    /**
       * Returns an auto-generated customer handle
       * @param privateKey Your Reepay private API key
       * @returns Promise<string> e.g. customer-007
       */
    getCustomerHandle(): Promise<string> {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
            body: JSON.stringify({ generate_handle: true }),
        };

        return new Promise<string>((resolve, reject) => {
            fetch(GLOBALS.REEPAY_API_CUSTOMER_URL, requestOptions)
                .then(async (response) => {
                    const isJson = response.headers
                        .get("content-type")
                        ?.includes("application/json");
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
    getChargeSession(
        customerHandle: string,
        orderHandle: string
    ): Promise<any> {
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: this.ApiKeyBase64(),
            },
            body: JSON.stringify({
                order: {
                    handle: orderHandle,
                    customer: {
                        handle: customerHandle,
                    },
                    order_lines: [
                        {
                            ordertext: "Example Product",
                            amount: 1000,
                            quantity: 10,
                        },
                        {
                            ordertext: "Another Product",
                            amount: 34999,
                            quantity: 1,
                        },
                    ],
                },
                accept_url:
                    "https://sandbox.reepay.com/api/httpstatus/200/accept/" + orderHandle,
                cancel_url:
                    "https://sandbox.reepay.com/api/httpstatus/200/cancel/" + orderHandle,
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

}

