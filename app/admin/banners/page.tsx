import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import Banner from './Banner'

function Banners() {
    return (
        <AdminLayout activeItem="banners">
            <Banner />
        </AdminLayout>
    )
}

export default Banners