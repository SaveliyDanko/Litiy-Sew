import SvgMenu from "../components/SvgMenu.jsx";
import {NavLink} from "react-router";

export const HeroHeader = ({toggleSideMenu, toggleContactsMenu}) => {
    return (
        <div className={`w-full bg-white flex justify-between h-12 fixed top-0 left-0 z-10
                         lg:hidden`}>

            <div className={'flex flex-col justify-center ml-1 text-xl z-15 cursor-pointer'}
                 onClick={toggleContactsMenu}>
                <span>contact</span>
            </div>

            <NavLink to={'/'} className={'flex flex-col justify-center text-xl translate-x-[-10px] z-15'}>
                <span>LITIY</span>
            </NavLink>

            <SvgMenu className={'w-10 h-10 mt-1.5'}
                     onClick={toggleSideMenu}/>

        </div>
    )
}