import React from "react"
import { IconType } from "react-icons"

type VerticalMenuIconProps = {
    icon: IconType | string // Either a React Icon component or a string
    gutter?: boolean // Optional gutter prop
}

const VerticalMenuIcon = ({ icon, gutter = true }: VerticalMenuIconProps) => {
    // Check if `icon` is a React component (function) or string
    if (!icon) return null;

    return (
        <span className={`text-2xl ${gutter ? 'ltr:mr-2 rtl:ml-2' : ''}`}>
            {typeof icon === 'string' ? (
                <i className={icon}></i> // Handle string icons (if any)
            ) : (
                // Render the React Icon component
                React.createElement(icon)
            )}
        </span>
    )
}

export default VerticalMenuIcon;
