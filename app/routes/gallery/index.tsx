import cloudinary from '~/integrations/cloudinary/service.server.js'
import type { Route } from './+types/index.js'
import { NavLink } from 'react-router'
import InfoAlert from '~/components/shared/info'

export async function loader({ request }: Route.LoaderArgs) {
    const images = await cloudinary.api.resources({
        type: "upload",
        prefix: "susurros",
        max_results: 20
    })
    return { images: images.resources, cloudName: process.env.CLOUD_NAME }
}


export default function Gallery({ loaderData }: Route.ComponentProps) {


    return (
        <main className="text-center min-h-screen p-4">
            <h1 className='text-primary text-3xl pt-3 mb-4'>Susurros de La Flor Blanca</h1>
            <p className='mb-4'>En esta sección verás...</p>
            <InfoAlert level='Info'>
                Pincha en cada imagen para ampliar.
            </InfoAlert>
            <div className="gallery">
                <div className="gallery grid gap-5 justify-center items-center grid-cols-2 lg:grid-cols-3 mb-4">
                    {loaderData?.images.map((image: any) => (
                        <NavLink
                            key={image.public_id}
                            to={`/gallery/image/${encodeURIComponent(image.public_id)}`}
                            viewTransition
                            className={"w-fit mx-auto"}
                            prefetch='viewport'>
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
                                    {/* <AdvancedImage key={image.url} cldImg={cld.image(image?.public_id)} /> */}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>
        </main>
    )
}
