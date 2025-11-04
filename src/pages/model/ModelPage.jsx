import {Menu} from "../Menu.jsx";
import personalImage from "../../assets/personal.jpg";
import testImage from "../../assets/test.jpg";
import fashionImage from "../../assets/fashion.jpg";
import {useMenuController} from "../../useMenuController.js";
import Header from "../../components/Header.jsx";

export default function ModelPage() {
    const {
        // sideMenu,
        // contactMenu,
        openSideMenu,
        openContactsMenu,
        closeAll,
        activeMenu
    } = useMenuController();

    const containers = [
        {image: personalImage, text: 'ЛИЧНЫЕ', className: 'bg-position-[0%_30%]'},
        {image: testImage, text: 'ТЕСТЫ', className: 'bg-position-[0%_100%]'},
        {image: fashionImage, text: 'ФЕШН', className: ''},
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
                    <div key={index} className={`max-lg:w-full max-lg:h-[50vh] 
                                                 relative justify-end bg-cover ${container.className}`}
                         style={{backgroundImage: `url(${container.image})`}}
                    >
                        <div className={'absolute bottom-0 mb-10 text-white w-full text-center font-buran text-[90px]'}>{container.text}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}