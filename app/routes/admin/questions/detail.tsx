import { prisma } from "~/db.server";
import { Route } from "./+types/detail";
import { formatDate } from "~/utils/format";

export async function loader({ params }: Route.LoaderArgs) {
  return prisma.question.findUnique({ where: { id: params.id } });
}

export default function Detail({ loaderData }: Route.ComponentProps) {
  const question = loaderData;
  return (
    <div className="card lg:w-2/3 mx-auto shadow-lg mb-6">
      <div className="card-body">
        <h2 className="card-title">
          Usuario: <span className="font-light">{question?.name}</span> <span className="text-sm">{formatDate(question?.createdAt as Date)}</span>
        </h2>
        <div className="mb-3">
          <div className="font-semibold">
            {" "}
            ¿Tu pregunta es sobre Limpiezas, Emociones y Sentimientos Discordantes, Ataques Psíquicos o Habilidades Psíquicas?
          </div>
          <div>{question?.subject}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Qué duda tienes o qué te interesa saber?</div>
          <div>{question?.text}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Cúal es tu grupo de edad?</div>
          <div>{question?.ageGroup}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Cúal es tu género?</div>
          <div>{question?.gender}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Desde qué país nos contactas?</div>
          <div>{question?.country}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Desde qué ciudad nos contactas?</div>
          <div>{question?.city}</div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">¿Dónde has oído hablar de nosotros?</div>
          <div>{question?.media}</div>
        </div>
      </div>
    </div>
  );
}
