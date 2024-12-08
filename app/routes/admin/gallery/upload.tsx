import {
    type FileUpload,
    parseFormData,
} from "@mjackson/form-data-parser";
import type { Route } from "./+types/upload";

export async function action({ request }: Route.ActionArgs) {
    const uploadHandler = async (fileUpload: FileUpload) => {
        if (fileUpload.fieldName === "avatar") {
            // process the upload and return a File
        }
    };

    const formData = await parseFormData(
        request,
        uploadHandler
    );
    // 'avatar' has already been processed at this point
    const file = formData.get("avatar");
}

export default function Component() {
    return (
        <form method="post" encType="multipart/form-data">
            <input type="file" name="avatar" />
            <button>Submit</button>
        </form>
    );
}
