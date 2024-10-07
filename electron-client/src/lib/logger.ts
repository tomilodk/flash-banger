import { storage } from "./storage";

export function log(message: string) {
    console.log(message);
    const logs = storage.getItem("logs") || "[]";
    const logsArray = JSON.parse(logs);
    logsArray.push(message);
    storage.setItem("logs", JSON.stringify(logsArray));
}