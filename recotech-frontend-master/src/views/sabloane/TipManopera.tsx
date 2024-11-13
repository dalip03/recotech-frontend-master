import CustomTable from '../../components/common/CustomTable'
import { HiPencil, HiTrash } from 'react-icons/hi'
import { Button } from '@/components/ui'
import { useEffect, useState } from 'react'
import { deleteProjectTypeTemplate, saveProjectType, updateProjectTypeTemplate } from '@/api/projectTypeService'
import ModalDelete from '@/components/common/ModalDelete'
import TipManoperaModal from './documente/components/modals/TipManoperaModal'
import { t } from 'i18next'
import { deleteStatementType, fetchStatementTypes, saveStatementType, updateStatementType } from '@/api/statementTypeService'
import CustomDropdown from '@/components/common/CustomDropdown'

const TipManopera = () => {
    const [statementTypes, setStatementTypes] = useState<any>([]);
    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedStatement: null,
    });

    const fetchStatementTypeData = async () => {
        const result = await fetchStatementTypes();
        setStatementTypes(result);
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchStatementTypeData();
        };
        fetchData();
    }, [])

    const handleEdit = (id: any) => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
            selectedStatement: statementTypes.find((statementType: any) => statementType.id == id)
        }))
    }
    const handleDelete = (id: any) => {
        setModalData((prev: any) => ({
            ...prev,
            selectedStatement: statementTypes.find((statementType: any) => statementType.id == id)
        }))
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: true
        }));
    }

    const handleDeleteConfirmation = async () => {
        const result = await deleteStatementType(modalData.selectedStatement.id);
        await fetchStatementTypeData();
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: false,
            selectedStatement: null
        }));
    }

    const onSubmit = async (values: any) => {
        const objectToSubmit = {
            name: values.name,
        }
        if (values.id) {
            const result = await updateStatementType(values.id, objectToSubmit);
        } else {
            const result = await saveStatementType(objectToSubmit);
        }
        await fetchStatementTypeData();
        setModalData((prev: any) => ({
            ...prev,
            isOpen: false,
            selectedStatement: null
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
                <h3 className="text-3xl font-semibold mb-4">{t("Statement Type")}</h3>
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
                    data={statementTypes}
                    actionButton={
                        <Button
                            style={{ background: '#0188cc', color: 'white' }}
                            onClick={handleAddRow}
                        >
                            {t("Add Statement Type")}
                        </Button>
                    }
                />
            </div>
            {modalData.isOpen && (
                <TipManoperaModal
                    isOpen={modalData.isOpen}
                    onClose={() => setModalData((prev: any) => ({ ...prev, isOpen: false, selectedStatement: null }))}
                    selectedStatement={modalData.selectedStatement} onSubmit={onSubmit}
                />
            )}
            {modalData.isOpenDelete && (
                <ModalDelete
                    isOpen={modalData.isOpenDelete}
                    message={t("deleteMessage.Are you sure you want to delete this statement type?")}
                    onConfirmDelete={handleDeleteConfirmation}
                    onClose={() => setModalData({ ...modalData, isOpenDelete: false, selectedStatement: null })}
                />
            )}
        </div>
    )
}

export default TipManopera
