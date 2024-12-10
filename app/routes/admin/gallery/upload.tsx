import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import type { Route } from "./+types/upload";
import { Form, redirect, useNavigation } from "react-router";
import cloudinary from "~/integrations/cloudinary/service.server";


async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    // Read all chunks from the stream
    // todo: fix upload stream
    // @ts-ignore 
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    // Convert the chunks array to a single Buffer
    return Buffer.concat(chunks);
}

export async function action({ request }: Route.ActionArgs) {
    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "image") {
            // process the upload and return a File
            // upload to cloudinary
            try {
                const stream = fileUpload.stream();
                // Convert the stream to a Buffer
                const buffer = await streamToBuffer(stream);

                const uploadResult = await new Promise((resolve) => {
                    cloudinary.uploader.upload_stream((error, uploadResult) => {
                        return resolve(uploadResult);
                    }).end(buffer);
                });
            } catch (error) {
                console.log(error);
                return null
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
        const file = formData.get("image");

    } catch (error) {
        console.log(error)
        return { error: "Upload  unsuccessfull" }
    }
    throw redirect("/admin/gallery")
}

export default function Component({ actionData }: Route.ComponentProps) {
    const navigation = useNavigation()

    return (
        <main>
            <h1 className="text-3xl text-center font-semibold text-primary mb-4">Upload Image</h1>
            {actionData?.error && <div className="text-error">{actionData.error}</div>}
            <Form method="post" encType="multipart/form-data" className="flex flex-col justify-center items-center gap-3 max-w-xl mx-auto">
                <input type="file" className="file-input file-input-bordered file-input-primary w-full max-w-xs mb-4" name="image" />
                {navigation.state !== "submitting" && <div className="text-center  mb-4"> <span className="mx-auto loading loading-spinner text-primary"></span></div>}
                <button type="submit" className="btn btn-primary btn-sm" disabled={navigation.state === "submitting"}>Submit</button>
            </Form>
        </main>
    );
}
