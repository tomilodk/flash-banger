import React, { useEffect, useState } from 'react';
import { Card } from '../shadcn/card';
import { useActionMenu } from '../hooks/useActionMenu';
import { ACTIONS } from './action-menu-actions';

const ActionMenu: React.FC = () => {
    const { visible, action } = useActionMenu();

    const [version, setVersion] = useState<string | null>(null);

    useEffect(() => {
        window.electronAPI.getVersion().then(setVersion);
    }, []);

    return (
        visible && (
            <Card id='action-menu' className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-3'>
                {React.createElement(ACTIONS[action])}

                <div className="flex justify-center items-center">
                    <span className="mt-3 text-muted-foreground text-xs left-0 pb-0 w-full text-center">ALT + SHIFT + .</span>
                    {version && <span className="mt-3 text-muted-foreground text-xs left-0 pb-0 w-full text-center">v{version}</span>}
                </div>
            </Card>
        )
    );
}

export default ActionMenu;

