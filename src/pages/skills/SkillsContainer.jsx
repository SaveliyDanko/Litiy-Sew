import {SkillsHeader} from "./SkillsHeader.jsx";
import {SkillContainer} from "./SkillContainer.jsx";

export const SkillsContainer = ({
                                    menu, toggleSideMenu, toggleContactsMenu
                                }) => {
    return (
        <div className={`relative w-full h-[50%]
                         lg:h-[100%] lg:flex`}>
            <SkillsHeader toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>

            <SkillContainer image={'model.jpg'} className={'bg-position-[0%_15%]'} menu={menu} to={'/model'}>
                <div className={'w-full absolute bottom-0 mb-10'}>МОДЕЛЬ</div>
            </SkillContainer>

            <SkillContainer image={'design.jpg'} className={'bg-position-[40%_0%] text-white'} menu={menu} to={'/design'}>
                <div className={'w-full absolute bottom-0 mb-10'}>ДИЗАЙНЕР</div>
            </SkillContainer>
        </div>
    )
}