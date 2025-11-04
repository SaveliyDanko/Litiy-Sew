import {NavLink} from "react-router";
import SvgMenu from "./SvgMenu.jsx";

export default function Header({openSideMenu, openContactsMenu, variant}) {
    const isHero = variant === 'hero';
    const isSkillsHeader = variant === 'skills';
    const isAboutHeader = variant === 'about';

    return (
        <div className={`w-full flex justify-between h-12 top-0 left-0 z-10
                         lg:h-16
                         ${isHero ?  'lg:hidden fixed bg-white' : ''}
                         ${isSkillsHeader ? 'absolute text-white max-lg:hidden' : ''}
                         ${isAboutHeader ? 'absolute text-black max-lg:hidden' : ''}`}>

            <div className={`flex flex-col justify-center ml-2 text-xl z-10 cursor-pointer font-bacasime
                             lg:ml-4 lg:text-4xl`}
                 onClick={openContactsMenu}>
                <span>contacts</span>
            </div>

            <NavLink to={'/'}
                     className={`flex flex-col justify-center text-xl translate-x-[-10px] z-10 cursor-pointer font-bacasime
                                 lg:text-4xl lg:translate-x-[-35px]`}>
                <span>LITIY</span>
            </NavLink>

            <SvgMenu className={`w-10 h-10 mt-1.5 mr-1 cursor-pointer
                                 lg:w-16 lg:h-16 lg:mt-0
                                 ${isSkillsHeader ? 'fill-white' : ''}
                                 ${isAboutHeader ? 'fill-black' : ''}`}
                     onClick={openSideMenu}/>
        </div>
    )
}