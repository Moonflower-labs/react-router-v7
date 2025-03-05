import { FaRegCommentAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { href, Link, useLocation } from "react-router";
import type { Post } from "~/models/post.server";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon,
  XIcon,
  TelegramIcon,
  TelegramShareButton,
} from 'react-share';

export function PostListCard({ post, baseUrl }: { post: Post, baseUrl: string }) {
  const { pathname } = useLocation()
  const postUrl = `${baseUrl}/${pathname}/members/personality/post/${post.id}`;

  return (
    <div className="card w-[98%] sm:max-w-96 bg-base-100 shadow-xl">
      <figure className="px-10 pt-10">
        <Link to={href("/members/personality/post/:id", { id: post.id })} viewTransition>
          <img src={"/flower.png"} alt="logo" className="rounded-xl aspect-video" width={300} />
        </Link>
      </figure>
      <div className="card-body">
        <h2 className="card-title text-primary mb-5">
          <Link to={href("/members/personality/post/:id", { id: post.id })} viewTransition> {post?.title}</Link>
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
        <div className="flex gap-2 mt-4 justify-end">
          <TelegramShareButton url={postUrl} title={post.title}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
          <FacebookShareButton url={postUrl} title={post.title}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={postUrl} title={post.title}>
            <XIcon size={32} round />
          </TwitterShareButton>
          <WhatsappShareButton url={postUrl} title={post.title}>
            <WhatsappIcon size={30} round />
          </WhatsappShareButton>
        </div>
      </div>
    </div>
  );
}
