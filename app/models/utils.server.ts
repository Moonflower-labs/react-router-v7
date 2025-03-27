import { writeReadableStreamToWritable } from "@react-router/node";
import { prisma } from "~/db.server";
import cloudinary from "~/integrations/cloudinary/service.server";
import { fetchStripeShippinRates } from "~/integrations/stripe/shipping-rate";
import { stripe } from "~/integrations/stripe/stripe.server";

export async function syncStripeProducts() {
  try {
    // Fetch all products and prices from Stripe
    const stripeProducts = await stripe.products.search({
      query: "active:'true' AND metadata['app']:'florblanca'"
    });
    const stripePrices = await stripe.prices.list({ limit: 100 });

    for (const stripeProduct of stripeProducts.data) {
      // Check if the product already exists in Prisma
      const existingProduct = await prisma.product.findUnique({
        where: { id: stripeProduct.id }
      });

      // Stream first image to Cloudinary and check for duplicates
      let cloudinaryId = null;
      if (stripeProduct.images?.[0]) {
        const publicId = `products/${stripeProduct.id}`;
        // Check if image already exists in Cloudinary
        try {
          const resource = await cloudinary.api.resource(publicId);
          cloudinaryId = resource.secure_url; // Use existing ID if found
          console.info(`Existing image in Cloudinary: ${cloudinaryId}`);
        } catch (err: any) {
          // If 404 (not found), upload it
          if (err?.error.http_code === 404) {
            const response = await fetch(stripeProduct.images[0]);
            if (!response.ok || !response.body) {
              console.error(`Failed to fetch image: ${stripeProduct.images[0]}`);
            } else {
              cloudinaryId = await new Promise(async (resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  {
                    resource_type: "image",
                    public_id: publicId,
                    folder: "products",
                    transformation: [
                      { quality: "auto:good" },
                      { fetch_format: "auto" },
                      { width: 800, crop: "scale" },
                      { secure: true }
                    ]
                  },
                  (error, result) => {
                    if (error) reject(error);
                    else resolve(result?.secure_url);
                  }
                );
                const redableStream = response.body;
                await writeReadableStreamToWritable(redableStream!, stream);
              });
              console.info(`Uploaded image to Cloudinary: ${cloudinaryId}`);
            }
          } else {
            console.error(`Cloudinary check error: ${err?.error.message}`);
            console.dir(err, { depth: Infinity });
          }
        }
      }

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: stripeProduct.id },
          data: {
            name: stripeProduct.name,
            description: stripeProduct.description || "",
            thumbnail: cloudinaryId
          }
        });
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            id: stripeProduct.id,
            name: stripeProduct.name,
            description: stripeProduct.description || "",
            thumbnail: cloudinaryId
          }
        });
      }

      // Handle associated prices for the product
      const associatedPrices = stripePrices.data.filter(price => price.product === stripeProduct.id);

      for (const price of associatedPrices) {
        // Check if the price already exists in Prisma
        const existingPrice = await prisma.price.findUnique({
          where: { id: price.id }
        });

        if (existingPrice) {
          // Update existing price
          await prisma.price.update({
            where: { id: price.id },
            data: {
              amount: price.unit_amount!,
              info: price.metadata?.color || price.metadata?.title || price.metadata?.size
            }
          });
        } else {
          // Create new price
          await prisma.price.create({
            data: {
              id: price.id,
              product: { connect: { id: stripeProduct.id } },
              amount: price.unit_amount!,
              info: price.metadata?.color || price.metadata?.title || price.metadata?.size || ""
            }
          });
        }
      }
    }
    console.info("Stripe products and prices synced with Prisma.");
  } catch (error) {
    console.error("Error syncing products:", error);
  }
}

export async function syncStripeShippingRates() {
  try {
    const stripeRates = await fetchStripeShippinRates();

    for (const rate of stripeRates) {
      // Check for existing
      const existingRate = await prisma.shippingRate.findUnique({
        where: { id: rate.id }
      });
      // if exist update it
      if (existingRate) {
        const updatedRate = await prisma.shippingRate.update({
          where: { id: existingRate.id },
          data: {
            displayName: rate.display_name as string,
            amount: rate.fixed_amount?.amount, // £2.50 in pence
            metadata: rate.metadata
          }
        });
        console.log(updatedRate);
      } else {
        //Create a new rate
        const newRate = await prisma.shippingRate.create({
          data: {
            id: rate.id,
            displayName: rate.display_name as string,
            amount: rate.fixed_amount?.amount as number, // £2.50 in pence
            metadata: rate.metadata
          }
        });
        console.log(newRate);
      }
    }
    console.info("Shipping Rates successfully synced wiht Stripe");
  } catch (error) {
    console.error("Error while trying to sync Shipping Rates");
  }
}
