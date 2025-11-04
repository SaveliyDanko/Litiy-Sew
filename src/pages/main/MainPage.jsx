import mainImage from "../../assets/main.jpg";

export const MainPage = () => (
    <div className={`w-full h-[30vh] relative mt-12 bg-contain
                     lg:h-screen lg:snap-start lg:bg-position-[0%_25%] lg:mt-0`}
         style={{backgroundImage: `url(${mainImage})`}}
    >
        <div className={`absolute bottom-0 w-full flex justify-center mb-5 
                         max-lg:hidden`}>
            <div className={'flex flex-col text-center text-white'}>
                <div className={`font-bacasime tracking-[15%] leading-[260px]
                                 lg:text-[300px] lg:tracking-[10%]`}>
                    <span>LITIY</span>
                </div>

                <div className={`font-bungee
                                 lg:text-[65px]`}>
                    <span>PORTFOLIO</span>
                </div>
            </div>
        </div>
    </div>
)