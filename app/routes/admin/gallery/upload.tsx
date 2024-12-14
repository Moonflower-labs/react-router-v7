import { type FileUpload, parseFormData, } from "@mjackson/form-data-parser";
import type { Route } from "./+types/upload";
import { redirect, useNavigation, useSubmit, type SubmitOptions } from "react-router";
import { uploadImage } from "~/integrations/cloudinary/service.server";
import { MultipartParseError } from "@mjackson/multipart-parser";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { BiUpload } from "react-icons/bi";

const MAX_FILE_SIZE = 3000000; // 3MB

export async function action({ request }: Route.ActionArgs) {
    const url = new URL(request.url)
    const searchparams = url.searchParams
    const imgName = searchparams.get("name") as string

    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "image") {
            // process the upload and return a File
            // upload to cloudinary
            try {

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
                maxFileSize: MAX_FILE_SIZE
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
        if (error instanceof MultipartParseError) {
            return { error: "Upload  Exeeded max file size" }
        }
        return { error: "Upload  unsuccessfull" }
    }
    throw redirect("/admin/gallery")
}

export default function Component({ actionData }: Route.ComponentProps) {

    return (
        <main>
            <h1 className="text-3xl text-center font-semibold text-primary pt-4 mb-4">Upload Image</h1>
            <UploadForm error={actionData?.error} />
            {actionData?.imgSource && (
                <section className="w-full flex flex-col gap-3 justify-center items-center mb-4">
                    <h2>Uploaded Image: </h2>
                    <p>{actionData?.imgDescription?.toString()}</p>
                    <img src={actionData?.imgSource as string} alt={"Upload result"} className="w-52 aspect-square mx-auto rounded" />
                </section>
            )}
        </main>
    );
}


function UploadForm({ error }: { error: string | undefined }) {
    const navigation = useNavigation();
    const [dragActive, setDragActive] = useState(false);
    const submit = useSubmit()
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDraggingOutside, setIsDraggingOutside] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files?.[0];
            if (file && file.size > MAX_FILE_SIZE) {
                toast.error("El archivo sobrepasa el límite de 3MB!")
                e.target.value = ""
                return;
            }
            setSelectedFile(e.target.files[0]);
        }
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    useEffect(() => {
        const preventDefault = (e: DragEvent) => {
            e.preventDefault();
        };

        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);

        return () => {
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    useEffect(() => {
        const handleDragEnterWindow = () => {
            setIsDraggingOutside(true);
        };

        const handleDragLeaveWindow = (e: DragEvent) => {
            // Only set to false if we're leaving the window entirely
            if (!e.relatedTarget) {
                setIsDraggingOutside(false);
            }
        };
        const preventDefault = (e: DragEvent) => {
            e.preventDefault();
        };

        window.addEventListener('dragover', preventDefault);
        window.addEventListener('drop', preventDefault);
        window.addEventListener('dragenter', handleDragEnterWindow);
        window.addEventListener('dragleave', handleDragLeaveWindow);

        return () => {
            window.removeEventListener('dragenter', handleDragEnterWindow);
            window.removeEventListener('dragleave', handleDragLeaveWindow);
            window.removeEventListener('dragover', preventDefault);
            window.removeEventListener('drop', preventDefault);
        };
    }, []);

    return (
        <form
            method="post"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="max-w-xl mx-auto mb-4"
            onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
        >
            {/* Hidden file input */}
            <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                name="image"
                accept="image/*"
            />

            {/* Custom upload button */}
            <label
                htmlFor="file-upload"
                className={`flex flex-col justify-center items-center gap-4 rounded outline-dashed 
            outline-lime-500 aspect-square w-4/5 p-4 mx-auto cursor-pointer
            transition-all duration-200 hover:bg-lime-50
            ${dragActive ? 'bg-lime-50 outline-lime-600' : ''}`}
            >
                <BiUpload size={28} className={`text-lime-500 ${dragActive ? 'animate-bounce' : ''}`} />
                <p className="text-lime-700">{dragActive || isDraggingOutside ? 'Drop here!' : 'Upload images'}</p>
            </label>

            {/* File name display */}
            {selectedFile && (
                <p className="text-center mt-2 text-sm text-gray-600">
                    Selected: {selectedFile.name}
                </p>
            )}

            {/* Name input appears after file selection */}
            {selectedFile && (
                <input
                    type="text"
                    className="input input-bordered input-primary w-full max-w-xs mx-auto mt-4 block"
                    name="name"
                    placeholder="Nombre"
                />
            )}

            {/* Loading and error states */}
            {navigation.state === "submitting" && (
                <span className="mx-auto loading loading-spinner text-primary mt-3 block"></span>
            )}

            {error && (
                <div className="text-error text-center mt-2">{error}</div>
            )}

            {/* Submit button appears after file selection */}
            {selectedFile && (
                <button
                    type="submit"
                    className="btn btn-primary btn-sm mt-4 block mx-auto"
                    disabled={navigation.state === "submitting"}
                >
                    Submit
                </button>
            )}
        </form>
    );
}
