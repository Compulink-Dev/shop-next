// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import AddToCart from "@/components/products/AddToCart";

// export default function AddToCartButton({ product }: { product: any }) {
//   const [addedToCart, setAddedToCart] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     // Check if product is already in cart (you might need a global state here)
//     const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//     const itemInCart = cart.some((item: any) => item._id === product._id);
//     setAddedToCart(itemInCart);
//   }, [product._id]);

//   return (
//     <>
//       {!addedToCart ? (
//         <AddToCart
//           item={{ ...product, qty: 1, color: "", size: "" }}
//           onAdd={() => setAddedToCart(true)}
//         />
//       ) : (
//         <button
//           className="btn btn-primary mt-2"
//           onClick={() => router.push("/cart")}
//         >
//           View Cart
//         </button>
//       )}
//     </>
//   );
// }
