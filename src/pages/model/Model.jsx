import {HeroHeader} from "../HeroHeader.jsx";
import {useState} from "react";
import {Menu} from "../Menu.jsx";
import personalImage from "../../assets/personal.jpg";
import testImage from "../../assets/test.jpg";
import fashionImage from "../../assets/fashion.jpg";

export default function Model() {
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

                <div className={`w-full h-[50vh] bg-cover bg-position-[0%_100%]`}
                     style={{backgroundImage: `url(${testImage})`}}
                ></div>

                <div className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${fashionImage})`}}
                ></div>
            </div>
        </div>
    )
}