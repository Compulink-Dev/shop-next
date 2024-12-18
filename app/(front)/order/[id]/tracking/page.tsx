import Tracking from "@/components/UpdateTracking";


const ProductPage = ({ params }: { params: { id: string } }) => {
    return (
        <div>
            <h1>Product Details</h1>
            {/* Pass the product ID to the Tracking component */}
            <Tracking productId={params.id} />
        </div>
    );
};

export default ProductPage;
