import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";


type AlertLevel = "info" | "success" | "warning" | "error" | "loading";
type CustomAlertProps = {
  children: React.ReactNode;
  level?: AlertLevel
  className?: string;
  iconSize?: number;
};

export function CustomAlert({
  children,
  level = "info",// Fallback to info
  className,
  iconSize = 22,
}: CustomAlertProps) {
  const levelConfig = {
    info: { icon: <FaInfoCircle size={iconSize} className="text-info" />, border: "border-info", bg: "bg-info/5" },
    success: { icon: <FaCheckCircle size={iconSize} className="text-success" />, border: "border-success", bg: "bg-success/5" },
    warning: { icon: <FaExclamationTriangle size={iconSize} className="text-warning" />, border: "border-warning", bg: "bg-warning/5" },
    error: { icon: <FaTimesCircle size={iconSize} className="text-error" />, border: "border-error", bg: "bg-error/5" },
    loading: { icon: <span className="loading loading-spinner text-primary"></span>, border: "border-primary", bg: "bg-primary/5" },
  };

  const config = levelConfig[level];

  return (
    <div
      role="alert"
      className={`flex items-center text-base-content gap-4 border-l-4 my-6 ${config.border} ${config.bg} p-3 mx-auto mb-3 w-fit rounded-sm ${className}`}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <span className="flex-1">
        {children}
      </span>
    </div>
  );
}