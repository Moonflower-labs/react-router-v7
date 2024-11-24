import { Link } from "react-router";

export default function Confirmation() {
  return (
    <div className="mb-4 px-3 min-h-[70vh] flex flex-col justify-center items-center">
      <h2 className="text-2xl mb-4">Tu ha plan ha sido actualizado....</h2>
      <div className="mb-4">Estamos procesando tu cambio de plan.Tu nuevo Plan estará disponible en breve.</div>
      <Link to={"/profile/subscription"} className="btn btn-primary btn-sm">
        Ver my plan
      </Link>
    </div>
  );
}
