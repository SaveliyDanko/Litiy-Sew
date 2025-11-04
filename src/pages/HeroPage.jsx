import {MainPage} from "./main/MainPage.jsx";
import {SkillsPage} from "./skills/SkillsPage.jsx";
import {AboutPage} from "./about/AboutPage.jsx";
import {Menu} from "./Menu.jsx";
import {useMenuController} from "../useMenuController.js";
import Header from "../components/Header.jsx";

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

            <Header openSideMenu={openSideMenu} openContactsMenu={openContactsMenu} variant={'hero'}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            <MainPage/>

            <SkillsPage activeMenu={activeMenu}
                        sideMenu={sideMenu}
                        contactMenu={contactMenu}
                        openSideMenu={openSideMenu}
                        openContactsMenu={openContactsMenu}
                        closeAll={closeAll}
            />

            <AboutPage openSideMenu={openSideMenu}
                       openContactsMenu={openContactsMenu}
                       closeAll={closeAll}
            />
        </div>
    )
}