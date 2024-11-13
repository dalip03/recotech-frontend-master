import { useEffect, useState } from 'react'
import CustomTable from '../../components/common/CustomTable'
import { deletePart, fetchParts, savePart, updatePart } from '@/api/partsService'
import { Spinner } from '@/components/ui'
import ModalDelete from '@/components/common/ModalDelete'
import NewModalParts from './modals/NewModalParts'
import { t } from 'i18next'
import CustomDropdown from '@/components/common/CustomDropdown'

const Piese = () => {
    const [data, setData] = useState([])
    const [modalSettings, setModalSettings] = useState({
        isOpen: false,
        isOpenDelete: false,
        selectedPart: null
    });
    const [loading, setLoading] = useState(false);

    const fetchPartsData = async () => {
        const result = await fetchParts();
        console.log(result);
        setData(result);
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchPartsData();
            setLoading(false);
        }

        fetchData();
    }, [])

    const handleEdit = (id: any) => {
        setModalSettings((prev: any) => ({
            ...prev,
            isOpen: true,
            // selectedPart: data.find((piece: any) => piece.id == id)
            selectedPart: data.find((piece: any) => piece.id == id)
        }))
    }

    const handleDelete = (id: any) => {
        setModalSettings((prev: any) => ({
            ...prev,
            selectedPart: data.find((piece: any) => piece.id == id),
            isOpenDelete: true
        }))
    }

    const handleConfirmDelete = async () => {
        if (modalSettings.selectedPart) {
            // @ts-ignore
            await deletePart(modalSettings.selectedPart.id);
            await fetchPartsData();
            setModalSettings((prev: any) => ({
                ...prev,
                isOpenDelete: false,
                selectedPart: null
            }))
        }
    }

    const handleSubmit = async (partData: any) => {
        modalSettings.selectedPart
            // @ts-ignore
            ? await updatePart(modalSettings.selectedPart.id, partData)
            : await savePart(partData);
        await fetchPartsData();
        setModalSettings((prev) => ({ ...prev, isOpen: false, selectedPart: null }));
    }

    const columns = [
        {
            header: t("Part Code"),
            accessorKey: 'code',
        },
        {
            header: t("Part"),
            accessorKey: 'name',
            cell: ({ row }: any) => {
                return (
                    <div>
                        <span className='font-bold'>{row.original.name}</span> ({row.original.quantity} buc.)
                    </div>
                )
            }
        },
        {
            header: t("Qlty"),
            accessorKey: 'quality',
        },
        {
            header: `${t("Brand")} / ${t("Model")}`,
            accessorKey: 'brand',
            cell: ({ row }: any) => {
                return (
                    <div>
                        {row.original.brand} / {row.original.model}
                    </div>
                )
            }
        },
        {
            header: t("Fuel-Shorthand"),
            accessorKey: 'fuel',
        },
        {
            header: 'KW',
            accessorKey: 'kw',
        },
        {
            header: t("Engine Code"),
            accessorKey: 'engineCode',
        },
        {
            header: t("Chassis"),
            accessorKey: 'body',
        },
        {
            header: t("Localization"),
            accessorKey: 'location',
        },
        {
            header: 'PO',
            accessorKey: 'po',
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                    { eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDelete(row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ]

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div>
            <div>
                <h3 className="text-3xl font-semibold mb-4">{t("Parts")}</h3>
            </div>
            <div
                className="mt-4"
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                }}
            >
                <CustomTable
                    columns={columns}
                    data={data}
                />
            </div>
            {modalSettings.isOpen && (
                <NewModalParts
                    isOpen={modalSettings.isOpen}
                    onClose={() => setModalSettings((prevModalSettings) => ({ ...prevModalSettings, isOpen: false, selectedPart: null }))}
                    selectedPart={modalSettings.selectedPart}
                >

                </NewModalParts>
            )}
            {modalSettings.isOpenDelete && (
                <div>
                    <ModalDelete
                        isOpen={modalSettings.isOpenDelete}
                        message={t("deleteMessage.Are you sure you want to delete this part?")}
                        onConfirmDelete={handleConfirmDelete}
                        onClose={() => setModalSettings((prevModalSettings) => ({ ...prevModalSettings, isOpenDelete: false, selectedPart: null }))}
                    />
                </div>
            )}
        </div>
    )
}

export default Piese
