import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { Route } from "./+types/upload";
import { redirect, useNavigation, useSubmit, type SubmitOptions } from "react-router";
import { uploadImage } from "~/integrations/cloudinary/service.server";



export async function action({ request }: Route.ActionArgs) {

    const url = new URL(request.url)
    const searchparams = url.searchParams
    const imgName = searchparams.get("name") as string
    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "image") {
            // process the upload and return a File
            // upload to cloudinary
            try {
                if (fileUpload.size > 3000000) {
                    throw new Error("File is too large")
                }
                const uploadedImage = await uploadImage(fileUpload.stream(), imgName)
                return uploadedImage.secure_url;

            } catch (error) {
                console.log(error);
                return null;
            };
        }
    };

    try {

        const formData = await parseFormData(
            request,
            uploadHandler,
            {
                maxFileSize: 3000000, // 3MB
            }
        );
        // 'image' has already been processed at this point
        const imgSource = formData.get("image");
        const imgDescription = formData.get("name");
        if (!imgSource) {
            return { error: "something is wrong", };
        }
        return { imgSource, imgDescription }

    } catch (error) {
        console.log(error)
        return { error: "Upload  unsuccessfull" }
    }
    throw redirect("/admin/gallery")
}

export default function Component({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation()
    const submit = useSubmit()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const params = new URLSearchParams();
        const name = formData.get('name')
        params.set("name", name?.toString().replaceAll(" ", "-") as string)

        const options: SubmitOptions = {
            action: `/admin/gallery/upload?${params}`,
            method: "post",
            encType: "multipart/form-data"
        }
        submit(formData, options)
    }

    return (
        <main>
            <h1 className="text-3xl text-center font-semibold text-primary pt-4 mb-4">Upload Image</h1>
            <form method="post" onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col justify-center items-center gap-3 max-w-xl mx-auto mb-4">
                <input type="file" className="file-input file-input-bordered file-input-primary w-full max-w-xs mb-4" name="image" accept="image/*" />
                <input type="text" className="input input-bordered input-primary w-full max-w-xs mb-4" name="name" placeholder="Nombre" />
                {navigation.state === "submitting" && <span className="mx-auto loading loading-spinner text-primary mb-3"></span>}
                {actionData?.error && <div className="text-error">{actionData.error}</div>}
                <button type="submit" className="btn btn-primary btn-sm" disabled={navigation.state === "submitting"}>Submit</button>
            </form>

            {actionData?.imgSource && (
                <section className="w-full flex flex-col gap-3 justify-center items-center">
                    <h2>Uploaded Image: </h2>
                    <p>{actionData?.imgDescription?.toString()}</p>
                    <img src={actionData?.imgSource as string} alt={"Upload result"} className="w-52 mx-auto rounded" />
                </section>
            )}
        </main>
    );
}
