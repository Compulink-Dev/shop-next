import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = async (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet)

        const res = await fetch('/api/admin/products/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products: jsonData }),
        })

        const response = await res.json()
        if (res.ok) {
            toast.success('Products uploaded successfully!')
        } else {
            toast.error(response.message || 'Failed to upload products.')
        }
    }

    reader.readAsArrayBuffer(file)
}
