import { FaRegCommentAlt } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa6";
import { Link } from "react-router";
import type { Video } from "~/models/video.server";

const VideoListCard = ({ video }: { video: Video }) => {
  return (
    <div className="card w-[98%] bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <Link to={`video/${video.id}`} viewTransition>
          <img src={`https://i.ytimg.com/vi/${video.url}/sddefault.jpg`} alt="" className="rounded-xl aspect-video object-cover" width={300} />
        </Link>
      </figure>
      <div className="card-body">
        <h2 className="card-title text-primary mb-5">
          <Link to={`video/${video.id}`} viewTransition>{video.title}</Link>
        </h2>
        <div className=" divider"></div>
        <div className="text-secondary flex flex-col md:flex-row gap-3">
          <div className="flex gap-4 text-xl">
            <FaRegHeart size={30} />
            <div className="">{video.likes?.length}</div>
          </div>
          <div className="flex gap-4 text-xl">
            <FaRegCommentAlt size={30} />
            <div className="">{video?.comments?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoListCard;
