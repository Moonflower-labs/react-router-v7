import { FaRegCommentAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { Link } from "react-router";
import type { Post } from "~/models/post.server";

export function PostListCard({ post }: { post: Post }) {
  return (
    <div className="card w-[98%] sm:max-w-96 bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <img src={"flower.png"} alt="logo" className="rounded-xl aspect-video" width={300} />
      </figure>
      <div className="card-body">
        <h2 className="card-title text-primary mb-5">
          <Link to={`post/${post.id}`} viewTransition> {post?.title}</Link>
        </h2>
        <div className=" divider"></div>
        <div className="text-secondary flex flex-col md:flex-row gap-3">
          <div className="flex gap-4 text-xl">
            <FaStar size={30} />
            <div className="">{post?.averageRating?.toFixed(1)}</div>
          </div>
          <div className="flex gap-4 text-xl">
            <FaRegCommentAlt size={30} />
            <div className="">{post?.comments?.length || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
