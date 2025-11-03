import {MainPage} from "./main/MainPage.jsx";
import {SkillsPage} from "./skills/SkillsPage.jsx";
import {AboutPage} from "./about/AboutPage.jsx";
import {HeroHeader} from "./HeroHeader.jsx";
import {useState} from "react";
import {Menu} from "./Menu.jsx";

export const HeroPage = () => {
    const [sideMenu, setSideMenu] = useState(false)
    const [contactMenu, setContactsMenu] = useState(false)
    const [menu, setMenu] = useState(false)

    const toggleMenu = () => {
        setMenu((prev) => !prev);
    }

    const toggleSideMenu = () => {
        setSideMenu((prev) => !prev);
        toggleMenu();
    }

    const toggleContactsMenu = () => {
        setContactsMenu((prev) => !prev);
        toggleMenu();
    }

    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <HeroHeader toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>
            {sideMenu && (<Menu toggleMenu={toggleSideMenu} sideMenu={sideMenu} contactMenu={contactMenu}/>)}
            {contactMenu && (<Menu toggleMenu={toggleContactsMenu} sideMenu={sideMenu} contactMenu={contactMenu}/>)}

            <MainPage/>

            <SkillsPage menu={menu} sideMenu={sideMenu} contactMenu={contactMenu}
                        toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>

            <AboutPage toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>
        </div>
    )
}