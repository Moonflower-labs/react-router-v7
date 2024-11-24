import { data, Form, Link, Outlet, useNavigate, useSubmit } from "react-router";
import type { Route } from "./+types/list";
import { formatDate } from "~/utils/format";
import { ImBin } from "react-icons/im";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Paginator } from "~/components/members/Pagination";
import { deleteQuestion, getQuestions } from "~/models/question.server";
import { FaEye } from "react-icons/fa";
import { Question, PremiumQuestion } from "@prisma/client";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  const section = url.searchParams.get("section") ?? "Personalidad";

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 3);
  const { questions, pagination } = await getQuestions({ page, pageSize });
  console.log(section);
  return { questions, pagination, q: title, section };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const questionId = formData.get("questionId");
  const section = formData.get("section");

  const isPremium = typeof section === "string" && section.trim() !== "";

  if (!questionId) {
    throw data({ message: "No question ID provided" }, { status: 400 });
  }
  if (isPremium) {
    //  Delete the Premium Question
    await deleteQuestion(String(questionId), isPremium);
  } else {
    //  Delete the question
    await deleteQuestion(String(questionId));
  }

  return { success: true };
}

export default function ListQuestions({ loaderData, actionData }: Route.ComponentProps) {
  const questions = loaderData?.questions as (Question | PremiumQuestion)[];
  const submit = useSubmit();
  const navigate = useNavigate();
  const section = loaderData?.section;

  useEffect(() => {
    if (actionData?.success) {
      toast.success("Pregunta eliminada");
      navigate("/admin/questions");
    }
  }, [actionData]);

  const handleSbubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const questionId = form.questionId.value;

    toast.warn(
      <div>
        <span>Quieres borrar esta pregunta?</span>
        <div className="flex justify-center gap-5 mt-3">
          <button
            onClick={() => {
              toast.dismiss();
              console.log("Submitting form:", event.target);
              submit({ questionId }, { method: "POST" });
            }}
            className="btn btn-sm btn-primary">
            Yes
          </button>
          <button onClick={() => toast.dismiss()} className="btn btn-sm btn-primary">
            No
          </button>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        draggable: false
      }
    );
  };

  return (
    <div>
      <h1 className="text-3xl text-primary flex justify-center items-center gap-4 my-5">
        Preguntas de <span className="font-bold">{section === "live" ? "Directo" : section === "tarot" ? "Tarot" : "Personalidad"}</span>
        <span className="badge badge-primary">{loaderData?.pagination?.totalCount}</span>
      </h1>
      <label className="flex gap-3 justify-center items-center mb-4">
        <span>Sección</span>
        <Form onChange={e => submit(e.currentTarget)} className="my-auto">
          <select className="select select-bordered select-primary" name="section" defaultValue={section}>
            <option value="basic">Personalidad</option>
            <option value="tarot">Tarot</option>
            <option value="live">Directo</option>
          </select>
        </Form>
      </label>
      {questions?.length ? (
        questions.map((question, index) => (
          <div
            key={question.id}
            className="flex flex-col md:flex-row justify-between items-center gap-6 p-3 border border-primary/20 rounded-lg shadow-md mb-3 lg:w-2/3 mx-auto">
            <div className="flex justify-between items-center w-full">
              <span>
                {index + 1}. {question.name}{" "}
              </span>
              <span className="me-5">{formatDate(question.createdAt)}</span>
            </div>
            <div className="flex gap-3 items-center">
              <Link to={`${question.id}/detail`} className="btn btn-sm btn-outline btn-success" viewTransition>
                <FaEye size={24} />
              </Link>
              <Form method="delete" onSubmit={handleSbubmit}>
                {"section" in question && <input type="hidden" name="section" value={question.section} />}
                <button type="submit" name="questionId" value={question.id} className="btn btn-sm btn-outline btn-error">
                  <ImBin size={24} />
                </button>
              </Form>
            </div>
          </div>
        ))
      ) : (
        <div className="flex gap-4 justify-center items-center">
          <span>No hay ninguna pregunta de {section === "tarot" ? "Tarot" : section === "live" ? "Directo" : "Personalidad"} todavía 😩 </span>
        </div>
      )}
      <div className="text-center">
        <Paginator pagination={loaderData?.pagination} />
      </div>
      <Outlet />
    </div>
  );
}
