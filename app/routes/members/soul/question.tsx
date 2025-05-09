import { data, useFetcher } from "react-router";
import { useCallback, useEffect } from "react";
import type { Route } from "./+types/question";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";
import { createPremiumQuestion, getQuestionCount, incrementQuestionCount } from "~/models/question.server";
import { toast } from "react-toastify";
import { getUserId } from "~/middleware/sessionMiddleware";
import { Toaster } from "~/components/framer-motion/Toaster";


export async function loader({ context }: Route.LoaderArgs) {
  try {
    const userId = getUserId(context);
    const { tarotQuestionCount } = (await getQuestionCount({ userId, section: "tarot" })) as { tarotQuestionCount: number };

    return tarotQuestionCount;
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw data({ message: error?.message }, { status: 400 });
    }
  }
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const userId = getUserId(context);
  const text = formData.get("text");
  const info = formData.get("info");
  const questionCount = Number(formData?.get("questionCount")) ?? 1;
  if (questionCount >= 1) {
    return { success: false, error: "Ya has usado el máximo número de preguntas este mes" };
  }

  try {
    await createPremiumQuestion({ userId, data: { text, info }, section: "tarot" });
    //  Increment count
    const count = questionCount + 1;
    await incrementQuestionCount({ userId, questionType: "tarot", count });
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

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.success && fetcher.data?.message) {
        toast.success(<Toaster message={fetcher.data.message} />);
      }
      if (!fetcher.data?.success && fetcher.data?.error) {
        toast.error(<Toaster message={fetcher.data.error} />);
      }
    }
  }, [fetcher.data]);

  return (
    <div className="text-center pt-6 pb-6 flex flex-col items-center justify-center">
      <img
        className="w-32"
        src="/tarot.png"
        alt="Tarot card"
      />
      <h2 className="text-3xl font-semibold text-primary mb-1">Pregunta de Tarot</h2>
      <div className="p-10 pt-6 md:w-2/3 mx-auto">
        <p>
          Una lectura energética del estado presente en el que te encuentras para poder responderte, guiarte hacia tu mejor posible opción y aclararte tus
          dudas.
        </p>
        <p>
          Ofrecemos un máximo de una pregunta al mes por membresía que serán respondidas a través de un videolink privado a tu email de tu plan. Nuestras
          lecturas son sin tiempo.
        </p>
      </div>
      <div className="text-center mb-3">
        Preguntas disponibles:
        <span className="text-warning"> {1 - Number(questionCount)} </span>
        de
        <span className="text-warning"> 1</span>
      </div>
      <fetcher.Form ref={formRef} method="post" className="p-2 rounded-lg md:w-2/3 shadow-lg mb-6 border border-base-300">
        <input type="hidden" name="questionCount" value={questionCount} />
        <input type="hidden" name="type" value={"tarot"} />
        <div className="p-6">
          <label className="flex flex-col gap-3 mb-4">
            <span className="font-bold text-xl">1. ¿Qué duda tienes o qué te interesa saber?</span>
            <textarea className="textarea textarea-lg h-24 w-full" placeholder="Escribe tu pregunta aqui..." name="text" required></textarea>
          </label>

          <label className="flex flex-col gap-3 mb-4">
            <span className="font-bold text-xl"> 2. Cuéntanos algo que nos ayude a prepararnos para tu consulta dándonos el contexto de la pregunta si crees que es necesario.</span>
            <textarea className="textarea textarea-lg h-24 w-full" placeholder="Escribe aqui..." name="info"></textarea>
          </label>

          <div className="flex gap-3 mb-3 justify-center">
            <button type="reset" className="btn btn-sm btn-accent  btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting" ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </div>
      </fetcher.Form>
      <p className="text-xl pt-3 text-center mb-4">Estos son algunos ejemplos de tiradas generales y grupales.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
        <div className="flex flex-col m-10">
          <p className="h-10 mb-2">DESCUBRE QUÉ LE DUELE A TU ALMA</p>
          <YoutubeVideo videoId="Nf4QjdJ7hoU" />
        </div>
        <div className="flex flex-col m-10">
          <p className="h-10 mb-2">DESCUBRE QUÉ TE IMPIDE CRECER</p>
          <div className="ratio ratio-16x9">
            <YoutubeVideo videoId="W74TDapruPM" />
          </div>
        </div>
        <div className="flex flex-col m-10">
          <p className="h-10 mb-2">DESCUBRE QUÉ TE DICE EL REINO VEGETAL</p>
          <YoutubeVideo videoId="j7uJY37pmCI" />
        </div>
        <div className="flex flex-col m-10">
          <p className="h-10 mb-2">DESCUBRE QUÉ TE DICE LA ENERGÍA CHAMÁNICA</p>
          <YoutubeVideo videoId="fwwmPC-rgbI" />
        </div>
      </div>
    </div>
  );
}
