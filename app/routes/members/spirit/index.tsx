import { Link } from "react-router";
import type { Route } from "./+types/index";
import { fetchVideos, Video } from "~/models/video.server";
import VideoListCard from "~/components/members/VideoListCard";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";
import { Paginator } from "~/components/members/Pagination";
import { FilterComponent } from "~/components/members/FilterComponent";
import { fetchCategories } from "~/models/category.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("search");
  let pickedCategories = url.searchParams.getAll("categories") || [];

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 6);
  const { videos, pagination } = await fetchVideos({ section: "spirit", title: q, categories: pickedCategories, page, pageSize });
  const categories = await fetchCategories();

  return { videos, pagination, categories, q };
}

export default function Spirit({ loaderData }: Route.ComponentProps) {
  const videos = loaderData?.videos as Video[];
  const pagination = loaderData?.pagination;

  return (
    <div className="text-center pt-5 px-1">
      <div className="pt-10 mb-8 font-semibold flex items-center justify-center relative">
        <h2 className="text-primary text-4xl absolute md:left-1/2 transform -translate-x-1/2">Espíritu</h2>
        <span className="absolute right-0">
          <Link to={"/spirit/live"} className="btn btn-sm btn-primary">
            Sesiones en directo
          </Link>
        </span>
      </div>

      <div className="grid grid-cols-1 md:w-1/2 mx-auto mb-4">
        <p className="text-3xl mb-2">¡Bienvenidos Espíritus!</p>
        <YoutubeVideo videoId="be5-o9k9zdg" />
      </div>

      <div className="text-2xl mx-auto text-center">
        <div className="mb-4">
          Recibirás contenido especial que nutra tu Espíritu, Alma y Personalidad en todas sus formas, más una pregunta mensual de tarot incluida cuya respuesta
          será enviada privadamente a tu email de tu suscripción.
        </div>
        <p className="mb-3">
          Además con esta suscripción tendrás acceso a contenido en directo de Preguntas y Respuestas, Tarot o Mi Propio Proceso una vez al mes y/o lo que
          espontáneamente surja.
        </p>
        <p className="mb-3">
          Si quieres ver la pregunta más detallada y completa del episodio dale a &quot;more info&quot;. Para comentar o darnos tu opinión puedes hacerlo en{" "}
          <a
            className="link link-secondary"
            href="https://api.whatsapp.com/send/?phone=34638006861&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer">
            Whatsapp
          </a>{" "}
          y el grupo de{" "}
          <a className="link link-secondary" href="https://t.me/+x1oGX2L_o_Y5NWE0" target="_blank" rel="noreferrer">
            Telegram
          </a>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto mb-4">
        <div className="m-4">
          <p className="text-3xl mb-3">Respuestas de audio</p>
          <iframe
            title="respuestas-espiritu"
            className="aspect-video rounded-lg"
            height="390"
            width="100%"
            seamless={true}
            src="https://share.transistor.fm/e/respuestas-espiritu/playlist"
            referrerPolicy="no-referrer"
            loading="lazy"></iframe>
        </div>
        <div className="m-4">
          <p className="text-3xl mb-3">Contenido sorpresa</p>
          <iframe
            title="contenido-sorpresa-alma-y-espiritu"
            className="aspect-video rounded-lg"
            height="390"
            width="100%"
            seamless={true}
            src="https://share.transistor.fm/e/contenido-sorpresa-alma-y-espiritu/playlist"
            referrerPolicy="no-referrer"
            loading="lazy"></iframe>
        </div>
      </div>
      <section className="">
        <p className="text-3xl pb-3">Respuestas de video</p>
        <FilterComponent />
        {videos?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-content-center pb-3">
            {videos.map(video => (
              <VideoListCard video={video} key={video.id} />
            ))}
          </div>
        ) : (
          <div className="text-xl pb-3">No hay videos disponibles</div>
        )}
        <Paginator pagination={pagination} />
      </section>
    </div>
  );
}
