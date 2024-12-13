import cloudinary from "~/integrations/cloudinary/service.server";
import type { Route } from "./+types/list";
import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { Form, Link } from "react-router";
import { IoMdAdd } from "react-icons/io";
import { ImBin } from "react-icons/im";

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
            <div className="grid gap-3 justify-center items-center grid-cols-2 lg:grid-cols-3 mb-4">
                {loaderData?.images?.length > 0 ?
                    loaderData.images.map((image: any) =>
                        <div key={image.url} className="flex flex-col justify-center items-center gap-4">
                            <img src={image.secure_url} alt={image?.display_name} className="w-32 m-auto rounded" />
                            <p>{image.display_name}</p>
                            <div className="flex gap-3 justify-center items-center">
                                <Link to={"upload"} className="btn btn-xs btn-outline btn-success" viewTransition>
                                    <IoMdAdd size={24} />
                                </Link>
                                <Form method="post" className="flex justify-center items-center">
                                    <button
                                        type="submit"
                                        name="imageId" value={image.public_id} className=" btn btn-xs btn-outline btn-error m-auto justify-self-center">
                                        <ImBin size={20} />
                                    </button>
                                </Form>
                            </div>
                        </div>
                        // <AdvancedImage key={image.url} cldImg={cld.image(image?.public_id)} />
                    ) : (
                        <p className="col-span-full flex flex-col gap-4">
                            <span> No hay imágenes que mostrar.</span>
                            <Link to={"upload"} className="link link-primary">Upload</Link>
                        </p>
                    )}
            </div>
        </main>
    )
}
