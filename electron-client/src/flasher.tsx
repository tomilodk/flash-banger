import React, { useEffect, useRef } from 'react';
import './flasher.css';
declare global {
    interface Window {
        electronAPI: {
            onFlash: (callback: (event: any, data: any) => void) => void;
        }
    }
}

const Flasher: React.FC = () => {

    const flashOverlay = useRef(null);
    const flashText = useRef(null);

    useEffect(() => {
        // Listen for 'flash' event from the main process
        window.electronAPI.onFlash((event, data) => {
            flashOverlay.current.classList.add('show');  // Show the flash
            flashText.current.textContent = data.text;
            setTimeout(() => {
                flashOverlay.current.classList.remove('show');  // Hide the flash after 1 second
            }, 1000);
        });
    }, []);
    return (
        <div id="flashOverlay" ref={flashOverlay}>
            <p id="flashText" ref={flashText}></p>
        </div>
    );
}

export default Flasher;