import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card';

const ActionMenu: React.FC = () => {

    useEffect(() => {
        window.electronAPI.clickable(true);
        console.log('clickable event listener in renderer');
    }, []);

    return (
        <Card id='action-menu' className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
            <CardHeader>
                <CardTitle>Flash</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Click to flash</p>
            </CardContent>
        </Card>
    );
}

export default ActionMenu;