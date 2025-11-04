import {Menu} from "../Menu.jsx";
import personalImage from "../../assets/personal.jpg";
import setImage from "../../assets/set.jpg";
import fashionImage from "../../assets/fashion.jpg";
import outwearImage from "../../assets/outwear.jpg";
import lingerieImage from "../../assets/lingerie.jpg";
import blouseImage from "../../assets/blouse.jpg";
import {useMenuController} from "../../useMenuController.js";
import Header from "../../components/Header.jsx";

export default function DesignPage() {
    const {
        // sideMenu,
        // contactMenu,
        openSideMenu,
        openContactsMenu,
        closeAll,
        activeMenu,
    } = useMenuController();

    const images = [
        personalImage,
        fashionImage,
        setImage,
        outwearImage,
        blouseImage,
        lingerieImage,
    ]


    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <Header
                toggleSideMenu={openSideMenu}
                toggleContactsMenu={openContactsMenu}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            {images.map((image, index) => (
                <div key={index} className={`w-full h-[50vh] bg-cover`}
                     style={{backgroundImage: `url(${image})`}}
                ></div>
            ))}
        </div>
    )
}