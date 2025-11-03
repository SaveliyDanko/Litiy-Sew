import mainImage from "../../assets/main.jpg";

export const MainPage = () => (
    <div className={`w-full relative mt-12
                     lg:h-screen lg:snap-start lg:bg-cover lg:bg-position-[0%_25%] lg:mt-0
                     max-lg:bg-none`}
         style={{backgroundImage: `url(${mainImage})`}}
    >
        <img src={mainImage} alt={'main'} className={'lg:hidden w-full'}/>
        <div className={`absolute bottom-0 w-full flex justify-center mb-5 
                         max-lg:hidden`}>
            <div className={'flex flex-col text-center text-white'}>
                <div className={`font-bacasime tracking-[15%] leading-[260px]
                                 lg:text-[300px] lg:tracking-[10%]`}>
                    LITIY
                </div>

                <div className={`font-bungee
                                 lg:text-[65px]`}>
                    PORTFOLIO
                </div>
            </div>
        </div>
    </div>
)