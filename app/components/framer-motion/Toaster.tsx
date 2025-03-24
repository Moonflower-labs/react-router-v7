// CustomToast.jsx
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { MdOutlineError } from "react-icons/md";
import { toast, type ToastContentProps, type TypeOptions } from "react-toastify";


type Props = Partial<ToastContentProps> & {
    message: string;
};


const ProgressBar = ({ progress, type }: { progress: number; type: string }) => {
    const progressGradients: any = {
        success: "from-success/90 to-success/50",
        error: "from-error/90 to-error/50",
        info: "from-info/90 to-info/50",
        warning: "from-warning/90 to-warning/50",
    };

    return (
        <div className="w-full rounded- bg-base-300/50 h-2 overflow-hidden absolute bottom-0 left-0">
            <div className={`h-full w-full animate-pulse rounded- bg-gradient-to-r ${progressGradients[type]} opacity-50 absolute top-0 left-0`} />
            {/* Main progress bar */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
                className={`h-full rounded- bg-gradient-to-r ${progressGradients[type]} absolute top-0 left-0`}
            />
        </div>
    );
};

export const Toaster = ({ isPaused, closeToast, toastProps, message }: Props) => {
    const duration = toastProps?.autoClose || 6000; // Milliseconds
    const [progress, setProgress] = useState(1); // Start at 1 (100%)
    const toastId = toastProps?.toastId;


    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = Math.max(0, prev - 0.01);
                if (newProgress === 0) {
                    setTimeout(() => {
                        toast.dismiss(toastId);
                    }, 0);
                }
                return newProgress;
            });
        }, duration / 100);

        return () => clearInterval(interval);
    }, [isPaused, duration, closeToast, toastId]);


    // // Update progress value (and only update progress inside the interval)
    // useEffect(() => {
    //     if (isPaused) return;
    //     const interval = setInterval(() => {
    //         setProgress((prev) => Math.max(0, prev - 0.01)); // step down by 1%
    //     }, duration / 100); // match duration to 100 steps

    //     return () => clearInterval(interval);
    // }, [isPaused, duration]);

    // // When progress becomes 0, trigger closing the toast.
    // useEffect(() => {
    //     if (progress === 0 && !isPaused) {
    //         // Calling closeToast outside the render logic prevents the setState-from-render warning.
    //         closeToast?.();
    //     }
    // }, [progress, isPaused, closeToast]);


    const toastVariants = {
        initial: { opacity: 0, y: 50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -50, scale: 0.95 },
    };

    const typeStyles: any = {
        success: "alert-success",
        error: "alert-error",
        info: "text-info",
        warning: "alert-warning",
    };

    // const progressGradients: any = {
    //     success: "from-green-600 to-green-200",
    //     error: "from-red-600 to-red-200",
    //     info: "from-blue-600 to-blue-200",
    //     warning: "from-yellow-600 to-yellow-200",
    // };

    const type = toastProps?.type || "info";

    return (
        <motion.div
            variants={toastVariants}
            key={toastId}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`alert rounded-none rounded-t-md ${typeStyles[type]} bg-base-100 shadow-xl w-full max-w-md border border-base-200`}
        >
            <button
                className="absolute top-1 right-1 btn btn-sm btn-ghost btn-circle hover:bg-base-200"
                onClick={closeToast}
            >
                ✕
            </button>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                    <motion.span
                        className="text-lg font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                        {type === "info" ? (
                            <FaInfoCircle className={`text-${type}`} size={24} />
                        ) : type === "success" ? (
                            <FaCheckCircle className={`text-${type}`} size={24} />
                        ) : type === "error" ? (
                            <MdOutlineError className={`text-${type}`} size={24} />
                        ) : (
                            <IoIosWarning className={`text-${type}`} size={24} />
                        )}
                    </motion.span>
                    <span className="text-base-content">{message || "Default message"}</span>
                </div>
            </div>
            <ProgressBar progress={progress} type={type} />
        </motion.div>
    );
};

// Utility function to show toast
export const showToast = (message: string, type = "info" as TypeOptions, options = {}) => {
    toast(
        <Toaster message={message} />,
        {
            ...options,
            type,
            closeButton: false,
            className: "p-0 !bg-transparent !border-none bg-pink-500 rounded-xl",
            icon: false,
            containerId: "toastContainer",
        }
    );
};

// Usage Example
export const ToastExample = () => {
    return (
        <div className="p-4 space-y-4 flex gap-4 justify-center">
            <button
                className="btn btn-success"
                onClick={() => showToast("Operation completed!", "success")}
            >
                Success
            </button>
            <button
                className="btn btn-error"
                onClick={() => showToast("Something went wrong!", "error")}
            >
                Error
            </button>
            <button
                className="btn btn-info"
                onClick={() => showToast("Here’s some info", "info")}
            >
                Info
            </button>
            <button
                className="btn btn-warning"
                onClick={() => showToast("Be careful!", "warning")}
            >
                Warning
            </button>
        </div>
    );
};