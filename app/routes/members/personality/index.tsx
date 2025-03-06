import { Paginator } from "~/components/members/Pagination";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";
import type { Route } from "./+types/index";
import { fetchPostsWithAverageRating, type Post } from "~/models/post.server";
import { PostListCard } from "../PostListCard";
import { FilterComponent } from "~/components/members/FilterComponent";
import { fetchCategories } from "~/models/category.server";

// todo: make middleware function to check for the user subscription

export async function loader({ request }: Route.LoaderArgs) {

  const url = new URL(request.url);
  const title = url.searchParams.get("search");
  let pickedCategories = url.searchParams.getAll("categories") || [];

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 3);
  const { posts, pagination } = await fetchPostsWithAverageRating({ title, categories: pickedCategories, page, pageSize });
  const categories = await fetchCategories();

  return { posts, pagination, categories, q: title };
}


export default function Personality({ loaderData }: Route.ComponentProps) {
  const data = loaderData?.posts as Post[];
  const { pagination } = loaderData;

  return (
    <main className="text-center px-1 pt-2" data-testid="personality-index">
      <h1 className="text-primary text-4xl mb-3 font-semibold">Personalidad</h1>
      <div className="grid grid-cols-1 md:w-1/2 mx-auto mb-4">
        <p className="text-3xl mb-4">¡Bienvenidos Personalidades!</p>
        <YoutubeVideo videoId="7158ShreVEU" />
      </div>
      <div className="text-center mb-4">Estos son ejemplos de preguntas y sugerencias de temáticas generalizadas por parte de los oyentes.</div>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
        {resources?.map(item => (
          <div key={item.videoId} className="flex flex-col m-10">
            <p className="h-10 mb-2">{item?.title}</p>
            <YoutubeVideo videoId={item?.videoId} />
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:w-1/2 mx-auto mb-10" id="podcasts">
        <p className="text-3xl mb-6">Respuestas de audio</p>
        <p className="mb-3">Si quieres ver la pregunta más detallada y completa del episodio dale a &quot;more info&quot;.</p>
        <iframe
          title="Podcasts"
          className="aspect-video rounded-lg"
          height="390"
          width="100%"
          seamless={true}
          src="https://share.transistor.fm/e/respuestas-personalidad/playlist"
          referrerPolicy="no-referrer"
          loading="lazy"></iframe>
      </section>
      <p className="text-3xl mb-5" id="blogs">Respuestas de Blog</p>
      <FilterComponent />
      {data?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 justify-items-center pb-4">
          {data.map(post => (
            <PostListCard post={post} key={post.id} />
          ))}
        </div>
      ) : (
        <div className="text-xl pb-3 text-center">No hay respuestas disponibles</div>
      )}
      <Paginator pagination={pagination} />
    </main>
  );
}

const resources = [
  {
    title: " El Mirto o Arrayán y sus usos para el amor",
    videoId: "dKXH2Tdttkg"
  },
  {
    title: "Los Cuatro Elementos 🔥🌬🌊⛰ y sus Colores🎨",
    videoId: "7Pi6W3Xnv5U"
  },
  {
    title: "Triada del Fuego🔥: Aries, Leo y Sagitario",
    videoId: "RqHO0WUlK2Y"
  },
  {
    title: "Triada de la Tierra🌋: Tauro, Virgo y Capricornio",
    videoId: "0b8onmHCsY4"
  },
  {
    title: "Triada del Aire🌬: Géminis, Libra y Acuario",
    videoId: "4-C-0JsUt1I"
  },
  {
    title: "Triada del Agua🌊: Cáncer, Escorpio y Piscis",
    videoId: "XTup4T4vVRw"
  },
  {
    title: "Narcisismo desde el Astral",
    videoId: "re4mncuNTD4"
  },
  {
    title: "Falsos Lectores de Energía y Guía para Detectarlos",
    videoId: "_jLz5sVcC2Y"
  }
];
