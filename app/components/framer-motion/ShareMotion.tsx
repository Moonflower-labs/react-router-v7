import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { IoShareSocial } from "react-icons/io5";
import { TelegramShareButton, TelegramIcon, FacebookShareButton, FacebookIcon, TwitterShareButton, XIcon, WhatsappShareButton, WhatsappIcon } from "react-share";

interface ShareMotionProps {
    url: string;
    title: string;
}

export function ShareMotion({ url, title }: ShareMotionProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Animation variants
    const containerVariants = {
        closed: {
            width: '40px', // Matches share icon size
            transition: { duration: 0.3, ease: 'easeInOut' },
        },
        open: {
            width: 'auto', // Expands to fit content
            transition: { duration: 0.3, ease: 'easeInOut', staggerChildren: 0.1 },
        },
    };

    const buttonVariants = {
        closed: { opacity: 0, x: -20, width: 0 },
        open: { opacity: 1, x: 0, width: 'auto' },
    };

    return (
        <div className="flex gap-2 mt-4 justify-end">
            <motion.div
                className="flex items-center gap-2 overflow-hidden h-10"
                variants={containerVariants}
                initial="closed"
                animate={isOpen ? 'open' : 'closed'}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Share Icon (always visible) */}
                <IoShareSocial size={32} className="cursor-pointer mb-1" />

                {/* Share Buttons */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div variants={buttonVariants}>
                                <TelegramShareButton url={url} title={title}>
                                    <TelegramIcon size={32} round />
                                </TelegramShareButton>
                            </motion.div>
                            <motion.div variants={buttonVariants}>
                                <FacebookShareButton url={url} title={title}>
                                    <FacebookIcon size={32} round />
                                </FacebookShareButton>
                            </motion.div>
                            <motion.div variants={buttonVariants}>
                                <TwitterShareButton url={url} title={title}>
                                    <XIcon size={32} round />
                                </TwitterShareButton>
                            </motion.div>
                            <motion.div variants={buttonVariants}>
                                <WhatsappShareButton url={url} title={title}>
                                    <WhatsappIcon size={32} round />
                                </WhatsappShareButton>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}