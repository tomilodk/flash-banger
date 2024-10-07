import React, { useEffect, useState } from 'react';
import './flasher.scss';


const Flasher: React.FC = () => {

    const [flash, setFlash] = useState(false);
    const [flashText, setFlashText] = useState('');
    const [from, setFrom] = useState('');

    useEffect(() => {
        // Listen for 'flash' event from the main process
        window.electronAPI.onFlash((event, data) => {
            setFlash(true);  // Show the flash
            setFlashText(data.text);
            setFrom(data.from);
            setTimeout(() => {
                setFlash(false);  // Hide the flash after 1 second
            }, 1000);
        });
    }, []);
    return (
        <div id="flashOverlay" className={flash ? 'show' : ''}>
            <p id="flashFrom">{from}</p>
            <p id="flashText">{flashText}</p>
        </div>
    );
}

export default Flasher;