import { data, Form, href, redirect, useNavigation } from "react-router";
import { CustomAlert } from "~/components/shared/info";
import type { Route } from "./+types/create";
import ActionError from "~/components/framer-motion/ActionError";
import { getSessionContext } from "~/middleware/sessionMiddleware";
import { MaxFileSizeExceededError, MultipartParseError } from "@mjackson/multipart-parser";
import { FileUpload, parseFormData } from "@mjackson/form-data-parser";
import cloudinary, { uploadImage } from "~/integrations/cloudinary/service.server";
import { createProduct } from "~/models/product.server";
import { ImageSelector } from "./images-selector";
import { useState } from "react";
import { FaImages } from "react-icons/fa";
import { MdCloudUpload } from "react-icons/md";

const MAX_FILE_SIZE = 3000000; // 3MB

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const folder = url.searchParams.get("folder");
  const images = await cloudinary.api.resources({
    type: "upload",
    prefix: folder || "products",
    max_results: 10
  });

  return { productImages: images.resources, cloudName: process.env.CLOUD_NAME }
}
export async function action({ request, context }: Route.ActionArgs) {
  const session = getSessionContext(context)
  // const userId = session.get("userId");
  const uploadHandler = async (fileUpload: FileUpload | string | undefined) => {
    if (fileUpload instanceof FileUpload && fileUpload.fieldName === "image") {
      // process the upload and return a File
      // upload to cloudinary
      try {
        const uploadedImage = await uploadImage(fileUpload.stream(), "products")
        return uploadedImage.secure_url;

      } catch (error) {
        console.error(error);
        return null;
      };
    }
    if (typeof fileUpload === "string") {
      return fileUpload;
    }
    return null;
  }


  try {
    const formData = await parseFormData(
      request,
      { maxFileSize: MAX_FILE_SIZE },
      uploadHandler,
    );
    // 'image' has already been processed at this point
    const imgSource = formData.get("image");
    if (!imgSource) {
      return { error: "Something went wrong", };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description");
    const active = formData.get("active") === "on";

    let errors: any = {};
    if (!name) {
      errors.title = "Escribe un nombre";
    }
    if (!description || typeof description !== "string") {
      errors.description = "Escribe una descripción";
    }
    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const product = await createProduct({ name, description: String(description), thumbnail: imgSource as string, active });
    session.flash("toastMessage", { type: "success", message: "Producto creado 👏🏽" })

    return redirect(href("/admin/products/:id/detail", { id: product.id }))


  } catch (error) {
    // console.error(error)
    // session.flash("toastMessage", { type: "error", message: "Ha ocurrido un error" })
    if (error instanceof MaxFileSizeExceededError) {
      console.error("MaxFileSizeExceededError");
      // return { success: false, error: "Upload unsuccessfull" }
      throw data(error.message, { status: 413 });
    }

    if (error instanceof MultipartParseError) {
      console.error("MultipartParseError");

      throw data(error.message, { status: 400 });
    }
    console.error("NEXT");
    return { success: false, error: "Upload unsuccessfull" }
  }
}

export default function CreateProduct({ actionData, loaderData }: Route.ComponentProps) {
  const { productImages } = loaderData || {};
  const { errors, error } = actionData || {};
  const navigation = useNavigation();
  const [imageSource, setImageSource] = useState<"existing" | "upload">("upload");
  const [fileError, setFileError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_FILE_SIZE) {
      setFileError("El archivo excede el tamaño máximo de 3MB");
      e.target.value = ""; // Clear input
    } else {
      setFileError(null);
    }
  };


  return (
    <div className="md:w-2/3 mx-auto">
      <h2 className="text-2xl text-primary my-4 text-center">Crea un Producto</h2>
      <CustomAlert level="warning" className="mb-6">
        <span>Este producto no será creado en stripe!</span>
      </CustomAlert>
      {error && <ActionError actionData={{ error }} />}
      <Form method="POST" encType="multipart/form-data" className="card max-w-xs items-center mx-auto pb-4 flex flex-col">
        <label className="input input-lg mb-3">
          <span className="label">Nombre</span>
          <input type="text" name={"name"} placeholder="..." required />
        </label>
        {errors?.name && <ActionError actionData={{ error: errors.name }} />}
        <label className="textarea textarea-lg mb-4">
          <span className="label">Descripción</span>
          <textarea
            placeholder="Descrbe el producto"
            name="description"
            className="w-full"
            rows={5}
            required
          >
          </textarea>
          {errors?.description && <ActionError actionData={{ error: errors.description }} />}
        </label>
        {/* Image TABS */}
        <div className="tabs tabs-lift mb-3">
          {productImages?.length > 0 &&
            <>
              <label className="tab gap-1.5">
                <input type="radio" name="my_tabs_2" defaultChecked={imageSource === "existing"} onClick={() => setImageSource("existing")} />
                <FaImages size={24} />
                Imágenes
              </label>
              <div className="tab-content border-base-300 bg-base-100 p-8">
                {/* Select avaliable Image */}
                {imageSource === "existing" && (
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Selecciona una imagen</legend>
                    <ImageSelector productImages={productImages} />
                  </fieldset>
                )}
              </div>
            </>}

          <label className="tab gap-1.5">
            <input type="radio" name="my_tabs_2" defaultChecked={imageSource === "upload"} onClick={() => setImageSource("upload")} />
            <MdCloudUpload size={24} />
            Sube una imagen
          </label>
          <div className="tab-content border-base-300 bg-base-100 p-8">
            {/*  Upload image */}
            {imageSource === "upload" && (
              <fieldset className="fieldset">
                {/* <legend className="fieldset-legend">Sube una imagen</legend> */}
                <input type="file" name="image" accept="image/*" className="file-input" onChange={handleFileChange} />
                <label className="fieldset-label">Max size 3MB</label>
              </fieldset>
            )}
            {fileError && <ActionError actionData={{ error: fileError }} />}
          </div>
        </div>


        <label className="fieldset-label">
          <input type="checkbox" defaultChecked name="active" className="toggle toggle-primary" />
          Active
        </label>
        <div className="flex justify-end gap-3 mt-8">
          <button type="reset" className="btn btn-primary btn-outline btn-sm">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={navigation.state === "submitting" || Boolean(fileError)}>
            {navigation.state === "submitting" ? "Creando..." : "Crear"}
          </button>
        </div>
      </Form>
    </div>
  );
}