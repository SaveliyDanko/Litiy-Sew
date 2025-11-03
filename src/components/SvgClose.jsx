import * as React from "react";
const SvgClose = ({className, toggleMenu}) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        className={className}
        onClick={toggleMenu}
    >
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224z" />
    </svg>
);
export default SvgClose;