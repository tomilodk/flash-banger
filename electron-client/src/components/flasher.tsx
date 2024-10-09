import React, { useEffect, useState } from 'react';
import './flasher.scss';
import { Badge } from '../shadcn/badge';


const Flasher: React.FC = () => {
    const WORDS_PER_MINUTE = 150;
    const MINIMUM_FLASH_DURATION = 1000;

    const [flash, setFlash] = useState(false);
    const [flashText, setFlashText] = useState('');
    const [from, setFrom] = useState('');

    function flashEnd() {
        setFlash(false);
    }

    useEffect(() => {
        // Listen for 'flash' event from the main process
        window.electronAPI.onFlash((event, data) => {

            setFlash(true);  // Show the flash
            setFlashText(data.text);
            setFrom(data.from);

            const wordsPerSecond = WORDS_PER_MINUTE / 60;
            const readingTime = data.text.split(" ").length / wordsPerSecond * 1000;

            setTimeout(() => {
                flashEnd();
                window.electronAPI.flashEnd();
            }, Math.max(readingTime, MINIMUM_FLASH_DURATION));
        });

        window.electronAPI.onFlashForceEnd(flashEnd);
    }, []);
    return (
        <div id="flashOverlay" className={flash ? 'show' : ''}>
            {from && <Badge variant="default" className="absolute top-10 left-10">{from}</Badge>}
            <p id="flashText">{flashText}</p>
        </div>
    );
}

export default Flasher;