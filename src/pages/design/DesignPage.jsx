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

    const containers = [
        {image: personalImage, title: "ВСЕ РАБОТЫ", className: ''},
        {image: fashionImage, title: "ПЛАТЬЯ", className: ''},
        {image: setImage, title: "КОМПЛЕКТЫ", className: ''},
        {image: outwearImage, title: "ВЕРХНЯЯ ОДЕЖДА", className: 'bg-position-[60%_40%]'},
        {image: blouseImage, title: "БЛУЗЫ", className: 'bg-position-[60%_40%]'},
        {image: lingerieImage, title: "НИЖНЕЕ БЕЛЬЕ", className: ''},
    ]


    return (
        <div className={`lg:h-screen lg:overflow-y-scroll lg:snap-y lg:snap-mandatory
                         scroll-smooth relative`}>
            <Header
                openSideMenu={openSideMenu}
                openContactsMenu={openContactsMenu}/>

            {activeMenu &&
                (<Menu sideMenu={activeMenu === 'side'}
                       contactMenu={activeMenu === 'contacts'}
                       closeAll={closeAll}
                />)}

            {containers.map((container, index) => (
                <div key={index} className={`w-full h-[50vh] bg-cover relative
                                             ${container.className}`}
                     style={{backgroundImage: `url(${container.image})`}}
                >
                    <div className={`absolute bottom-0 mb-10 text-white w-full text-center font-buran text-[60px]`}>
                        {container.title}
                    </div>
                </div>
            ))}
        </div>
    )
}