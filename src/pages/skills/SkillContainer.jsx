import { useNavigate } from "react-router-dom";

export const SkillContainer = ({image, className, activeMenu, children, to}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
    };

    return (
        <div className={`h-[50vh] text-center w-full bg-no-repeat bg-cover font-buran text-[90px] relative
                         ${activeMenu ? 'blur-lg scale-105' : ''} ${className}
                         lg:h-screen`}
             style={{backgroundImage: `url(${image})`}} onClick={handleClick}>
            {children}
        </div>
    )
}