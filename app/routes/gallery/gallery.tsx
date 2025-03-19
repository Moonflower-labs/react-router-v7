import { use } from 'react'
import { NavLink } from 'react-router'

export function ImageGallery({ imagePromise }: { imagePromise: Promise<any> }) {
    const images = use(imagePromise);

    return (
        <div className="gallery grid gap-5 justify-center items-center grid-cols-2 lg:grid-cols-3 mb-4">
            {images?.map((image: any) => (
                <NavLink
                    key={image.public_id}
                    to={`/gallery/image/${encodeURIComponent(image.public_id)}`}
                    viewTransition
                    className={"w-fit mx-auto p-2 md:p-10"}
                    prefetch='viewport'>
                    {({ isTransitioning }) => (
                        <img
                            src={image.url}
                            alt={image.resource_type}
                            className={`gallery-item w-full aspect-square object-cover object-top m-auto rounded-lg hover:rotate-2 transition-all ease-in-out duration-500`}
                            style={{
                                viewTransitionName: isTransitioning
                                    ? "full-image"
                                    : "none",
                            }}
                        />
                    )}
                </NavLink>
            ))}
        </div>
    )
}

export function ImageGallerySkeleton() {
    const images = Array.from({ length: 8 }, (_, index) => index + 1)
    return (
        <div className="gallery grid gap-5 justify-center items-center grid-cols-2 lg:grid-cols-3 mb-4">
            {images.map((index) => (
                <div key={`imageSkeleton-${index}`} className="w-full mx-auto p-2 md:p-10">
                    <div className="skeleton bg-base-200 w-full h-42 md:h-96 mx-auto"></div>
                </div>
            ))}
        </div>
    )
}
