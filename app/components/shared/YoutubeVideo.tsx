import { useState } from "react";
import { FaPlayCircle } from "react-icons/fa";

export function YoutubeVideo({ videoId, className }: { videoId: string; className?: string }) {
  const [isFrameLoaded, setIsFrameLoaded] = useState<boolean>(false);

  return (
    <>
      {isFrameLoaded ? (
        <div className="">
          <iframe
            className={`aspect-video rounded-lg shadow-md ${className ? className : ""}`}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?si=16inDY65QTJli5hi`}
            height="100%"
            width="100%"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
            allowFullScreen
            loading="lazy"></iframe>
        </div>
      ) : (
        <div className={`hero shadow-xl ${className ? className : ""}`}>
          <img src={`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`} alt="" className="hero-overlay aspect-video rounded-lg w-full shadow-md" />
          <div className="card-body">
            {/* <h2 className="card-title"></h2> */}
            <div className="card-actions justify-center">
              <button className="btn btn-primary" onClick={() => setIsFrameLoaded(true)}>
                <FaPlayCircle size={25} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
