import { useFetcher, useLoaderData, useRouteLoaderData } from "react-router";
import { useRef, useEffect, useState, startTransition } from "react";
import { FaRegCommentAlt, FaReply } from "react-icons/fa";
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
        Comentarios <FaRegCommentAlt size={24} className="my-auto" />
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
      <fetcher.Form ref={formRef} method="post" action="/api/comments" className="w-full mx-auto pb-4 flex flex-col mt-4">
        <input type="hidden" name={fieldName} value={objectId} />
        <input type="hidden" name="action" value={action} />
        <textarea
          className="w-full textarea textarea-primary textarea-lg mb-4"
          placeholder={action === "reply" ? "Escribe tu respuesta al comentario" : "Escribe un comentario..."}
          name="text"
          rows={5}></textarea>
        <div className="flex justify-end gap-3 mt-2">
          <button type="reset" className="btn btn-primary btn-outline btn-sm" disabled={fetcher.state !== "idle"}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={fetcher.state !== "idle"}>
            Publicar
          </button>
        </div>
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
        <div className="badge badge-outline">
          <span className="me-3 font-bold">{comment?.user?.username}</span>
          <time className="text-xs opacity-50" title={formatDayTimeEs(comment.createdAt)}>{formatDistanceToNowEs(comment.createdAt)}</time>
        </div>
      </div>
      <div className="w-[90%] mx-auto mb-4">
        <div className="mb-4 text-start overflow-x-auto">{comment.content}</div>
        <div className="flex gap-4">
          {comment.user?.id === userId && deleteButton}
          {comment.replies !== undefined && (
            <button onClick={() => { startTransition(() => setIsopen(!isOpen)) }} title="Responder" className="text-primary cursor-pointer">
              <FaReply size={24} />
            </button>
          )}
          {likeButton && likeButton}
          <span className="text-primary font-bold">{comment?.likes?.length || 0}</span>
        </div>
        <AnimatePresence mode="wait">
          {isOpen && commentForm}
        </AnimatePresence>
        <Replies replies={comment.replies} userId={userId} />
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
    <>
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
    </>
  );
}

function DeleteButton({ object, id }: { object: string; id: string }) {
  const fetcher = useFetcher();

  return (
    <div>
      <fetcher.Form method="delete">
        <input type="hidden" name="object" value={object} />
        <button type="submit" name="id" value={id} className="cursor-pointer text-error" disabled={fetcher.state !== "idle"}>
          <ImBin size={24} title="Borrar mensage" />
        </button>
      </fetcher.Form>
    </div>
  );
}
