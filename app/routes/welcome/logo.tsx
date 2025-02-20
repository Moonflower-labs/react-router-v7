import { motion } from 'motion/react';

const ShiningLogo = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="350" height="150" viewBox="0 0 350 150" className='rounded'>
            {/* Define a vertical gradient with hints of purple */}
            <defs>
                <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff2fa" /> {/* Very light off-white */}
                    <stop offset="40%" stopColor="#8a2be2" /> {/* Soft lavender purple */}
                    <stop offset="100%" stopColor="#430054" /> {/* Light purple-gray */}
                </linearGradient>

                {/* Define the shining effect using a gradient mask */}
                <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Smaller text */}
            <motion.text
                x="50%"
                y="40%"
                textAnchor="middle"
                fill="url(#textGradient)"
                fontFamily="Arial, sans-serif"
                fontSize="35"
                fontWeight="normal"
                animate={{
                    filter: [
                        'brightness(1.1)', // Subtle brightness increase
                        'brightness(1)',   // Normal brightness
                    ],
                }}
                transition={{
                    duration: 3, // Slower transition for subtle reflection
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                }}
            >
                La Flor
            </motion.text>

            {/* Larger text */}
            <motion.text
                x="50%"
                y="82%"
                textAnchor="middle"
                fill="url(#textGradient)"
                fontFamily="Arial, sans-serif"
                fontSize="85"
                fontWeight="bold"
                animate={{
                    filter: [
                        'brightness(1.1)', // Subtle brightness increase
                        'brightness(1)',   // Normal brightness
                    ],
                }}
                transition={{
                    duration: 2, // Slower transition for subtle reflection
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeIn",
                }}
            >
                Blanca
            </motion.text>

            {/* Add a shining effect layer with motion */}
            {/* <motion.rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="url(#shineGradient)"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                    duration: 8, // Slow movement across the text
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                }}
            /> */}
        </svg>
    );
};

export default ShiningLogo;