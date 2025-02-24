import { data, useFetcher } from "react-router";
import { useCallback, useEffect } from "react";
import type { Route } from "./+types/question";
import { createPremiumQuestion, getQuestionCount, incrementQuestionCount } from "~/models/question.server";
import { requireUserId } from "~/utils/session.server";
import { toast } from "react-toastify";


export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireUserId(request);

    const { liveQuestionCount } = (await getQuestionCount({ userId, section: "live" })) as { liveQuestionCount: number };

    return liveQuestionCount;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw data({ message: error?.message }, { status: 400 });
    }
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = await requireUserId(request);

  const text = formData.get("text");
  const questionCount = Number(formData?.get("questionCount")) ?? 1;

  if (questionCount >= 1) {
    return { success: false, error: "Ya has usado el máximo número de preguntas este mes" };
  }


  try {
    await createPremiumQuestion({ userId, data: { text }, section: "live" });
    //  Increment count
    const count = questionCount + 1;
    await incrementQuestionCount({ userId, questionType: "live", count });
    return { success: true, message: "Tu pregunta ha sido enviada. Gracias!" };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export default function Component({ loaderData }: Route.ComponentProps) {
  const questionCount = loaderData;
  const fetcher = useFetcher();
  const formRef = useCallback((node: HTMLFormElement | null) => {
    if (node && fetcher.state === "idle" && fetcher.data?.message) {
      node.reset();
    }
  }, [fetcher.state, fetcher.data?.message]);

  console.log(fetcher.data)
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.success && fetcher.data?.message) {
        toast.success(fetcher.data?.message);
      }
      if (!fetcher.data?.success && fetcher.data?.error) {
        toast.error(fetcher.data?.error);
      }
    }
  }, [fetcher.data]);

  return (
    <div className="text-center pt-6 pb-6">
      <img
        className="w-32 mx-auto"
        src="/live.png"
        alt="Live Stream"
      />
      <h2 className="text-3xl font-semibold text-primary mb-1">Pregunta con respuesta en directo</h2>
      <div className="p-10 pt-6 md:w-2/3 mx-auto">
        <p className="h3 mb-3">Una sesión mensual en directo espontánea, respondiendo usando el método que surja. Una Pregunta por persona o miembro.</p>
        <p className="mb-4">
          Si no puedes estar en el directo tendrás acceso a dejar tus preguntas para el directo debajo. Todo lo que no de tiempo a contestar durante el directo
          se contestará en la sección Respuestas del Plan Espíritu.
        </p>
      </div>

      <div className="row my-4 justify-content-center text-center mx-auto">
        <div className="mb-4">
          Preguntas disponibles: <span className="text-warning"> {1 - Number(questionCount)} </span> de
          <span className="h4 text-warning"> 1</span>
        </div>
        <fetcher.Form ref={formRef} method="post" className="p-2 rounded-lg md:w-2/3 mx-auto shadow-lg border border-base-300">
          <input type="hidden" name="questionCount" value={questionCount} />
          <input type="hidden" name="type" value={"live"} />
          <div className="p-6">
            <label className="flex flex-col gap-3 mb-4">
              <span className="font-bold text-xl"> 1. ¿Qué necesitas aclarar, entender?</span>
              <textarea className="textarea textarea-lg h-24 w-full" placeholder="Escribe tu pregunta aqui..." name="text" required></textarea>
            </label>

            <div className="mb-3 text-center">
              <button type="reset" className="btn btn-sm btn-outline btn-accent mx-1 rounded-1">
                Cancelar
              </button>
              <button type="submit" className="btn btn-sm btn-primary mx-1 rounded-1">
                Enviar
              </button>
            </div>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
