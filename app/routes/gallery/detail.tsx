
import type { Route } from './+types/detail';
import cloudinary from "~/integrations/cloudinary/service.server";
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';

export async function loader({ params }: Route.LoaderArgs) {
    const image = await cloudinary.api.resource(decodeURIComponent(params?.id), { type: "upload" })

    return image;
}

export default function ImagePage({ loaderData }: Route.ComponentProps) {
    const image = loaderData as any;

    return (

        <main className="flex text-center justify-center items-center min-h-screen p-4">
            {/* <AnimatePresence> */}
            {image &&
                <motion.div
                    // layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.img
                        layoutId={image.public_id}
                        transition={{ type: "spring", stiffness: 50 }}
                        src={image.url}
                        alt={image.alt}
                        className="aspect-auto rounded mb-3"
                    />
                    <Link to={"/gallery"} className='btn btn-sm btn-primary'>
                        Volver
                    </Link>
                </motion.div>
            }
            {/* </AnimatePresence> */}
        </main>

    );
}


