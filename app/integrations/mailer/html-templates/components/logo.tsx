
const ShiningLogo = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 350 150" className='rounded'>
            {/* Define a vertical gradient with hints of purple */}
            <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f4f4f4" /> {/* Very light off-white */}
                    <stop offset="50%" stopColor="#c8a6f7" /> {/* Soft lavender purple */}
                    <stop offset="100%" stopColor="#a58dd6" /> {/* Light purple-gray */}
                </linearGradient>
                {/* Define the shining effect using a gradient mask */}
                <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Smaller text */}
            <text
                x="50%"
                y="40%"
                textAnchor="middle"
                fill="url(#textGradient)"
                fontFamily="Arial, sans-serif"
                fontSize="35"
                fontWeight="normal"
            >
                La Flor
            </text>
            {/* Larger text */}
            <text
                x="50%"
                y="82%"
                textAnchor="middle"
                fill="url(#textGradient)"
                fontFamily="Arial, sans-serif"
                fontSize="85"
                fontWeight="bold"
            >
                Blanca
            </text>
        </svg>
    );
};

export default ShiningLogo;