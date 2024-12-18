import OrderTracking from '@/components/OrderTracking'
import OrderDetails from './OrderDetails'

export function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: `Order ${params.id}`,
  }
}

export default function OrderDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="">
      <OrderDetails
        paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
        orderId={params.id}
      />
      <div className="my-8">
        <OrderTracking orderId={params.id} />
      </div>
    </div>
  )
}
