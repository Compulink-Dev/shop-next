import { options } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ProductModel from "@/lib/models/ProductModel";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Define the Zod schema for product validation
const productSchema = z.object({
  part: z.string().min(1, "Part is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(), // Slug can be generated if not provided
  image: z.string().optional().default("/images/laptop.png"),
  price: z.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  countInStock: z
    .number()
    .int()
    .nonnegative("Count in stock must be non-negative"),
  description: z.string().min(1, "Description is required"),
});

// Helper to generate slugs
const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "") +
  "-" +
  Date.now();

// Helper to generate tracking data
const generateTrackingData = () => [
  {
    status: "Order Received",
    timestamp: Date.now(),
    message: "Your order has been received and is being processed.",
  },
];

// GET handler to fetch all products
export async function GET() {
  const session = await getServerSession(options);

  if (!session || !session.user?.isAdmin) {
    console.log("Unauthorized access attempt");
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await dbConnect();

  try {
    const products = await ProductModel.find(); // Fetch products from the database
    return new NextResponse(JSON.stringify(products), { status: 200 });
  } catch (err: any) {
    console.error("Error fetching products:", err.message);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch products",
        error: err.message,
      }),
      { status: 500 }
    );
  }
}

// // POST handler to create a new product
// export const POST = auth(async (req: any) => {
//   try {
//     // Parse the request body
//     const body = await req.json();
//     console.log("Parsed Body:", body);

//     // Check user authorization
//     if (!req.auth || !req.auth.user?.isAdmin) {
//       return new Response(JSON.stringify({ message: "Unauthorized" }), {
//         status: 401,
//       });
//     }

//     // Map incoming fields to expected schema
//     const mappedBody = {
//       part: body.Part,
//       name: body.Name,
//       image:
//         body.Image && z.string().url().safeParse(body.Image).success
//           ? body.Image
//           : "/images/laptop.png", // Default image URL
//       price: body["USD Price (Excl. VAT)"],
//       category: body.Category,
//       brand: body.Brand || "Unknown",
//       countInStock: body.Quantity,
//       description: body.Description,
//     };

//     await dbConnect();

//     // Validate mappedBody against schema
//     const validatedData = productSchema.parse(mappedBody);
//     console.log("Validated Data:", validatedData);

//     // Generate slug and tracking data
//     const slug = validatedData.slug || generateSlug(validatedData.name);
//     const trackingData = generateTrackingData();

//     // Check if a product with the same `part` exists
//     const existingProduct = await ProductModel.findOne({
//       part: validatedData.part,
//     });

//     let product;
//     if (existingProduct) {
//       // Update existing product
//       existingProduct.name = validatedData.name;
//       existingProduct.image = validatedData.image;
//       existingProduct.price = validatedData.price;
//       existingProduct.category = validatedData.category;
//       existingProduct.brand = validatedData.brand;
//       existingProduct.countInStock = validatedData.countInStock;
//       existingProduct.description = validatedData.description;
//       product = await existingProduct.save();

//       console.log("Product updated:", product);
//       return new Response(
//         JSON.stringify({ message: "Product updated successfully", product }),
//         { status: 200 }
//       );
//     } else {
//       // Create a new product
//       product = new ProductModel({
//         ...validatedData,
//         slug,
//         tracking: trackingData,
//       });

//       await product.save();
//       console.log("Product created:", product);

//       return new Response(
//         JSON.stringify({ message: "Product created successfully", product }),
//         { status: 201 }
//       );
//     }
//   } catch (err: any) {
//     console.error("Error:", err);

//     // Handle validation or other errors
//     if (err instanceof z.ZodError) {
//       return new Response(
//         JSON.stringify({ message: "Validation Error", errors: err.errors }),
//         { status: 400 }
//       );
//     }

//     return new Response(
//       JSON.stringify({ message: "Internal Server Error", error: err.message }),
//       { status: 500 }
//     );
//   }
// }) as any;
