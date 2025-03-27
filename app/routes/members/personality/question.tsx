import { useEffect, useRef, useState } from "react";
import { data, useFetcher } from "react-router";
import type { Route } from "./+types/question";
import { createBasicQuestion, editBasicInfo, fetchBasicInfo, getQuestionCount, incrementQuestionCount, saveBasicInfo } from "~/models/question.server";
import { toast } from "react-toastify";
import ActionError from "~/components/framer-motion/ActionError";
import { getUserId } from "~/middleware/sessionMiddleware";
import { Toaster } from "~/components/framer-motion/Toaster";


export async function loader({ context }: Route.LoaderArgs) {
  try {
    const userId = getUserId(context);
    const basicInfo = await fetchBasicInfo(userId)

    const { basicQuestionCount } = (await getQuestionCount({ userId, section: "basic" })) as { basicQuestionCount: number };

    return { basicQuestionCount, basicInfo };
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
  const questionCount = Number(formData?.get("questionCount")) ?? 3;

  if (questionCount >= 3) {
    return { success: false, error: "Ya has usado el máximo número de preguntas este mes" };
  }
  const intent = formData.get("intent");

  switch (intent) {
    case "basicInfo": {
      // add basic info to db
      const name = formData.get("name");
      const ageGroup = formData.get("age_group");
      const gender = formData.get("gender");
      const country = formData.get("country");
      const city = formData.get("city");
      const mediaEntries = formData.getAll("media").toString();
      const media = mediaEntries.replace("other", "") + `${formData.get("another") ? "," + formData.get("another") : ""}`;
      // validate input data
      const errors = {
        name: !name || name.toString().length < 2 ? "Debes dar un nombre" : null,
        ageGroup: ageGroup ? null : "Elige un grupo de edad",
      };
      // return data if we have errors
      const hasErrors = Object.values(errors).some(errorMessage => errorMessage);
      if (hasErrors) {
        return { errors };
      }
      const data = {
        name, ageGroup, gender, country, city, media
      }
      try {
        if (request.method === "PATCH") {
          await editBasicInfo({ userId, data })
        } else {
          await saveBasicInfo({ userId, data })
        }

      } catch (error) {
        console.error(error);
        break;
      }
      return { success: true, message: "Información guardada" }
    }
    case "question": {
      // check for user basic info
      const basicInfo = await fetchBasicInfo(userId)
      const name = basicInfo?.name;
      const ageGroup = basicInfo?.ageGroup;
      const subject = formData.get("subject");
      const text = formData.get("text");
      const gender = basicInfo?.gender;
      const country = basicInfo?.country;
      const city = basicInfo?.city;
      const media = basicInfo?.media;

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
      // validate input data + provide feedback
      const errors = {
        subject: subject ? null : "Elige un tema",
        text: text ? null : "Escribe una pregunta",
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
        break;
      }
    }
    default:
      return {}
  }

}

export default function BasicQuestion({ loaderData }: Route.ComponentProps) {
  const questionCount = loaderData?.basicQuestionCount;


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
      <h2 className="text-2xl">Información Básica</h2>
      <BasicInfo basicInfo={loaderData?.basicInfo} />
      <h2 className="text-2xl py-4">Tu Pregunta</h2>
      <QuestionForm questionCount={Number(questionCount)} />
    </div>
  );
}

const QuestionForm = ({ questionCount }: { questionCount: number }) => {
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && fetcher.data.success) {
      formRef.current?.reset(); // Reset the form
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data?.success && fetcher.data?.message) {
        toast.success(<Toaster message={fetcher.data?.message} />);
      }
      if (!fetcher.data?.success && fetcher.data?.error) {
        toast.error(<Toaster message={fetcher.data?.error} />);
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

  return (
    <fetcher.Form ref={formRef} method="post" id="question" className="p-2 rounded-xl max-w-xl mx-auto shadow-lg border border-base-300">
      <input type="hidden" name="questionCount" value={questionCount} />
      <input type="hidden" name="intent" value={"question"} />
      <div className="p-8 flex flex-col justify-center items-center gap-5">
        <div className="mb-4">
          <div className="font-bold text-xl mb-3">¿Tu pregunta es sobre Limpiezas, Emociones y Sentimientos Discordantes, Ataques Psíquicos o Habilidades Psíquicas?</div>
          <div className="flex flex-col gap-3 justify-center md:w-fit items-end mx-auto px-4 w-sm">
            <label className="label w-full justify-between">
              <span>Limpiezas</span>
              <input type="radio" name="subject" className="radio radio-primary radio-sm" value="Limpiezas" />
            </label>

            <label className="label w-full justify-between">
              <span>Emociones y Sentimientos Discordantes</span>
              <input type="radio" name="subject" className="radio radio-primary radio-sm" value="Emociones" />
            </label>
            <label className="label w-full  justify-between">
              <span>Ataques Psíquicos</span>
              <input type="radio" name="subject" className="radio radio-primary radio-sm" value="Ataques Psíquicos" />
            </label>
            <label className="label w-full justify-between">
              <span>Habilidades Psíquicas</span>
              <input type="radio" name="subject" className="radio radio-primary radio-sm" value="Habilidades Psíquicas" />
            </label>
            <label className="label w-full justify-between">
              <span>
                Otro <span className="font-bold ms-1 text-xs">(siguiendo la línea de nuestro contenido)</span>{" "}
              </span>
              <input type="radio" name="subject" className="radio radio-primary radio-sm" value="Other" />
            </label>
          </div>
          {errors?.subject && <ActionError actionData={{ error: errors.subject }} />}
        </div>

        <fieldset className="mb-4">
          <legend className="fieldset-legend text-xl mb-3">¿Qué duda tienes o te interesa saber sobre este tema?</legend>
          <textarea className="textarea textarea-lg h-24 mb-2 w-full" placeholder="Escribe tu pregunta aqui..." name="text"></textarea>
          {errors?.text && <ActionError actionData={{ error: errors.text }} />}
        </fieldset>
      </div>
      <div className="flex gap-3 mb-3 justify-center">
        <button type="reset" className="btn btn-accent  btn-outline">
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary"
          disabled={fetcher.state === "submitting" || Number(questionCount) >= 3}
        >
          {fetcher.state === "submitting" ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </fetcher.Form>
  )
}

const BasicInfo = ({ basicInfo }: { basicInfo: Awaited<ReturnType<typeof fetchBasicInfo>> | null | undefined }) => {
  const fetcher = useFetcher();
  const errors = fetcher.data?.errors;
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isEdit, setIsEdit] = useState(false)

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
        toast.success(<Toaster message={fetcher.data?.message} />);
        setIsEdit(false)
      }
      if (!fetcher.data?.success && fetcher.data?.error) {
        toast.error(<Toaster message={fetcher.data?.error} />);
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

  return (

    <>
      {!basicInfo || isEdit ? (
        <>
          <p className="p-4 max-w-lg mx-auto">Esta información es necesaria para respoder a tu pregunta. Como esta información tiende a ser la misma, la recordaremos para que no tengas que rellenarla con cada pregunta. Si necesitas actualizar algún dato siempre podrás editarlo.</p>

          <fetcher.Form ref={formRef} method={isEdit ? "PATCH" : "POST"} id="question" className="p-2 rounded-xl max-w-xl mx-auto shadow-lg border border-base-300">
            <input type="hidden" name="intent" value={"basicInfo"} />
            <div className="p-8 flex flex-col justify-center items-center gap-5">
              <label className="input input-lg">
                <span className="label">Nombre</span>
                <input type="text" name="name" defaultValue={basicInfo?.name || ""} placeholder="" />
              </label>
              {errors?.name && <ActionError actionData={{ error: errors.name }} />}

              <div className="mb-6">
                <div className="font-bold text-xl mb-3">¿Dónde has oído hablar de nosotros?</div>
                <div className="flex flex-col flex-wrap gap-3 items-end w-xs mx-auto">
                  {mediaOptions.map(option => (
                    <label key={option.value} className="label gap-3 w-full justify-between">
                      {option.label}
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" defaultChecked={basicInfo?.media.includes(option.value)} value={option.value} name="media" />
                    </label>
                  ))}
                  <label className="label gap-3 w-full justify-between">
                    <span>Otro</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      value="otro"
                      name="media"
                      onChange={event => {
                        handleRadioChange(event);
                      }}
                    />
                  </label>
                  <input
                    type="text"
                    placeholder="Especifica aquí..."
                    className="input input-lg w-full max-w-xs disabled:bg-primary/10"
                    name={"another"}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="font-bold text-xl mb-3">¿Cúal es tu grupo de edad?</div>
                <div className="flex flex-col gap-3 items-end w-xs mx-auto">
                  {ageOptions.map(option => (
                    <label key={option.value} className="label gap-3 w-full justify-between">
                      <span>{option.label}</span>
                      <input type="radio" name="age_group" className="radio radio-sm radio-primary" defaultChecked={basicInfo?.ageGroup === option.value} value={option.value} />
                    </label>
                  ))}
                </div>
                {errors?.ageGroup && <ActionError actionData={{ error: errors.ageGroup }} />}
              </div>
              <label className="select select-lg">
                <span className="label">Género</span>
                <select name="gender" defaultValue={basicInfo?.gender} required>
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                </select>
              </label>

              <label className="input input-lg">
                <span className="label">País</span>
                <input type="text" name="country" placeholder="País" defaultValue={basicInfo?.country || ""} required />
              </label>
              <label className="input input-lg">
                <span className="label">Ciudad</span>
                <input type="text" name="city" placeholder="Ciudad" defaultValue={basicInfo?.city || ""} required />
              </label>
            </div>
            <div className="flex gap-3 mb-3 justify-center">
              <button type="reset" className="btn btn-accent  btn-outline" onClick={isEdit ? () => setIsEdit(false) : () => { }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary"
                disabled={fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </fetcher.Form>
        </>
      ) : (
        <div>
          <div className="flex flex-col gap-1.5 mb-4">
            <div>Nombre: {basicInfo?.name}</div>
            <div>Género: {basicInfo?.gender}</div>
            <div>Grupo de edad: {basicInfo?.ageGroup}</div>
            <div>País: {basicInfo?.country}</div>
            <div>Ciudad: {basicInfo?.city}</div>
            <div>{basicInfo?.media.replaceAll(",", ", ")}</div>
          </div>
          <button className="btn btn-info" onClick={() => setIsEdit(true)}>Editar</button>
        </div>
      )}
    </>
  )

}

const mediaOptions = [
  { label: "Youtube", value: "Youtube" },
  { label: "Telegram", value: "Telegram" },
  { label: "Instagram", value: "Instagram" },
  { label: "Facebook", value: "Facebook" },
  { label: "LinkedIn", value: "LinkedIn" },
  { label: "Anuncio", value: "Anuncio" },
  { label: "De boca en boca", value: "De boca en boca" },
]
const ageOptions = [
  { label: "De 16 a 25 años", value: "16-25" },
  { label: "De 26 a 35 años", value: "26-35" },
  { label: "De 36 a 45 años", value: "36-45" },
  { label: "De 46 a 55 años", value: "46-55" },
  { label: "De 56 a 65 años", value: "56-65" },
  { label: "De 66 a 55 años", value: "66-75" },
  { label: "Mayor de 75 años", value: ">75" },
]