import { prisma } from "~/db.server";
import type { Route } from "./+types/detail";
import { formatDayTime } from "~/utils/format";

export async function loader({ params }: Route.LoaderArgs) {
  const basic = await prisma.question.findUnique({ where: { id: params.id } });
  const premium = await prisma.premiumQuestion.findUnique({ where: { id: params.id } });

  return { question: basic ?? premium }
}

export default function Detail({ loaderData }: Route.ComponentProps) {
  const question = loaderData?.question as any;
  return (
    <>
      <h1 className="text-center text-3xl py-3 text-primary">Detalles de la pregunta</h1>
      <div className="card lg:w-2/3 mx-auto shadow-lg mb-6">
        <div className="card-body">
          {!question?.section ?
            <>
              <h2 className="card-title">
                Usuario: <span className="font-light">{question?.name}</span> <span className="text-sm">{formatDayTime(question?.createdAt as Date)}</span>
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
            </>
            : <>
              <h2 className="card-title">
                Sección: <span className="font-light">{question?.section}</span> <span className="text-sm">{formatDayTime(question?.createdAt as Date)}</span>
              </h2>
              <div className="mb-3">
                <div className="font-semibold">¿Qué duda tienes o qué te interesa saber?</div>
                <div>{question?.text}</div>
              </div>
              {question?.info ? <div className="mb-3">
                <div className="font-semibold">
                  Información extra
                </div>
                <div>{question?.info}</div>
              </div> : null}
            </>
          }
        </div>
      </div>
    </>
  );
}
