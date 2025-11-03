import {AboutHeader} from "./AboutHeader.jsx";

export const AboutPage = ({toggleSideMenu, toggleContactsMenu}) => (
    <div className={`w-full h-[100vh]
                     lg:snap-start lg:h-screen lg:flex`}>
        <AboutHeader toggleSideMenu={toggleSideMenu} toggleContactsMenu={toggleContactsMenu}/>
        <div className={`w-full h-[60vh] bg-[url(about.jpg)] bg-cover
                         lg:h-screen lg:order-2 lg:w-[40%]`}>
        </div>

        <div className={`w-full h-[40vh] font-zen text-center
                         lg:h-screen lg:w-[60%]`}>
            <div className={``}>Меня зовут Елизавета Михно</div>

            <div className={`mt-5 ml-2 mr-2 text-[0.9rem]`}>
                Я студентка Инженерной школы одежды СПбГУПТД по направлению «Конструирование, моделирование и технология швейных изделий»
            </div>

            <div className={`mt-5 ml-2 mr-2 text-[0.9rem]`}>
                Создание одежды для меня — не просто профессия, а форма самовыражения, который соединяются смысл, эстетика и любовь к деталям.
            </div>

            <div className={`mt-5 ml-2 mr-2 text-[0.9rem]`}>
                Я также увлекаюсь моделингом — люблю атмосферу съёмок, создание образов и работу с командой.
                Особое удовольствие приносит представлять одежду, созданную собственными руками — в этом есть своя завершённость и энергия.
            </div>
        </div>
    </div>
)