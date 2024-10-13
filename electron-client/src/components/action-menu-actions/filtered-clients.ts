import { LocalStorageKeys } from "../../types/local-storage-keys.enum";
import { useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";

export const useFilteredClients = (clients: Client[], yourName: string, searchTerm: string) => {
    const [lastFlashFrom] = useLocalStorage(LocalStorageKeys.LAST_FLASH_FROM, "");

    return useMemo(() => {
        return clients?.filter(client => client.name !== yourName)
            .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => a.name === lastFlashFrom ? -1 : b.name === lastFlashFrom ? 1 : 0) || []
    }, [clients, yourName, searchTerm, lastFlashFrom]);
}