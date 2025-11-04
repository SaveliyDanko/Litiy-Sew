import {MainPage} from "./main/MainPage.jsx";
import {SkillsPage} from "./skills/SkillsPage.jsx";
import {AboutPage} from "./about/AboutPage.jsx";
import {HeroHeader} from "./HeroHeader.jsx";
import {Menu} from "./Menu.jsx";
import {useMenuController} from "../useMenuController.js";

export const HeroPage = () => {
    const {
        sideMenu,
        contactMenu,
        openSideMenu,
        openContactsMenu,
        closeAll,
        activeMenu
    } = useMenuController();

    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <HeroHeader toggleSideMenu={openSideMenu} toggleContactsMenu={openContactsMenu}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            <MainPage/>

            <SkillsPage activeMenu={activeMenu}
                        sideMenu={sideMenu}
                        contactMenu={contactMenu}
                        toggleSideMenu={openSideMenu}
                        toggleContactsMenu={openContactsMenu}/>

            <AboutPage toggleSideMenu={openSideMenu}
                       toggleContactsMenu={openContactsMenu}/>
        </div>
    )
}