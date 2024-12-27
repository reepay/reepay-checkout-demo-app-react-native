import { logger } from "react-native-logs";

type LoggerType = ReturnType<typeof logger.createLogger>;

var Logger: LoggerType | null = null;

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
    } as any);
    return Logger;
};
