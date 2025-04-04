import { useFetcher } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/about";
import { FadeInComponent } from "~/components/framer-motion/FadeInComponent";
import { createReview, getReviews, type Review } from "~/models/review.server";
import { toast } from "react-toastify";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";
import ReviewsSection from "./reviews";
import { getUserId } from "~/middleware/sessionMiddleware";
import { Toaster } from "~/components/framer-motion/Toaster";

export const meta: Route.MetaFunction = () => {
  return [{ title: "La Flor Blanca: About" }, { name: "description", content: "Health and wellbeing" }];
};

export async function loader({ }: Route.LoaderArgs) {
  // Retutn the reviews promise
  const reviews = getReviews()
  return { reviews };
}


export async function action({ request, context }: Route.ActionArgs) {
  // Handle review creation
  const userId = getUserId(context);
  const formData = await request.formData();
  const text = formData.get("text") as string;
  const score = Number(formData.get("score"));

  if (text?.trim() === "" || !text) {
    return { error: "Debes de escribir algo en tu review 😁" };
  }
  if (!userId) {
    return { error: "Parece que no has iniciado sessión 🤔" };
  }
  await createReview({ userId, text, score });

  return { message: "Gracias por tu opinión.", success: true };
}

export default function About({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher({ key: "review" });

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state !== "idle" && fetcher?.data?.message) {
      toast.success(<Toaster message={fetcher.data.message} />);
    }
  }, [fetcher.data]);


  return (
    <>
      <FadeInComponent>
        <h1 className="text-4xl font-bold text-center text-primary py-6">Sobre La Flor Blanca</h1>
      </FadeInComponent>
      <FadeInComponent>
        <div className="p-2 pt-8">
          <div className="p-[0.12rem] mx-auto md:w-1/2 bg-gradient-to-r from-primary/80 via-pink-400 to-secondary/80 rounded-lg">
            <div className="rounded-md overflow-hidden">
              <img src={"flower.png"} alt="Your Image" className="w-full aspect-video" />
            </div>
          </div>
        </div>
      </FadeInComponent>
      <section className="p-6 md:w-[75%] mx-auto flex flex-col gap-4 text-center" data-testid="home">
        <FadeInComponent>
          <p className="text-2xl">
            <span> Hola a todos almas oscuras y luminosas, </span>
            bienvenidos a mi rincón de Preguntas y Respuestas de una manera más privada y a nuestro contenido especial para miembros.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-2xl">
            Espero que este nuevo paso os de la confianza suficiente para perder la vergüenza y hacer esas preguntas que tanto anheláis de una manera más
            anónima. Vuestro nombre, email o nombre de usuario nunca será mencionado; sólo me remitiré a contestar a la pregunta en cuestión. Como la
            personalidad que soy entiendo la importancia del anonimato en estas materias tan sensibles.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-2xl">
            Contestaré por escrito, con un audio, video o en directo según sea conveniente y será añadido al plan que sois miembro. Recibiréis las Respuestas a
            las Preguntas de Tarot con un video enlace a vuestro email privado de vuestra membresía todos aquellos que hayan consultado previamente y estén
            suscritos dentro del plan Alma y Espíritu.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-2xl">
            Para recordaros la temática a la que nos dedicamos, aquí os dejo estos videos de introducción para que podáis perfilar vuestras preguntas
            adecuadamente y alinearlas con el propósito de nuestra misión.
          </p>
        </FadeInComponent>
      </section>
      <section className="grid md:grid-cols-2 items-end gap-4 mb-4 px-2 pb-10">
        <FadeInComponent>
          <div className="flex flex-col m-10">
            <p className="text-primary text-2xl font-bold text-center mb-3">Gracias por llegar Aquí: Miembros</p>
            <YoutubeVideo videoId="v726U5jRots" />
          </div>
        </FadeInComponent>

        <FadeInComponent>
          <div className="flex flex-col m-10">
            <p className="text-primary text-2xl font-bold text-center mb-3">Su Historia "Nuestra Historia"</p>
            <YoutubeVideo videoId="Lj5Q6_o_yyw" />
          </div>
        </FadeInComponent>
        <div className="col-span-full">
          <FadeInComponent>
            <div className="flex flex-col m-10">
              <p className="text-primary text-2xl font-bold text-center mb-3">Conversaciones Anónimas</p>
              <YoutubeVideo videoId="4GIIhZK1vaY" className="md:w-1/2 mx-auto" />
            </div>
          </FadeInComponent>
        </div>
      </section>

      <div className="divider w-[85%] mx-auto"></div>
      <ReviewsSection reviews={loaderData?.reviews as Promise<Review[]>} />
    </>
  );
}

