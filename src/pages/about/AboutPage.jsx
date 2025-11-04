import aboutImage from "../../assets/about.jpg";
import Header from "../../components/Header.jsx";

export const AboutPage = ({openSideMenu, openContactsMenu}) => {
    const text = [
        'Я студентка Инженерной школы одежды СПбГУПТД по направлению «Конструирование, моделирование и технология швейных изделий»',
        'Создание одежды для меня — не просто профессия, а форма самовыражения, который соединяются смысл, эстетика и любовь к деталям.',
        'Я также увлекаюсь моделингом — люблю атмосферу съёмок, создание образов и работу с командой. Особое удовольствие приносит представлять одежду, созданную собственными руками — в этом есть своя завершённость и энергия.'
    ]

    return (
        <div className={`w-full h-[100vh] relative
                     lg:snap-start lg:h-screen lg:flex`}>

            <Header openSideMenu={openSideMenu}
                    openContactsMenu={openContactsMenu}
                    variant={'about'}
            />

            <div className={`w-full h-[60vh] bg-cover
                         lg:h-screen lg:order-2 lg:w-[40%]`}
                 style={{backgroundImage: `url(${aboutImage})`}}
            >
            </div>

            <div className={`w-full h-[40vh] font-zen text-center
                         lg:h-screen lg:w-[60%] lg:text-start lg:ml-[60px]`}>

                <div className={`lg:text-[80px] lg:mt-[90px]`}>Меня зовут Елизавета Михно</div>

                {text.map((item, index) => (
                    <div key={index} className={`mt-5 ml-2 mr-2 text-[0.9rem]
                                                 lg:text-[32px] lg:mt-[90px]`}>
                        {item}
                    </div>
                ))}

                <div className={`font-viaoda
                                 lg:text-[200px] lg:mt-[90px]
                                 max-lg:hidden`}>
                    ОБО МНЕ
                </div>
            </div>
        </div>
    )
}