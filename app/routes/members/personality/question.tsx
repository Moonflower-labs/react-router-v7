import { type MutableRefObject, useEffect, useRef } from "react";
import { data, useFetcher } from "react-router";
import type { Route } from "./+types/question";
import { requireUserId } from "~/utils/session.server";
import { createBasicQuestion, getQuestionCount, incrementQuestionCount } from "~/models/question.server";
import { toast } from "react-toastify";
import ActionError from "~/components/framer-motion/ActionError";

export const handle = {
  links: [{ to: "/personality#blogs", name: "Blogs" }, { to: "/personality#podcasts", name: "Podcasts" }, { to: "/personality/question", name: "Pregunta" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const userId = await requireUserId(request);

    const { basicQuestionCount } = (await getQuestionCount({ userId, section: "basic" })) as { basicQuestionCount: number };

    return basicQuestionCount;
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

  const questionCount = Number(formData?.get("questionCount")) ?? 3;

  if (questionCount >= 3) {
    return { success: false, error: "Ya has usado el máximo número de preguntas este mes" };
  }
  const name = formData.get("name");
  const ageGroup = formData.get("age_group");
  const subject = formData.get("subject");
  const text = formData.get("text");
  const gender = formData.get("gender");
  const country = formData.get("country");
  const city = formData.get("city");
  const mediaEntries = formData.getAll("media").toString();
  const media = mediaEntries.replace("other", "") + `${formData.get("another") ? "," + formData.get("another") : ""}`;

  const questionData = {
    name,
    ageGroup,
    subject,
    text,
    gender,
    country,
    city,
    media
  };
  // todo: validate input data + provide feedback
  const errors = {
    name: !name || name.toString().length < 2 ? "Debes dar un nombre" : null,
    subject: subject ? null : "Elige un tema",
    text: text ? null : "Escribe una pregunta",
    ageGroup: ageGroup ? null : "Elige un grupo de edad"
  };
  // return data if we have errors
  const hasErrors = Object.values(errors).some(errorMessage => errorMessage);
  if (hasErrors) {
    return { errors };
  }
  try {
    await createBasicQuestion({ userId, data: questionData });
    //  Increment count
    const count = questionCount + 1;
    await incrementQuestionCount({ userId, questionType: "basic", count });
    return { success: true, message: "Tu pregunta ha sido enviada. Gracias!" };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default function BasicQuestion({ loaderData }: Route.ComponentProps) {
  const questionCount = loaderData;
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;
  const formRef: MutableRefObject<HTMLFormElement | null> = useRef(null);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = document.querySelector('input[name="another"]') as HTMLInputElement;

    if (event.target.checked) {
      input.disabled = false; // Enable the text input if the radio is checked
      input.required = true;
    } else {
      input.disabled = true; // Disable the text input if the radio is unchecked
      input.value = ""; // Clear the value when the radio is unchecked
      input.required = false;
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      formRef.current?.reset(); // Reset the form
    }
  }, [fetcher.state, fetcher.data]);

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

  useEffect(() => {
    if (!formRef.current) return;
    // Find first non-null error
    const errorField = Object.entries(errors || {}).find(([_, value]) => value !== null)?.[0];
    if (errorField) {
      // Find input by name attribute
      const element = formRef.current.querySelector(`input[name="${errorField}"], textarea[name="${errorField}"]`) as HTMLInputElement | HTMLTextAreaElement;
      element?.focus();
    }
  }, [fetcher.data?.errors]);

  //  todo: clear form inputs accordingly, display spinner

  return (
    <div className="text-center pt-16 pb-6">
      <h2 className="text-3xl font-semibold text-primary mb-1">Pregunta de Personalidad</h2>
      <div className="p-10 pt-6 md:w-2/3 mx-auto">
        <p className="text-2xl mb-3">Hola Almas Oscuras y Luminosas</p>
        <p>
          Aquí podéis preguntar de una manera más anónima todo aquello que verdaderamente os inquieta (siguiendo la línea de mi contenido) y que no os atrevéis
          a hacer en los canales públicos. No mencionaremos ningún dato personal solo la pregunta en sí al responder.
        </p>
      </div>
      <div className="mb-6">
        Preguntas disponibles:
        <span className="text-warning"> {3 - Number(questionCount)} </span>
        de
        <span className="text-warning"> 3</span>
      </div>
      <fetcher.Form ref={formRef} method="post" id="question" className="p-2 rounded-3xl md:w-2/3 mx-auto shadow-lg border">
        <input type="hidden" name="questionCount" value={questionCount} />
        <div className="p-10">
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text me-3 md:me-0">Nombre</span>
              <input type="text" name="name" placeholder="Nombre" className="input input-bordered w-full max-w-xs" />
            </label>
            {errors?.name && <ActionError actionData={{ error: errors.name }} />}
          </div>

          <div className="mb-3">
            <div className="font-bold"> 1. ¿Tu pregunta es sobre Limpiezas, Emociones y Sentimientos Discordantes, Ataques Psíquicos o Habilidades Psíquicas?</div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Limpiezas</span>
                <input type="radio" name="subject" className="radio checked:bg-primary" value={"Limpiezas"} />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Emociones y Sentimientos Discordantes</span>
                <input type="radio" name="subject" className="radio checked:bg-primary" value={"Emociones"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Ataques Psíquicos</span>
                <input type="radio" name="subject" className="radio checked:bg-primary" value={"Ataques Psíquicos"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Habilidades Psíquicas</span>
                <input type="radio" name="subject" className="radio checked:bg-primary" value={"Habilidades Psíquicas"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">
                  Otro <span className="font-semibold">(siguiendo la línea de nuestro contenido)</span>{" "}
                </span>
                <input type="radio" name="subject" className="radio checked:bg-primary" value={"Other"} />
              </label>
            </div>
            {errors?.subject && <ActionError actionData={{ error: errors.subject }} />}
          </div>
          <label className="form-control mb-6">
            <div className="label">
              <span className="label-text font-bold">2. ¿Qué duda tienes o te interesa saber sobre este tema?</span>
              <span className="label-text-alt">Alt label</span>
            </div>
            <textarea className="textarea textarea-bordered h-24 mb-3" placeholder="Escribe tu pregunta aqui..." name="text"></textarea>
            {errors?.text && <ActionError actionData={{ error: errors.text }} />}
          </label>
          <div className="mb-6">
            <div className="font-bold"> 3. ¿Dónde has oído hablar de nosotros?</div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Telegram</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"Telegram"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">YouTube</span>

                <input type="checkbox" className="checkbox checkbox-primary" value={"YouTube"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Instagram</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"Instagram"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Facebook</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"Facebook"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">LinkedIn</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"LinkedIn"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Anuncio</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"Anuncio"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De boca en boca</span>
                <input type="checkbox" className="checkbox checkbox-primary" value={"De boca en boca"} name="media" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Otro</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  value={"otro"}
                  name="media"
                  onChange={event => {
                    handleRadioChange(event);
                  }}
                />
              </label>
              <input
                type="text"
                placeholder="Especifica aquí..."
                className="input input-bordered w-full max-w-xs disabled:bg-primary/10"
                name={"another"}
                disabled
              />
            </div>
          </div>

          <div className="mb-3">
            <div className="font-bold">4. ¿Cúal es tu grupo de edad?</div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 16 a 25 años </span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"16-25"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 26 a 35 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"26-35"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 36 a 45 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"36-45"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 46 a 55 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"46-55"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 56 a 65 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"56-65"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">De 66 a 75 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={"66-75"} />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Mayor de 75 años</span>
                <input type="radio" name="age_group" className="radio checked:bg-primary" value={">75"} />
              </label>
            </div>
            {errors?.ageGroup && <ActionError actionData={{ error: errors.ageGroup }} />}
          </div>
          <label className="label flex-row justify-between">
            <span className="label-text mb-3 md:mb-0 font-bold">5. ¿Cúal es tu Género?</span>
            <select className="select select-bordered" name="gender" required>
              <option value={"mujer"}>Mujer</option>
              <option value={"hombre"}>Hombre</option>
            </select>
          </label>

          <div className="form-control mb-3">
            <label className="label flex-col md:flex-row">
              <span className="label-text mb-3 md:mb-0 font-bold">6. ¿Desde qué país nos contactas?</span>
              <input type="text" name="country" placeholder="País" className="input input-bordered w-full max-w-xs" required />
            </label>
          </div>
          <div className="form-control mb-3">
            <label className="label flex-col md:flex-row">
              <span className="label-text mb-3 md:mb-0 font-bold">7. ¿Desde qué ciudad nos contactas?</span>
              <input type="text" name="city" placeholder="Ciudad" className="input input-bordered w-full max-w-xs" required />
            </label>
          </div>
        </div>
        <div className="flex gap-3 mb-3 justify-center">
          <button type="reset" className="btn btn-sm btn-accent  btn-outline">
            Cancelar
          </button>
          <button type="submit" className="btn btn-sm btn-primary"
          // disabled={Number(questionCount) >= 3}
          >
            Enviar
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}