import React from 'react';
import { Card } from '../shadcn/card';
import { useActionMenu } from '../hooks/useActionMenu';
import { ACTIONS } from './action-menu-actions';

const ActionMenu: React.FC = () => {
    const { visible, action } = useActionMenu();

    return (
        visible && (
            <Card id='action-menu' className='w-[350px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-3'>
                {React.createElement(ACTIONS[action])}
            </Card>
        )
    );
}

export default ActionMenu;

