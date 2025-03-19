import cloudinary from '~/integrations/cloudinary/service.server.js'
import type { Route } from './+types/index.js'
import InfoAlert from '~/components/shared/info'
import { ImageGallery, ImageGallerySkeleton } from './gallery.js'
import { Suspense } from 'react'

export async function loader({ request }: Route.LoaderArgs) {

    const images = new Promise<any>((resolve, reject) => {
        cloudinary.api.resources(
            { type: "upload", prefix: "susurros", max_results: 20 },
            (error: any, result: any) => {
                if (error) reject(error);
                else resolve(result.resources); // Extract resources
            }
        );
    });

    return { images, cloudName: process.env.CLOUD_NAME }
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
                <Suspense fallback={<ImageGallerySkeleton />}>
                    <ImageGallery imagePromise={loaderData?.images} />
                </Suspense>
            </div>
            <div className="gallery">


            </div>
        </main>
    )
}
