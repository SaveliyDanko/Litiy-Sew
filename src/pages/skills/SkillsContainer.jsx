import {SkillsHeader} from "./SkillsHeader.jsx";
import {SkillContainer} from "./SkillContainer.jsx";
import modelImage from "../../assets/model.jpg";
import designImage from "../../assets/design.jpg";
import {Fragment} from "react";

export const SkillsContainer = ({activeMenu, toggleSideMenu, toggleContactsMenu}) => {
    const skills = [
        {image: modelImage, className: 'bg-position-[0%_15%]', to: '/model', title: 'МОДЕЛЬ'},
        {image: designImage, className: 'bg-position-[40%_0%] text-white', to: '/design', title: 'ДИЗАЙНЕР'},
    ]

    return (
        <div className={`relative w-full h-[50%]
                         lg:h-[100%] lg:flex`}>

            <SkillsHeader toggleSideMenu={toggleSideMenu}
                          toggleContactsMenu={toggleContactsMenu}/>

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