import React, { use } from 'react'
import { Link } from 'react-router'
import type { UserWithProfile } from '~/models/profile.server'

export default function FavoritesCard({ promise }: { promise: Promise<UserWithProfile> }) {
    const profile = use(promise)
    const favorites = profile?.favorites;
    const favPosts = favorites?.filter((favorite) => favorite.postId !== null);
    const favVids = favorites?.filter((favorite) => favorite.videoId !== null);

    return (
        <div className="rounded-lg border shadow-lg p-4">
            <h2 className="text-xl text-center text-primary font-semibold py-3">
                <Link to={"favorites"} className="link link-primary" viewTransition>
                    Mis favoritos
                </Link>
            </h2>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                    <span>Post favoritos </span>
                    <span className="badge badge-primary badge-outline">{favPosts?.length}</span>
                </div>
                <div className="flex justify-between">
                    <span>Videos favoritos </span>
                    <span className="badge badge-primary badge-outline">{favVids?.length}</span>
                </div>
            </div>
        </div>
    )
}


export function FavoritesSkeleton() {
    return (
        <div className="rounded-lg border shadow-lg p-4 text-center flex flex-col justify-between">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="skeleton h-5 w-32"></div>
                    <div className='flex justify-between w-full'>
                        <div className="skeleton h-4 w-32"></div>
                        <div className="skeleton h-4 w-5"></div>
                    </div>
                    <div className='flex justify-between w-full'>
                        <div className="skeleton h-4 w-40"></div>
                        <div className="skeleton h-4 w-5"></div>
                    </div>
                    <div className="h-4 w-full rounded-lg"></div>
                </div>
            </div>
            <div className='flex justify-end'>
                <div className="skeleton h-6 w-6"></div>
            </div>
        </div>
    )
}