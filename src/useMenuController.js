import { useState, useCallback } from "react";

export function useMenuController() {
    const [sideMenu, setSideMenu] = useState(false);
    const [contactMenu, setContactMenu] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);

    const openSideMenu = useCallback(() => {
        setActiveMenu('side')
        setSideMenu(true);
        setContactMenu(false);
    }, []);

    const openContactsMenu = useCallback(() => {
        setActiveMenu('contacts');
        setContactMenu(true);
        setSideMenu(false);
    }, []);

    const closeAll = useCallback(() => {
        setActiveMenu(null)
        setSideMenu(false);
        setContactMenu(false);
    }, []);

    return {
        // состояния
        sideMenu,
        contactMenu,
        activeMenu,

        // действия
        openSideMenu,
        openContactsMenu,
        closeAll,
    };
}
