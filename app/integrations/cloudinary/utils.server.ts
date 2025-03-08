import cloudinary from "./service.server";

export async function fetchAvatars() {
  try {
    const avatars = await cloudinary.api.resources({
      type: "upload",
      prefix: "avatars"
    });
    return avatars.resources;
  } catch (error) {
    console.error(error);
    return;
  }
}
