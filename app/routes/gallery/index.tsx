import cloudinary from '~/integrations/cloudinary/service.server.js'
import type { Route } from './+types/index.tsx'
import { Link, NavLink } from 'react-router'
import InfoAlert from '~/components/shared/info.js'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export async function loader({ request }: Route.LoaderArgs) {
    const images = await cloudinary.api.resources({
        type: "upload",
        max_results: 20
    })
    return { images: images.resources, cloudName: process.env.CLOUD_NAME }
}



export default function Gallery({ loaderData }: Route.ComponentProps) {
    const images = loaderData?.images
    const [selectedImage, setSelectedImage] = useState<any | null>(null)

    return (

        <main className="text-center min-h-screen p-4">
            <h1 className='text-primary text-3xl pt-3 mb-4'>Susurros de La Flor Blanca</h1>
            <p className='mb-4'>En esta sección verás...</p>
            <InfoAlert level='Info'>
                Pincha en cada imagen para ampliar.
            </InfoAlert>
            <div className="gallery relative">
                <motion.div layout className="gallery grid gap-5 justify-center items-center grid-cols-2 lg:grid-cols-3 mb-4">

                    {/* <AnimatePresence> */}
                    {images.map((image: any) => (
                        <Link key={image.public_id} to={`/gallery/image/${encodeURIComponent(image.public_id)}`}>
                            <motion.img
                                key={image.public_id}
                                layoutId={image.public_id}
                                // onClick={() => setSelectedImage(image)}
                                animate={{ opacity: 1 }}
                                transition={{ type: "spring" }}
                                src={image.url}
                                alt={image.resource_type}
                                className={`w-full aspect-square p-4 object-cover object-top cursor-pointer m-auto rounded 
                                   
                                     transition-all ease-in-out duration-500`}// hover:rotate-2
                                style={{

                                }}
                            />
                        </Link>
                    ))}
                    {/* </AnimatePresence> */}
                </motion.div>
                {/* {selectedImage ?
                    <motion.div
                        layoutId={selectedImage.url}
                        animate={{}}
                        className='w-full h-full flex justify-center bg-pink-500/80 absolute top-[50vh] m-auto'
                        onClick={() => setSelectedImage(null)}
                    // onClick={() => setSelectedImage(null)}
                    >
                        <img
                            src={selectedImage.url}
                            alt={selectedImage.resource_type}
                            className={` w-full object-top m-auto cursor-pointer rounded transition-all ease-in-out duration-500`}
                            style={{

                            }}
                        />
                    </motion.div>
                    : null
                } */}
            </div>
        </main>
    )
}
