import { useFetcher, useLoaderData, useRouteLoaderData } from "react-router";
import { useRef, useEffect, useState, startTransition } from "react";
import { FaRegComment } from "react-icons/fa";
import { AnimatePresence, motion } from "motion/react";
import { formatDayTimeEs, formatDistanceToNowEs } from "~/utils/format";
import type { User } from "~/models/user.server";
import type { Comment, Reply } from "~/models/post.server";
import { Paginator } from "./Pagination";
import { LikeButton } from "./LikeButton";
import ActionError from "../framer-motion/ActionError";
import type { Pagination } from "~/models/post.server";
import type { Like } from "@prisma/client";
import { ImBin } from "react-icons/im";
import { IoSend } from "react-icons/io5";

interface CommentSectionProps {
  objectId: string;
  fieldName: string;
  // action: string
}

export default function Comments({ objectId, fieldName }: CommentSectionProps) {
  const user = useRouteLoaderData("root")?.user as User;
  const { comments, pagination } = useLoaderData() as { comments: Comment[]; pagination: Pagination };

  return (
    <div className="md:px-20">
      <h2 className="flex gap-4 align-middle text-primary justify-center font-semibold text-2xl mt-4 mb-3">
        Comentarios <FaRegComment size={24} className="my-auto" />
      </h2>
      <CommentForm objectId={objectId} fieldName={fieldName} action="comment" />
      <div className="text-center">
        {comments?.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                userId={user?.id}
                avatar={comment.user?.profile?.avatar || undefined}
                commentForm={<CommentForm objectId={comment.id} fieldName="comment" action="reply" />}
                likeButton={<LikeButton object="comment" id={comment.id} isLiked={comment?.likes?.some((like: Like) => like?.userId === user.id)} />}
                deleteButton={<DeleteButton object="comment" id={comment.id} />}
              />
              <div className="divider"></div>
            </div>
          ))
        ) : (
          <p className="text-xl text-center mb-6">Nadie ha comentado todavía.</p>
        )}
        <Paginator pagination={pagination} />
      </div>
    </div>
  );
}

interface CommentFormProps {
  objectId: string;
  fieldName: string;
  action: string;
}

export function CommentForm({ objectId, fieldName, action }: CommentFormProps) {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      formRef.current?.reset(); // Reset the form after a succesfull comment
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <motion.div
      key={`object-${objectId}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden">
      <fetcher.Form ref={formRef} method="post" action="/api/comments" className="w-[96%] mx-auto pb-4 flex flex-col mt-4">
        <input type="hidden" name={fieldName} value={objectId} />
        <input type="hidden" name="action" value={action} />
        <label className="input input-lg w-full mb-2">
          <input type="text" name="text" className="grow" placeholder={action === "reply" ? "Responde al comentario" : "Escribe un comentario..."} />
          <button type="submit" className="rounded-full p-1 disabled:bg-base-200 cursor-pointer shadow" disabled={fetcher.state !== "idle"}>
            <IoSend size={24} className="text-primary" />
          </button>
        </label>
        <ActionError actionData={fetcher?.data} />
      </fetcher.Form>
    </motion.div>
  );
}

interface CommentItemProps {
  comment: Comment | Reply;
  userId: string;
  avatar?: string;
  commentForm: React.ReactNode;
  likeButton: React.ReactNode;
  deleteButton: React.ReactNode;
}
function CommentItem({ comment, userId, avatar, commentForm, likeButton, deleteButton }: CommentItemProps) {
  const [isOpen, setIsopen] = useState(false);

  return (
    <motion.div
      key={`comment-${comment.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="mb-2 flex flex-col mt-2 w-full">
      <div className="flex gap-5 items-center mb-4">
        <div className="avatar float-start">
          <div className="w-10 rounded-full">
            <img alt="user avatar" src={`${avatar || "/avatars/dark-valentine.jpg"}`} />
          </div>
        </div>
        <div className="">
          <span className="badge badge-outline me-3 font-bold">{comment?.user?.username}</span>
          <time className="text-xs opacity-50" title={formatDayTimeEs(comment.createdAt)}>{formatDistanceToNowEs(comment.createdAt)}</time>
        </div>
      </div>
      <div className="w-[90%] mx-auto mb-4">
        <div className="mb-4 text-start overflow-x-auto">{comment.content}</div>
        <div className="flex gap-4">
          {comment.user?.id === userId && deleteButton}
          {comment.replies !== undefined && (
            <button onClick={() => { startTransition(() => setIsopen(!isOpen)) }} title="Respuestas" className="flex items-center gap-2 text-primary rounded-xl shadow-md py-1 px-2.5">
              <FaRegComment size={24} className="cursor-pointer" />
              {comment.replies.length}
            </button>
          )}
          <div className="flex justify-center items-center gap-2 text-primary rounded-xl shadow-md py-1 px-2.5">
            {likeButton && likeButton}
            <span className="text-primary font-bold">{comment?.likes?.length || 0}</span>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              {commentForm}
              <Replies replies={comment.replies} userId={userId} />
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface CommentRepliesProps {
  replies: Reply[];
  userId: string;
  avatar?: string;
}

function Replies({ replies, userId }: CommentRepliesProps) {
  const isReplyLiked = (reply: Reply, userId: string) => reply?.likes?.some((like: Like) => like?.userId === userId);

  return (
    <motion.div
      key={`replies-${replies[0]?.commentId}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden">
      {replies &&
        replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            userId={userId}
            avatar={reply.user?.profile?.avatar || undefined}
            commentForm={<CommentForm objectId={reply.id} fieldName="reply" action="reply" />}
            likeButton={<LikeButton object="reply" id={reply.id} isLiked={!!isReplyLiked(reply, userId)} />}
            deleteButton={<DeleteButton object="reply" id={reply.id} />}
          />
        ))}
    </motion.div>
  );
}

function DeleteButton({ object, id }: { object: string; id: string }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="delete" className="flex items-center rounded-xl shadow-md py-1 px-1.5">
      <input type="hidden" name="object" value={object} />
      <button type="submit" name="id" value={id} className="cursor-pointer text-error" disabled={fetcher.state !== "idle"}>
        <ImBin size={24} title="Borrar mensage" />
      </button>
    </fetcher.Form>
  );
}
