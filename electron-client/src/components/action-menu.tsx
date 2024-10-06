import React from 'react';
import './action-menu.scss';
import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card';

const ActionMenu: React.FC = () => {
    return (
        <Card className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
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