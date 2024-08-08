'use client'
import useSWRMutation from 'swr/mutation'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ValidationRule, useForm } from 'react-hook-form'
import { useEffect } from 'react'
import { formatId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Banner } from '@/lib/models/BannerModel'

export default function BannerEditForm({ bannerId }: { bannerId: string }) {
    const { data: product, error } = useSWR(`/api/admin/banners/${bannerId}`)
    const router = useRouter()
    const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
        `/api/admin/banners/${bannerId}`,
        async (url, { arg }) => {
            const res = await fetch(`${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(arg),
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message)

            toast.success('Banner updated successfully')
            router.push('/admin/banners')
        }
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<Banner>()

    useEffect(() => {
        if (!product) return
        setValue('name', product.name)
        setValue('slug', product.slug)
        setValue('image', product.image)
    }, [product, setValue])

    const formSubmit = async (formData: any) => {
        await updateProduct(formData)
    }

    if (error) return error.message
    if (!product) return 'Loading...'

    const FormInput = ({
        id,
        name,
        required,
        pattern,
    }: {
        id: keyof Banner
        name: string
        required?: boolean
        pattern?: ValidationRule<RegExp>
    }) => (
        <div className="md:flex mb-6">
            <label className="label md:w-1/5" htmlFor={id}>
                {name}
            </label>
            <div className="md:w-4/5">
                <input
                    type="text"
                    id={id}
                    {...register(id, {
                        required: required && `${name} is required`,
                        pattern,
                    })}
                    className="input input-bordered w-full max-w-md"
                />
                {errors[id]?.message && (
                    <div className="text-error">{errors[id]?.message}</div>
                )}
            </div>
        </div>
    )

    const uploadHandler = async (e: any) => {
        const toastId = toast.loading('Uploading image...')
        try {
            const resSign = await fetch('/api/cloudinary-sign', {
                method: 'POST',
            })
            const { signature, timestamp } = await resSign.json()
            const file = e.target.files[0]
            const formData = new FormData()
            formData.append('file', file)
            formData.append('signature', signature)
            formData.append('timestamp', timestamp)
            formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )
            const data = await res.json()
            setValue('image', data.secure_url)
            toast.success('File uploaded successfully', {
                id: toastId,
            })
        } catch (err: any) {
            toast.error(err.message, {
                id: toastId,
            })
        }
    }

    return (
        <div>
            <h1 className="text-2xl py-4">Edit Banner {formatId(bannerId)}</h1>
            <div>
                <form onSubmit={handleSubmit(formSubmit)}>
                    <FormInput name="Name" id="name" required />
                    <FormInput name="Slug" id="slug" required />
                    <FormInput name="Image" id="image" required />
                    <div className="md:flex mb-6">
                        <label className="label md:w-1/5" htmlFor="imageFile">
                            Upload Image
                        </label>
                        <div className="md:w-4/5">
                            <input
                                type="file"
                                className="file-input w-full max-w-md"
                                id="imageFile"
                                onChange={uploadHandler}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn btn-primary"
                    >
                        {isUpdating && <span className="loading loading-spinner"></span>}
                        Update
                    </button>
                    <Link className="btn ml-4 " href="/admin/banners">
                        Cancel
                    </Link>
                </form>
            </div>
        </div>
    )
}
