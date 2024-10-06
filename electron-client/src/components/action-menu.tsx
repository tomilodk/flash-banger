import React from 'react';
import './action-menu.scss';
import { Card, CardHeader, CardTitle } from '../shadcn/card';

const ActionMenu: React.FC = () => {
    return (
        <Card className='w-[350px]'>
            <CardHeader>
                <CardTitle>Flash</CardTitle>
            </CardHeader>
        </Card>
    );
}

export default ActionMenu;