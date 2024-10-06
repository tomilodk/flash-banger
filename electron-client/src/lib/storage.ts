import fs from "fs";
import path from "path";

const storagePath = path.join(__dirname, "storage");

export const storage = {
    getItem: (key: string) => {
        try {
            return fs.readFileSync(path.join(storagePath, key), "utf8");
        } catch (error) {
            return null;
        }
    },
    setItem: (key: string, value: string) => {
        try {
            if (!fs.existsSync(storagePath)) {
                fs.mkdirSync(storagePath, { recursive: true });
            }

            fs.writeFileSync(path.join(storagePath, key), value);
        } catch (error) {
            console.error(error);
        }
    },
    deleteItem: (key: string) => {
        try {
            fs.unlinkSync(path.join(storagePath, key));
        } catch (error) {
            console.error(error);
        }
    },
    deleteAll: () => {
        try {
            if (fs.existsSync(storagePath)) {
                fs.rmSync(storagePath, { recursive: true });
            }
        } catch (error) {
            console.error(error);
        }
    }
}