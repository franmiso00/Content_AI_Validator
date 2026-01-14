import React from 'react';

interface ValioLogoProps {
    size?: number;
    variant?: 'default' | 'white';
}

const ValioLogo = ({ size = 32, variant = 'default' }: ValioLogoProps) => {
    const gradientId = `valio-grad-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="flex items-center gap-2">
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0EA5E9" />
                        <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                </defs>
                <rect
                    width="48"
                    height="48"
                    rx="12"
                    fill={variant === 'white' ? 'white' : `url(#${gradientId})`}
                />
                <path
                    d="M14 25L21 32L34 18"
                    stroke={variant === 'white' ? '#0EA5E9' : 'white'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <span
                className="font-bold tracking-tight"
                style={{
                    fontSize: size * 0.7,
                    color: variant === 'white' ? 'white' : '#0F172A'
                }}
            >
                valio<span className="text-sky-500">.pro</span>
            </span>
        </div>
    );
};

export default ValioLogo;
