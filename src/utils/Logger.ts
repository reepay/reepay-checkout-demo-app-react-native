import { logger } from "react-native-logs";

var Logger = null;

export const getLogger = () => {
    if (Logger) {
        return Logger;
    }
    Logger = logger.createLogger({
        transportOptions: {
            colors: {
                info: "greenBright",
                warn: "yellowBright",
                error: "redBright",
                debug: "cyanBright",
            },
        },
    });
    return Logger;
};
