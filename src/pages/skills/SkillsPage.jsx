import {SkillsContainer} from "./SkillsContainer.jsx";

export const SkillsPage = ({activeMenu, sideMenu, contactMenu,
                            openSideMenu, openContactsMenu, closeAll}) => {
    return (
        <div className={`w-full  h-auto 
                         lg:snap-start lg:h-screen`}>

            <SkillsContainer activeMenu={activeMenu}
                             sideMenu={sideMenu}
                             contactMenu={contactMenu}
                             openSideMenu={openSideMenu}
                             openContactsMenu={openContactsMenu}
                             closeAll={closeAll}
            />
        </div>
    )
}