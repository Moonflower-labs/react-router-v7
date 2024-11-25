import { type MetaFunction, useFetcher, useLocation } from "react-router";
import { useEffect } from "react";
import type { Route } from "./+types/home";
import { getUserId } from "~/utils/session.server";
import { FadeInComponent } from "~/components/framer-motion/FadeInComponent";
import SubscriptionPlans from "./SubscriptionPlans";
import ReviewsSection from "./reviews";
import { createReview, getReviews, Review } from "~/models/review.server";
import { toast } from "react-toastify";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";

export const meta: MetaFunction = () => {
  return [{ title: "La Flor Blanca: Home" }, { name: "description", content: "Health and wellbeing" }];
};

export function loader() {
  // Retutn the reviews promise
  return getReviews();
}

export async function action({ request }: Route.ActionArgs) {
  // Handle review creation
  const userId = await getUserId(request);
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

export default function Home({ loaderData, actionData }: Route.ComponentProps) {
  const { pathname, hash } = useLocation();
  const fetcher = useFetcher({ key: "review" });

  useEffect(() => {
    const sectionId = hash.substring(1); // Extract section ID from hash fragment
    const targetSection = document.getElementById(sectionId); // Get the target section element

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" }); // Smooth scroll to the target section
    }
  }, [pathname, hash]);

  useEffect(() => {
    if (fetcher?.data?.success && fetcher.state !== "idle" && fetcher?.data?.message) {
      toast.success(`${fetcher.data.message}`);
    }
  }, [fetcher.data]);

  console.log("Home page!");

  return (
    <>
      <div className="p-2 pt-8">
        <img key={"mainImage"} src={"flower.png"} alt="logo" className="rounded-md mx-auto aspect-video md:w-1/2 shadow-xl shadow-primary/15" />
      </div>
      <div className="p-6 md:w-[75%] mx-auto flex flex-col gap-4 text-center" data-testid="home">
        <FadeInComponent>
          <p className="text-3xl">
            <span> Hola a todos almas oscuras y luminosas, </span>
            bienvenidos a mi rincón de Preguntas y Respuestas de una manera más privada y a nuestro contenido especial para miembros.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-3xl">
            Espero que este nuevo paso os de la confianza suficiente para perder la vergüenza y hacer esas preguntas que tanto anheláis de una manera más
            anónima. Vuestro nombre, email o nombre de usuario nunca será mencionado; sólo me remitiré a contestar a la pregunta en cuestión. Como la
            personalidad que soy entiendo la importancia del anonimato en estas materias tan sensibles.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-3xl">
            Contestaré por escrito, con un audio, video o en directo según sea conveniente y será añadido al plan que sois miembro. Recibiréis las Respuestas a
            las Preguntas de Tarot con un video enlace a vuestro email privado de vuestra membresía todos aquellos que hayan consultado previamente y estén
            suscritos dentro del plan Alma y Espíritu.
          </p>
        </FadeInComponent>
        <FadeInComponent>
          <p className="text-3xl">
            Para recordaros la temática a la que nos dedicamos, aquí os dejo estos videos de introducción para que podáis perfilar vuestras preguntas
            adecuadamente y alinearlas con el propósito de nuestra misión.
          </p>
        </FadeInComponent>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-4 px-1 pb-10">
        <FadeInComponent>
          <YoutubeVideo videoId="v726U5jRots" />
        </FadeInComponent>
        <FadeInComponent>
          <YoutubeVideo videoId="Lj5Q6_o_yyw" />
        </FadeInComponent>
        <div className="col-span-full">
          <FadeInComponent>
            <YoutubeVideo videoId="4GIIhZK1vaY" className="md:w-1/2 mx-auto" />
          </FadeInComponent>
        </div>
      </div>
      <div className="divider w-[85%] mx-auto"></div>
      <FadeInComponent>
        <SubscriptionPlans />
      </FadeInComponent>
      <div className="divider w-[85%] mx-auto"></div>
      <FadeInComponent>
        <ReviewsSection reviews={loaderData as Review[]} />
      </FadeInComponent>
    </>
  );
}
