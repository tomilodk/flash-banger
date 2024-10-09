import React, { useEffect, useState } from 'react';
import { Card } from '../shadcn/card';
import { useActionMenu } from '../hooks/useActionMenu';
import { ACTIONS } from './action-menu-actions';
import Shortcut from './shortcut';
import Version from './version';

const ActionMenu: React.FC = () => {
    const { visible, action } = useActionMenu();

    const [version, setVersion] = useState<string | null>(null);
    const [platform, setPlatform] = useState<Platform | null>(null);

    useEffect(() => {
        window.electronAPI.getVersion().then(setVersion);
        window.electronAPI.getPlatform().then(setPlatform);
    }, []);

    useEffect(() => {
        if (visible) window.electronAPI.pingWebSocket();
    }, [visible]);

    return (
        visible && (
            <Card id='action-menu' className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-3'>
                {React.createElement(ACTIONS[action])}

                <div className="flex justify-center items-center mt-2">
                    <Shortcut platform={platform} />
                    {version && <Version version={version} />}
                </div>
            </Card>
        )
    );
}

export default ActionMenu;

