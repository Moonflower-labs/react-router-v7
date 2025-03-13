import type { Video } from "~/models/video.server";
import { formatDayTime } from "../../utils/format";

const VideoComponent = ({ video }: { video: Video }) => {
  return (
    <div className="flex flex-col items-center">
      <iframe
        className="aspect-video w-[85%] rounded-md mb-6"
        src={`https://www.youtube-nocookie.com/embed/${video?.url}`}
        title={video.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
        allowFullScreen
        loading="lazy"
      />
      <p className="text-xl mb-4">La Flor Blanca {formatDayTime(video.createdAt).split(" a las ")[0]}</p>
    </div>
  );
};

export default VideoComponent;
