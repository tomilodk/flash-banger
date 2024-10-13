import React, { useEffect, useState } from 'react';
import './flasher.scss';
import { Badge } from '../shadcn/badge';
import { LocalStorageKeys } from '../types/local-storage-keys.enum';
import { useLocalStorage } from 'usehooks-ts';


const Flasher: React.FC = () => {
    const WORDS_PER_MINUTE = 150;
    const MINIMUM_FLASH_DURATION = 2000;
    const MAXIMUM_FLASH_DURATION = 8500;

    const [flash, setFlash] = useState(false);
    const [flashText, setFlashText] = useState('');
    const [from, setFrom] = useState('');

    const [, setLastFlashFrom] = useLocalStorage(LocalStorageKeys.LAST_FLASH_FROM, "");

    useEffect(() => {
        // Listen for 'flash' event from the main process
        window.electronAPI.onFlash((event, data) => {
            console.log("flash", data)
            setFlash(true);  // Show the flash
            setFlashText(data.text);
            setFrom(data.from);

            const wordsPerSecond = WORDS_PER_MINUTE / 60;
            const readingTime = data.text.trim().split(" ").length / wordsPerSecond * 1000;

            setTimeout(() => {
                setFlash(false);  // Hide the flash after 1 second
            }, Math.min(Math.max(readingTime, MINIMUM_FLASH_DURATION), MAXIMUM_FLASH_DURATION));
        });
    }, []);

    useEffect(() => {
        if (from.trim()) {
            setLastFlashFrom(from);
        }
    }, [from])

    return (
        <div id="flashOverlay" className={flash ? 'show' : ''}>
            {from && <Badge variant="default" className="absolute top-10 left-10">{from}</Badge>}
            <p id="flashText">{flashText}</p>
        </div>
    );
}

export default Flasher;