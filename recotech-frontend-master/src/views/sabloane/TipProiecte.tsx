import CustomTable from '../../components/common/CustomTable'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { Button } from '@/components/ui'
import { useEffect, useState } from 'react'
import { deleteProjectTypeTemplate, fetchProjectTypes, saveProjectType, updateProjectTypeTemplate } from '@/api/projectTypeService'
import TipProiecteModal from './documente/components/modals/TipProiecteModal'
import ModalDelete from '@/components/common/ModalDelete'
import { t } from 'i18next'
import CustomDropdown from '@/components/common/CustomDropdown'

const TipProiecte = () => {
    const [projectTypes, setProjectTypes] = useState<any>([]);
    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedProjectType: null,
    });

    const fetchProjectTypeData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypes(result);
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchProjectTypeData();
        };
        fetchData();
    }, [])

    const handleEdit = (id: any) => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
            selectedProjectType: projectTypes.find((projectType: any) => projectType.id == id)
        }))
    }
    const handleDelete = (id: any) => {
        setModalData((prev: any) => ({
            ...prev,
            selectedProjectType: projectTypes.find((projectType: any) => projectType.id == id)
        }))
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: true
        }));
    }

    const handleDeleteConfirmation = async () => {
        const result = await deleteProjectTypeTemplate(modalData.selectedProjectType.id);
        await fetchProjectTypeData();
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: false,
            selectedProjectType: null
        }));
    }

    const onSubmit = async (values: any) => {
        const objectToSubmit = {
            id: values.id,
            createDate: new Date().toISOString(),
            name: values.name,
            variables: values.variables
        }
        if (objectToSubmit.id) {
            const result = await updateProjectTypeTemplate(objectToSubmit, objectToSubmit.id);
        } else {
            const result = await saveProjectType(objectToSubmit);
        }
        await fetchProjectTypeData();
        setModalData((prev: any) => ({
            ...prev,
            isOpen: false,
            selectedProjectType: null
        }));
    }

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Name"),
            accessorKey: 'name',
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

    const handleAddRow = () => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
        }))
    }
    return (
        <div>
            <div>
                <h3 className="text-3xl font-semibold mb-4">{t("Project Types")}</h3>
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
                    data={projectTypes}
                    actionButton={
                        <Button
                            style={{ background: '#0188cc', color: 'white' }}
                            onClick={handleAddRow}
                        >
                            {t("Add Project Type")}
                        </Button>
                    }
                />
            </div>
            {modalData.isOpen && (
                <TipProiecteModal
                    isOpen={modalData.isOpen}
                    onClose={() => setModalData((prev: any) => ({ ...prev, isOpen: false, selectedProjectType: null }))}
                    selectedProjectType={modalData.selectedProjectType} onSubmit={onSubmit}
                />
            )}
            {modalData.isOpenDelete && (
                <ModalDelete
                    isOpen={modalData.isOpenDelete}
                    message={t("deleteMessage.Are you sure you want to delete this project type?")}
                    onConfirmDelete={handleDeleteConfirmation}
                    onClose={() => setModalData({ ...modalData, isOpenDelete: false, selectedProjectType: null })}
                />
            )}
        </div>
    )
}

export default TipProiecte
