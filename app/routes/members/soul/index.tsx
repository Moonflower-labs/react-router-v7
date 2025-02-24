import type { Route } from "./+types/index";
import { useEffect } from "react";
import { fetchVideos } from "~/models/video.server";
import VideoListCard from "~/components/members/VideoListCard";
import { YoutubeVideo } from "~/components/shared/YoutubeVideo";
import { FilterComponent } from "~/components/members/FilterComponent";
import { Paginator } from "~/components/members/Pagination";
import { fetchCategories } from "~/models/category.server";


export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("search");
  let pickedCategories = url.searchParams.getAll("categories") || [];

  const page = Number(url.searchParams.get("page") || 1);
  const pageSize = Number(url.searchParams.get("pageSize") || 10);
  const { videos, pagination } = await fetchVideos({ section: "Soul", title: q, categories: pickedCategories, page, pageSize });
  const categories = await fetchCategories();

  return { videos, pagination, categories, q };
}

export default function Soul({ loaderData }: Route.ComponentProps) {
  const videos = loaderData?.videos;
  const pagination = loaderData?.pagination;

  useEffect(() => {
    // Function to handle touchstart events
    const handleTouchStart = (e: { defaultPrevented: unknown; preventDefault: () => void }) => {
      console.log(e.defaultPrevented); // will be false initially
      e.preventDefault(); // this won't have any effect since we are adding the listener as passive
      console.log(e.defaultPrevented); // will still be false
    };

    // Add the event listener
    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  return (
    <div className="text-center pt-2 px-1">
      <h1 className="text-primary text-4xl mb-3 font-semibold">Alma</h1>
      <div className="grid grid-cols-1 md:w-1/2 mx-auto mb-4">
        <p className="text-3xl mb-3">¡Bienvenidos Almas!</p>
        <YoutubeVideo videoId="gVKPExy_MbI" />
      </div>
      <div className="text-2xl mx-auto text-center">
        <div className="mb-4">
          Recibirás contenido especial que nutra tu Alma y Personalidad en todas sus formas, más una pregunta mensual de tarot incluida cuya respuesta será
          enviada privadamente al email de tu suscripción.
        </div>
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

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto mb-4" id="podcasts">
        <div className="m-4" >
          <p className="text-3xl mb-3">Respuestas de audio</p>
          <iframe
            title="podcasts-soul"
            className="aspect-video rounded-lg"
            height="390"
            width="100%"
            seamless={true}
            src="https://share.transistor.fm/e/respuestas-alma/playlist"
            referrerPolicy="no-referrer"
            loading="lazy"></iframe>
        </div>
        <div className="m-4">
          <p className="text-3xl mb-3">Contenido sorpresa</p>
          <iframe
            title="podcasts"
            className="aspect-video rounded-lg"
            height="390"
            width="100%"
            seamless={true}
            src="https://share.transistor.fm/e/contenido-sorpresa-alma-y-espiritu/playlist"
            referrerPolicy="no-referrer"
            loading="lazy"></iframe>
        </div>
      </section>
      <section className="" id="videos">
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
