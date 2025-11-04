import {HeroHeader} from "../HeroHeader.jsx";
import {Menu} from "../Menu.jsx";
import personalImage from "../../assets/personal.jpg";
import testImage from "../../assets/test.jpg";
import fashionImage from "../../assets/fashion.jpg";
import {useMenuController} from "../../useMenuController.js";

export default function Model() {
    const {
        // sideMenu,
        // contactMenu,
        openSideMenu,
        openContactsMenu,
        closeAll,
        activeMenu
    } = useMenuController();

    const containers = [
        {image: personalImage, className: ''},
        {image: testImage, className: 'bg-position-[0%_100%]'},
        {image: fashionImage, className: ''},
    ]

    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <HeroHeader toggleSideMenu={openSideMenu} toggleContactsMenu={openContactsMenu}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            {containers.map((container, index) => (
                <div key={index} className={`w-full h-[50vh] bg-cover ${container.className}`}
                     style={{backgroundImage: `url(${container.image})`}}
                ></div>
            ))}
        </div>
    )
}