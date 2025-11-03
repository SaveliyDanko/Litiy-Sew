import {HeroHeader} from "../HeroHeader.jsx";
import {Menu} from "../Menu.jsx";
import {useState} from "react";
import personalImage from "../../assets/personal.jpg";
import complectImage from "../../assets/complect.jpg";
import fashionImage from "../../assets/fashion.jpg";
import outwearImage from "../../assets/outwear.jpg";
import lingerieImage from "../../assets/lingerie.jpg";
import blouseImage from "../../assets/blouse.jpg";

export default function DesignPage() {
    const [sideMenu, setSideMenu] = useState(false)
    const [contactMenu, setContactsMenu] = useState(false)
    // const [menu, setMenu] = useState(false)

    // const toggleMenu = () => {
    //     setMenu((prev) => !prev);
    // }

    const toggleSideMenu = () => {
        setSideMenu((prev) => !prev);
        // toggleMenu();
    }

    const toggleContactsMenu = () => {
        setContactsMenu((prev) => !prev);
        // toggleMenu();
    }


    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <HeroHeader toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>
            {sideMenu && (<Menu toggleMenu={toggleSideMenu} sideMenu={sideMenu} contactMenu={contactMenu}/>)}
            {contactMenu && (<Menu toggleMenu={toggleContactsMenu} sideMenu={sideMenu} contactMenu={contactMenu}/>)}

            <div>
                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${personalImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${fashionImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${complectImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${outwearImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${blouseImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${lingerieImage})`}}
                ></div>
            </div>
        </div>
    )
}