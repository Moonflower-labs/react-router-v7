import { useState } from "react";

interface Image {
    public_id: string;
    secure_url: string;
}

interface ImageSelectorProps {
    productImages: Image[];
    name?: string; // Optional, defaults to "image"
    defaultSelected?: string;
}

export const ImageSelector = ({ productImages, name = "image", defaultSelected }: ImageSelectorProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(defaultSelected ?? null);

    const handleImageSelect = (url: string) => {
        setSelectedImage(url);
    };

    return (
        <div className="grid grid-cols-3 gap-3">
            {productImages?.map((image) => (
                <label
                    key={image.public_id}
                    className={`flex items-center w-fit cursor-pointer border-2 ${selectedImage === image.secure_url ? "border-success rounded-md" : " border-transparent"
                        }`}
                >
                    <input
                        type="radio"
                        name={name}
                        value={image.secure_url}
                        className="sr-only" // Hide radio, keep accessibility
                        onChange={() => handleImageSelect(image.secure_url)}
                        defaultChecked={selectedImage === image.secure_url}
                    />
                    <img
                        src={image.secure_url}
                        alt={image.public_id}
                        className="w-16 h-16 object-cover rounded"
                    />
                </label>
            ))}
        </div>
    );
};