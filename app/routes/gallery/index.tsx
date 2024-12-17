import cloudinary from '~/integrations/cloudinary/service.server.js'
import type { Route } from './+types/index.tsx'
import { NavLink } from 'react-router'

export async function loader({ request }: Route.LoaderArgs) {
    const images = await cloudinary.api.resources({
        type: "upload",
        max_results: 20
    })
    return { images: images.resources, cloudName: process.env.CLOUD_NAME }
}


export default function Gallery({ loaderData }: Route.ComponentProps) {


    return (

        <main className="text-center min-h-screen p-4">
            <h1 className='text-primary text-3xl pt-3 mb-4'>Susurros de La Flor Blanca</h1>
            <p className='mb-4'>En esta sección verás...</p>
            {/* <div className="grid gap-6 justify-center items-center grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-4">
                {loaderData?.images && loaderData.images.map((image: any) =>
                    <div key={image.url} className="flex flex-col justify-center items-center gap-4">
                        <img src={image.secure_url} alt={image?.display_name} className="w-36 aspect-auto m-auto rounded" />
                    </div>
                    // <AdvancedImage key={image.url} cldImg={cld.image(image?.public_id)} />
                )}
            </div> */}
            <div className="gallery">
                <div className="gallery grid gap-3 justify-center items-start grid-cols-2 lg:grid-cols-3 mb-4">
                    {loaderData?.images.map((image: any) => (
                        <NavLink
                            key={image.public_id}
                            to={`/gallery/image/${encodeURIComponent(image.public_id)}`}
                            viewTransition
                            className={"w-fit mx-auto"}>
                            {({ isTransitioning }) => (
                                <>
                                    <img
                                        src={image.url}
                                        alt={image.resource_type}
                                        className={`gallery-item w-full aspect-square object-cover object-top m-auto rounded hover:rotate-2 transition-all ease-in-out duration-500`}
                                        style={{
                                            viewTransitionName: isTransitioning
                                                ? "full-image"
                                                : "none",
                                        }}
                                    />
                                    <p className='font-semibold mt-2'>{image.display_name?.toString().replaceAll("-", " ")}</p>
                                </>
                            )}

                        </NavLink>
                    ))}
                </div>
            </div>
        </main>
    )
}
