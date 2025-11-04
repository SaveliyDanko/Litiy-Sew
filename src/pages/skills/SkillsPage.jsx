import {SkillsContainer} from "./SkillsContainer.jsx";

export const SkillsPage = ({
                               activeMenu, sideMenu, contactMenu,
                                toggleSideMenu, toggleContactsMenu
                           }) => {
    return (
        <div className={`w-full  h-auto 
                         lg:snap-start lg:h-screen`}>
            <SkillsContainer activeMenu={activeMenu} sideMenu={sideMenu} contactMenu={contactMenu}
                             toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>
        </div>
    )
}