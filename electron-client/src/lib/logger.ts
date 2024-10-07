import { storage } from "./storage";

export function log(message: string) {
    console.log(message);
    const logs = storage.getItem("logs") || "[]";
    const logsArray = JSON.parse(logs);
    logsArray.push(message);
    storage.setItem("logs", JSON.stringify(logsArray));
}

interface ILogger {
    log(message: string): void;
    info(message: string): void;
    error(message: string): void;
    warn(message: string): void;
}

export const logger: ILogger = {
    log: (message: string) => log(message),
    info: (message: string) => log(message),
    error: (message: string) => log(message),
    warn: (message: string) => log(message),
};
