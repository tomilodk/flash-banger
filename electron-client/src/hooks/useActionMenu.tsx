import { createContext, useContext, useEffect, useState } from 'react';

type ActionMenuContextType = {
    visible: boolean;
    setVisible: (visible: boolean) => void | undefined;
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

    useEffect(() => {
        window.electronAPI.onToggleActionMenu(() => {
            setVisible(!visible);
        });
    }, []);

    useEffect(() => {
        window.electronAPI.clickable(visible);
        console.log('clickable event listener in renderer', visible);
    }, [visible]);

    return (
        <ActionMenuContext.Provider value={{ visible, setVisible }}>
            {children}
        </ActionMenuContext.Provider>
    );
};