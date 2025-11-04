import {Menu} from "../Menu.jsx";
import personalImage from "../../assets/personal.jpg";
import testImage from "../../assets/test.jpg";
import fashionImage from "../../assets/fashion.jpg";
import {useMenuController} from "../../useMenuController.js";
import Header from "../../components/Header.jsx";

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
            <Header openSideMenu={openSideMenu} openContactsMenu={openContactsMenu}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            <div className={'lg:grid lg:grid-cols-3 lg:h-[calc(100vh-4rem)]'}>
                {containers.map((container, index) => (
                    <div key={index} className={`max-lg:w-full max-lg:h-[50vh] bg-cover ${container.className}`}
                         style={{backgroundImage: `url(${container.image})`}}
                    ></div>
                ))}
            </div>
        </div>
    )
}