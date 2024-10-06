import React, { useEffect, useRef, useState } from 'react';
import './flasher.css';
declare global {
    interface Window {
        electronAPI: {
            onFlash: (callback: (event: any, data: any) => void) => void;
        }
    }
}

const Flasher: React.FC = () => {

    const [flash, setFlash] = useState(false);
    const [flashText, setFlashText] = useState('');

    useEffect(() => {
        // Listen for 'flash' event from the main process
        window.electronAPI.onFlash((event, data) => {
            setFlash(true);  // Show the flash
            setFlashText(data.text);
            setTimeout(() => {
                setFlash(false);  // Hide the flash after 1 second
            }, 1000);
        });
    }, []);
    return (
        <div id="flashOverlay" className={flash ? 'show' : ''}>
            <p id="flashText">{flashText}</p>
        </div>
    );
}

export default Flasher;