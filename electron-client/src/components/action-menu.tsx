import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card';
import { useActionMenu } from '../hooks/useActionMenu';

const ActionMenu: React.FC = () => {
    const { visible } = useActionMenu();

    return (
        visible && (
            <Card id='action-menu' className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50'>
                <CardHeader>
                    <CardTitle>Flash</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Click to flash</p>
                </CardContent>
            </Card>
        )
    );
}

export default ActionMenu;

