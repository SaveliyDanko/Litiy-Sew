import {SkillContainer} from "./SkillContainer.jsx";
import modelImage from "../../assets/model.jpg";
import designImage from "../../assets/design.jpg";
import {Fragment} from "react";
import Header from "../../components/Header.jsx";

export const SkillsContainer = ({activeMenu, openSideMenu, openContactsMenu, closeAll}) => {

    const skills = [
        {image: modelImage, className: 'bg-position-[0%_15%]', to: '/model', title: 'МОДЕЛЬ'},
        {image: designImage, className: 'bg-position-[40%_0%] text-white', to: '/design', title: 'ДИЗАЙНЕР'},
    ]

    return (
        <div className={`relative w-full h-[50%]
                         lg:h-[100%] lg:flex`}>

            <Header openSideMenu={openSideMenu}
                    openContactsMenu={openContactsMenu}
                    closeAll={closeAll}
                    variant={'skills'}
            />

            {skills.map((skill, index) => (
                <Fragment key={index}>
                    <SkillContainer image={skill.image} className={skill.className} activeMenu={activeMenu} to={skill.to}>
                        <div className={'w-full absolute bottom-0 mb-10'}>{skill.title}</div>
                    </SkillContainer>
                </Fragment>
            ))}

        </div>
    )
}