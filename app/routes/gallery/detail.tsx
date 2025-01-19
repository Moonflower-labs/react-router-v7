
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
        <main className="flex text-center justify-center items-center min-h-screen p-4">
            {image &&
                <div>
                    <img
                        src={image.url}
                        alt={image.alt}
                        className="full-image aspect-auto rounded mb-3"
                    />
                    <Link to={"/gallery"} className='btn btn-sm btn-primary' viewTransition>
                        Volver
                    </Link>
                </div>
            }
        </main>

    );
}


