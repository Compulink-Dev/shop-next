import AdminLayout from '@/components/admin/AdminLayout'
import Form from './Form'

export function generateMetadata({ params }: { params: { id: string } }) {
    return {
        title: `Edit Banner ${params.id}`,
    }
}

export default function BannerEditPage({
    params,
}: {
    params: { id: string }
}) {
    return (
        <AdminLayout activeItem="banners">
            <Form bannerId={params.id} />
        </AdminLayout>
    )
}
