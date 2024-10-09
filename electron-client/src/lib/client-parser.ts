/*
    Parse the clients string into an array of Client objects
    The clients string is a comma-separated list of client objects
    Each client object is a string in the format "name|version|..."
*/

export const parseClients = (clients: string): Client[] => {
    const client = clients.split(",").filter(x => x).map(client => {
        const [name, version, streak, timeSinceLastMessageSeconds] = client.split("|");

        return {
            name,
            version,
            streak: parseInt(streak),
            timeSinceLastMessageInSeconds: parseInt(timeSinceLastMessageSeconds)
        };
    });

    return client;
}

