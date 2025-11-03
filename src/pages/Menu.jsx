import {useCallback, useEffect, useRef, useState} from "react";
import SvgClose from "../components/SvgClose.jsx";
import {useNavigate} from "react-router-dom";

export const Menu = ({toggleMenu, sideMenu, contactMenu}) => {
    const menuRef = useRef(null);
    const [isLocked, setLocked] = useState(false);

    const navigate = useNavigate();

    const safeToggle = useCallback(
        (value) => {
            if (isLocked) return;
            setLocked(true);
            toggleMenu(value);
            setTimeout(() => setLocked(false), 300);
        },
        [isLocked, toggleMenu]
    );


    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                safeToggle(false);
            }
        };

        const handleScroll = () => {
            safeToggle(false);
        };

        // 💡 Используем click вместо pointerdown
        window.addEventListener("click", handleClickOutside);
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);

            window.removeEventListener("click", handleClickOutside);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [safeToggle]);

    return (
        <div
            className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm"
            onClick={() => safeToggle(false)}
        >
            <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="fixed right-0 top-0 w-full h-[100vh] bg-white lg:w-[40%] lg:opacity-80 shadow-lg"
            >
                <div className="w-full h-screen flex flex-col">
                    <div className={'flex justify-end cursor-pointer'}>
                        <SvgClose
                            className="w-10 h-10 fill-black mt-2 cursor-pointer lg:w-16 lg:h-16 lg:mr-4"
                            toggleMenu={toggleMenu}
                        />
                    </div>
                        {sideMenu &&
                            <div className={'ml-[30px]'}>
                                <div className={'text-[35px]'} onClick={() => navigate('/model')}>Моделинг:</div>
                                <div className={'text-[20px]'}>Коммерческие съёмки</div>
                                <div className={'text-[20px]'}>Личные съёмки</div>
                                <div className={'text-[20px]'}>Тесты</div>

                                <div className={'text-[35px] mt-[30px]'} onClick={() => navigate('/design')}>Дизайн одежды:</div>
                                <div className={'text-[20px]'}>Творческие проекты</div>
                                <div className={'text-[20px]'}>Верхняя одежда</div>
                                <div className={'text-[20px]'}>Платья</div>
                                <div className={'text-[20px]'}>Юбки </div>

                                <div className={'text-[35px] mt-[30px]'}>Другое</div>
                            </div>
                        }
                        {contactMenu &&
                            <div className={'ml-[30px]'}>
                                <div className={'text-[35px]'}>КОНТАКТЫ</div>

                                <div className={'text-[20px] mt-[30px]'}>Почта для связи:</div>
                                <div className={'text-[20px]'}>karla.kos.m@gmail.com</div>

                                <div className={'text-[20px] mt-[30px]'}>Telegram:</div>
                                <div className={'text-[20px]'}>@Litiy_S</div>
                            </div>
                        }
                </div>
            </div>
        </div>
    );
}