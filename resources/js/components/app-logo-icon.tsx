import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer Geometric Hexagonal Badge */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2ZM20 6.5359L8.91154 12.9378V25.7382L20 32.1401L31.0885 25.7382V12.9378L20 6.5359Z"
                fill="currentColor"
            />
            {/* Inner Engine Piston & Truck Emblem */}
            <path
                d="M20 10L28 14.6188V23.8564L20 28.4752L12 23.8564V14.6188L20 10ZM20 13.8476L15.2 16.6188V21.8564L20 24.6276L24.8 21.8564V16.6188L20 13.8476Z"
                fill="currentColor"
                opacity="0.85"
            />
            {/* Center Core */}
            <path
                d="M20 17.5L22.5 18.9434V21.8301L20 23.2735L17.5 21.8301V18.9434L20 17.5Z"
                fill="currentColor"
            />
        </svg>
    );
}
