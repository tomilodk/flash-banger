import { storage } from "../../lib/storage";
import { toggleActionMenu } from "./toggleActionMenu";

export function deleteStorage() {
    storage.deleteAll();
    toggleActionMenu("flash");
}