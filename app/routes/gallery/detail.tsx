
import type { Route } from './+types/detail';
import cloudinary from "~/integrations/cloudinary/service.server";
import { Link } from 'react-router';

export async function loader({ params }: Route.LoaderArgs) {
    const image = await cloudinary.api.resource(decodeURIComponent(params?.id), { type: "upload" })

    return image;
}

export default function ImagePage({ loaderData }: Route.ComponentProps) {
    const image = loaderData as any;

    return (
        <main className="text-center min-h-screen p-4">
            <Link to={"/gallery"} viewTransition className='mb-2 link link-primary'>
                Volver
            </Link>
            <div className='w-fit m-auto pt-3'>
                <img
                    src={image.url}
                    alt={image.alt}
                    className="full-image object-contain rounded"
                />
                <p className='font-semibold mt-2'>{image.display_name}</p>
            </div>
        </main>
    );
}


