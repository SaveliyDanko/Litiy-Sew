import { useNavigate } from "react-router-dom";

export const SkillContainer = ({image, className, menu, children, to}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) navigate(to);
    };

    return (
        <div className={`h-[50vh] text-center w-full bg-no-repeat bg-cover font-buran text-[90px] relative
                         ${menu ? 'blur-lg scale-105' : ''} ${className}
                         lg:h-screen`}
             style={{backgroundImage: `url(${image})`}} onClick={handleClick}>
            {children}
        </div>
    )
}