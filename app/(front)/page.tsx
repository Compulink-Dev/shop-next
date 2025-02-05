/* eslint-disable @next/next/no-img-element */
import ProductItem from "@/components/products/ProductItem";
import getBanners from "@/lib/services/bannerServices";
import productService from "@/lib/services/productService";
import { convertDocToObj } from "@/lib/utils";
import Link from "next/link";

export default async function Home() {
  const featuredProducts = await getBanners();
  const latestProducts = await productService.getLatest();
  const categories = await productService.getCategories();

  const categoryProducts = await Promise.all(
    categories.map(async (category) => {
      const products = await productService.getProductsByCategory(category);
      return { category, products };
    })
  );

  return (
    <>
      <div className="w-full carousel rounded-box mt-4">
        {featuredProducts.map((product, index) => (
          <div
            key={product._id}
            id={`slide-${index}`}
            className="carousel-item relative w-full"
          >
            <Link href={`/product/${product.slug}`}>
              <img
                src={product.image}
                className="w-full h-auto"
                alt={product.name}
              />
            </Link>

            <div
              className="absolute flex justify-between transform 
               -translate-y-1/2 left-5 right-5 top-1/2"
            >
              <a
                href={`#slide-${
                  index === 0 ? featuredProducts.length - 1 : index - 1
                }`}
                className="btn btn-circle"
              >
                ❮
              </a>
              <a
                href={`#slide-${
                  index === featuredProducts.length - 1 ? 0 : index + 1
                }`}
                className="btn btn-circle"
              >
                ❯
              </a>
            </div>
          </div>
        ))}
      </div>
      <h2 className="text-2xl py-2">Latest Products</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {latestProducts.map((product: any) => (
          <ProductItem key={product.slug} product={convertDocToObj(product)} />
        ))}
      </div>
      <h2 className="text-2xl py-2">All Products</h2>
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {allProducts.map((product: any) => (
          <ProductItem key={product.slug} product={convertDocToObj(product)} />
        ))}
      </div> */}
      {categoryProducts.map((categoryProduct) => (
        <div key={categoryProduct.category}>
          <h2 className="text-2xl py-2">{categoryProduct.category}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categoryProduct.products.map((product: any) => (
              <ProductItem
                key={product.slug}
                product={convertDocToObj(product)}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
