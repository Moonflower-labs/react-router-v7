import { FaCheckCircle, FaExclamationTriangle, FaInfo, FaInfoCircle, FaTimesCircle } from "react-icons/fa";

type CustomAlertProps = {
  children: React.ReactNode;
  level?: "info" | "error" | "warning" | "success";
  className?: string;
  iconSize?: number;
};

export function CustomAlert({
  children,
  level,
  className,
  iconSize = 22,
}: CustomAlertProps) {
  // Map level to icons and colors
  const levelConfig = {
    info: { icon: <FaInfoCircle size={iconSize} className="text-info" />, border: "border-info" },
    success: { icon: <FaCheckCircle size={iconSize} className="text-success" />, border: "border-success" },
    warning: { icon: <FaExclamationTriangle size={26} className="text-warning" />, border: "border-warning" },
    error: { icon: <FaTimesCircle size={iconSize} className="text-error" />, border: "border-error" },
  };

  const config = levelConfig[level || "info"]; // Fallback to info

  return (
    <div
      role="alert"
      className={`flex items-center text-base-content gap-4 border-l-4 my-4 ${config.border} p-3 mx-auto mb-3 w-fit ${className}`}
    >
      {config.icon}
      <span>
        {children}
      </span>
    </div>
  );
}