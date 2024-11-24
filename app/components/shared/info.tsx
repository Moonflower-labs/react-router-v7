import { FaInfo } from "react-icons/fa";

type InfoAlertProps = {
  children: React.ReactNode;
  level?: string;
  className?: string;
  iconSize?: number;
};

export default function InfoAlert({ children, level, className = "", iconSize = 15 }: InfoAlertProps) {
  return (
    <div role="alert" className={`flex items-center gap-4 border rounded-lg alert alert-info opacity-70 p-3 border-info/40 mx-auto mb-3 w-fit ${className}`}>
      <FaInfo size={iconSize} />
      <span>
        <span className="font-bold">{level ? level : "Aviso"}:</span> {children}
      </span>
    </div>
  );
}
