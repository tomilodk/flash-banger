import { ACTIONS } from '../components/action-menu-actions';
import { createContext, useContext, useEffect, useState } from 'react';

type ActionMenuContextType = {
    visible: boolean;
    action: keyof typeof ACTIONS;
}

const ActionMenuContext = createContext<ActionMenuContextType | undefined>(undefined);

export const useActionMenu = () => {
    const context = useContext(ActionMenuContext);

    if (!context) {
        throw new Error('useActionMenu must be used within an ActionMenuProvider');
    }
    return context;
}

export const ActionMenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [visible, setVisible] = useState(false);
    const [action, setAction] = useState<keyof typeof ACTIONS>("flash");

    useEffect(() => {
        window.electronAPI.onToggleActionMenu((action: ActionMenuContextType["action"]) => {
            setVisible(prevVisible => !prevVisible);
            setAction(action);
        });
    }, []);

    useEffect(() => {
        window.electronAPI.clickable(visible);
    }, [visible]);

    return (
        <ActionMenuContext.Provider value={{ visible, action }}>
            {children}
        </ActionMenuContext.Provider>
    );
};