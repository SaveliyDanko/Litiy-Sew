import SvgMenu from "../../components/SvgMenu.jsx";
import {NavLink} from "react-router";

export const SkillsHeader = ({toggleSideMenu, toggleContactsMenu}) => {


    return (
        <div className={'absolute w-full h-16 flex justify-between text-white max-lg:hidden'}>
            <div className={'flex flex-col justify-center ml-4 text-4xl z-15 cursor-pointer'} onClick={toggleContactsMenu}>contact</div>
            <NavLink to={'/'} className={'flex flex-col justify-center text-4xl z-15 translate-x-[-27px]'}>LITIY</NavLink>
            <SvgMenu className={'w-16 h-16 fill-white mr-4 cursor-pointer'} onClick={toggleSideMenu}/>
        </div>
    )
}