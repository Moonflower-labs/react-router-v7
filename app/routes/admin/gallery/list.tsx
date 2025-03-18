import cloudinary from "~/integrations/cloudinary/service.server";
import type { Route } from "./+types/list";
import { Form, Link, useNavigation, useSearchParams, useSubmit } from "react-router";
import { ImBin } from "react-icons/im";
import { BiUpload } from "react-icons/bi";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const folder = url.searchParams.get("folder");
    const images = await cloudinary.api.resources({
        type: "upload",
        prefix: folder || "susurros",
        max_results: 10
    });

    return { images: images.resources, cloudName: process.env.CLOUD_NAME }
}

export async function action({ request }: Route.ActionArgs) {
    const formdata = await request.formData()
    const imageId = formdata.get("imageId")
    if (typeof imageId !== "string") {
        return { error: "imageId must be a string!" }
    }
    try {
        await cloudinary.api.delete_resources([imageId])
    } catch (error) {
        console.error(error)
        return { success: false }
    }
    return { success: true }
}


export default function Component({ loaderData }: Route.ComponentProps) {
    const navigation = useNavigation()
    const submit = useSubmit()
    const [searchParams] = useSearchParams()


    return (
        <main className="text-center">
            <h1 className="text-primary text-3xl font-semibold mb-4 pt-4">Galería</h1>
            <Form onChange={e => submit(e.currentTarget)} className="mb-6 mx-auto pb-2">
                <div className="join">
                    <input className="join-item btn btn-primary w-28" type="radio" name="folder" defaultChecked={searchParams.get('folder') === "susurros" || !searchParams.get('folder')} value="susurros" aria-label="Susurros" />
                    <input className="join-item btn btn-primary w-28" type="radio" name="folder" value="avatars" defaultChecked={searchParams.get('folder') === "avatars"} aria-label="Avatars" />
                </div>
            </Form>
            <div className="grid gap-3 justify-center items-start grid-cols-2 lg:grid-cols-3 mb-4">
                <Link to={"upload"} viewTransition className="flex flex-col justify-center items-center gap-4 rounded outline-dashed outline-base-300 aspect-square w-4/5 p-4 mx-auto">
                    <BiUpload size={28} />
                    <p>Upload images</p>
                </Link>

                {loaderData?.images?.length > 0 ?
                    loaderData.images.map((image: any) =>
                        <div key={image.url} className="flex flex-col justify-start items-center gap-2">
                            <img src={image.secure_url} alt={image?.display_name} className="w-4/5 m-auto aspect-square object-cover object-top rounded" />
                            <Form method="post">
                                <button
                                    type="submit"
                                    name="imageId"
                                    value={image.public_id}
                                    disabled={navigation.state === "submitting"}
                                    className="flex gap-3 justify-center items-center text-error/80 cursor-pointer m-auto py-2 hover:text-error">
                                    <ImBin size={24} />
                                </button>
                            </Form>
                        </div>
                    ) : (
                        <span> No hay imágenes que mostrar.</span>
                    )}
            </div>
        </main>
    )
}
