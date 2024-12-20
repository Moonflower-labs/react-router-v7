import cloudinary from "~/integrations/cloudinary/service.server";
import type { Route } from "./+types/list";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Form, Link } from "react-router";
import { ImBin } from "react-icons/im";
import { BiUpload } from "react-icons/bi";

export async function loader({ request }: Route.LoaderArgs) {
    const images = await cloudinary.api.resources({
        type: "upload",
        prefix: "susurros/",
        max_results: 10
    })
    console.log(images.resources[0])
    return { images: images.resources, cloudName: process.env.CLOUD_NAME }
}

export async function action({ request }: Route.ActionArgs) {
    const formdata = await request.formData()
    const imageId = formdata.get("imageId")
    if (typeof imageId !== "string") {
        return null
    }
    await cloudinary.api.delete_resources([imageId])
    return { success: true }
}


export default function Component({ loaderData }: Route.ComponentProps) {
    const cld = new Cloudinary({
        cloud: {
            cloudName: loaderData?.cloudName,
        },
        url: { secure: true }
    });
    const myImage = cld.image(loaderData?.images[0]?.public_id).resize(fill().width(250).height(150));

    return (
        <main className="text-center">
            <h1 className="text-primary text-3xl font-semibold mb-4 pt-4">Galería</h1>
            <div className="grid gap-3 justify-center items-start grid-cols-2 lg:grid-cols-3 mb-4">
                <Link to={"upload"} viewTransition className="flex flex-col justify-center items-center gap-4 rounded outline-dashed outline-base-300 aspect-square w-4/5 p-4 mx-auto">
                    <BiUpload size={28} />
                    <p>Upload images</p>
                </Link>

                {loaderData?.images?.length > 0 ?
                    loaderData.images.map((image: any) =>
                        <div key={image.url} className="flex flex-col justify-start items-center gap-2">
                            <img src={image.secure_url} alt={image?.display_name} className="w-4/5 m-auto aspect-square object-cover rounded" />
                            <Form method="post">
                                <button
                                    type="submit"
                                    name="imageId" value={image.public_id} className="flex gap-3 justify-center items-center text-error/80 cursor-pointer m-auto py-2 hover:text-error">
                                    <ImBin size={24} />
                                </button>
                            </Form>
                        </div>
                        // <AdvancedImage key={image.url} cldImg={cld.image(image?.public_id)} />
                    ) : (
                        <span> No hay imágenes que mostrar.</span>
                    )}
            </div>
        </main>
    )
}
