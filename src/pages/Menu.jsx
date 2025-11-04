import SvgClose from "../components/SvgClose.jsx";
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export const Menu = ({sideMenu, contactMenu, closeAll}) => {
    const navigate = useNavigate();

    useEffect(() => {
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";


        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-15 bg-black/30 backdrop-blur-sm"
        >
            <div
                className="fixed right-0 top-0 w-full h-[100vh] bg-white lg:w-[40%] lg:opacity-80 shadow-lg"
            >
                <div className="w-full h-screen flex flex-col">
                    <div className="flex justify-end cursor-pointer"
                         onClick={(e) => e.stopPropagation()}
                    >
                        <SvgClose
                            className="w-10 h-10 fill-black mt-2 cursor-pointer lg:w-16 lg:h-16 lg:mr-4"
                            toggleMenu={closeAll}
                        />
                    </div>

                    {sideMenu && (
                        <div className="ml-[30px]">
                            <div
                                className="text-[35px] cursor-pointer"
                                onClick={() => navigate("/model")}
                            >
                                Моделинг:
                            </div>
                            <div className="text-[20px]">Коммерческие съёмки</div>
                            <div className="text-[20px]">Личные съёмки</div>
                            <div className="text-[20px]">Тесты</div>

                            <div
                                className="text-[35px] mt-[30px]"
                                onClick={() => navigate("/design")}
                            >
                                Дизайн одежды:
                            </div>
                            <div className="text-[20px]">Творческие проекты</div>
                            <div className="text-[20px]">Верхняя одежда</div>
                            <div className="text-[20px]">Платья</div>
                            <div className="text-[20px]">Юбки</div>

                            <div className="text-[35px] mt-[30px]">Другое</div>
                        </div>
                    )}

                    {contactMenu && (
                        <div className="ml-[30px]">
                            <div className="text-[35px]">КОНТАКТЫ</div>
                            <div className="text-[20px] mt-[30px]">Почта для связи:</div>
                            <div className="text-[20px]">karla.kos.m@gmail.com</div>
                            <div className="text-[20px] mt-[30px]">Telegram:</div>
                            <div className="text-[20px]">@Litiy_S</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
