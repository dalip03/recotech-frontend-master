import { Button } from '@/components/ui'
import React, { useEffect, useState } from 'react'
import { HiCheck, HiOutlineBan, HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../../components/common/CustomTable'
import { deletePartRequest, fetchPartById, fetchProjectParts, savePartsRequest, updatePartRequest } from '@/api/partsService'
import ModalAddParts from './modals/ModalAddParts'
import toastNotification from '@/components/common/ToastNotification'
import ModalEditPart from './modals/ModalEditPart'
import ModalDelete from '@/components/common/ModalDelete'
import ModalConfirm from '@/components/common/ModalConfirm'
import { useTranslation } from 'react-i18next'
import CustomDropdown from '@/components/common/CustomDropdown'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { useAppSelector } from '@/store'
import { sendNotification } from '@/api/notificationService'
import { NotificationType } from '@/components/template/Notification'

const InformatiiPiese = ({ projectId }: any) => {
    const [data, setData] = useState([]);
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        isOpenEdit: false,
        isOpenDelete: false,
        confirmAction: {
            isOpen: false,
            actionType: '',
            message: ''
        },
        selectedPart: null,
    });

    const { t } = useTranslation();
    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;
    const username = useAppSelector((state) => state.auth.user.username);

    const fetchPartsData = async () => {
        await fetchProjectParts(projectId)
            .then((parts) => setData(parts))
            .catch(() => setData([]))
    }

    useEffect(() => {
        const fetchProjectRequestPartsData = async () => {
            await fetchPartsData();
        }
        fetchProjectRequestPartsData();
    }, [])

    const handleSubmit = async (values: any) => {
        for (const part of values.parts) {
            const objectToSubmit = {
                quantity: part.quantity,
                cost: part.part.cost * part.quantity,
                partName: part.part.name,
                partId: part.part.id,
                projectId: projectId,
                statementId: null
            }
            const notificationData: NotificationType = {
                object: {
                    roles: ['SUPER_ADMIN', 'ADMIN', 'PIESAR', 'MAGAZIE'],
                    userId: [],
                    redirectUrl: `/magazie`,
                },
                objectId: projectId,
                type: "MESSAGE_RECEIVED",
                message: `Part request for project ${projectId}`,
                timestamp: new Date().toISOString(),
                status: "UNREAD",
                from: username ?? '',
            };

            await savePartsRequest(objectToSubmit)
                .then(() => {
                    fetchPartsData();
                    toastNotification.success('Piesă salvată cu succes!');
                })
                .catch(() => {
                    fetchPartsData();
                    toastNotification.error('Nu s-a putut salva piesa!');
                })
            await sendNotification(notificationData);
        }
        setModalSettings((prev: any) => ({ ...prev, isOpen: false }))

    }

    const handleEditSubmit = async (values: any) => {
        console.log(values);
        const objectToSubmit = {
            quantity: values.quantity,
            cost: values.part.cost * values.quantity,
            partName: values.part.name,
            partId: values.part.id,
            projectId: projectId,
            statementId: null,
            status: "NEW"
        }
        await updatePartRequest(objectToSubmit, modalSettings.selectedPart.id)
            .then(() => {
                toastNotification.success('Piesă actualizată cu succes!');
            })
            .catch(() => {
                toastNotification.error('Nu s-a putut actualiza piesa!');
            })
            .finally(() => {
                setModalSettings((prev: any) => ({ ...prev, isOpenEdit: false, selectedPart: null }))
                fetchPartsData();
            })

    }

    const handleEdit = async (id: any) => {
        const selectedPart: any = data.find((part: any) => part.id === id) || null;

        const partDetails = await fetchPartById(selectedPart?.partId)
        selectedPart.part = partDetails;

        setModalSettings((prev: any) => ({ ...prev, isOpenEdit: true, selectedPart }))
    }

    const handleDelete = (id: any) => {
        const selectedPart = data.find((part: any) => part.id == id) || null;
        setModalSettings((prev: any) => ({ ...prev, isOpenDelete: true, selectedPart }));
        console.log('Delete')
    }

    const handleDeleteConfirm = async () => {
        await deletePartRequest(modalSettings.selectedPart.id)
            .then(() => {
                toastNotification.success('Piesă ștearsă cu succes!');
            })
            .catch(() => {
                toastNotification.error('Nu s-a putut sterge piesa!');
            })
            .finally(() => {
                setModalSettings((prev: any) => ({ ...prev, isOpenDelete: false, selectedPart: null }));
                fetchPartsData();
            })
    }

    const handlePartApproval = async (type: any) => {
        const objectToSubmit = {
            quantity: modalSettings?.selectedPart.quantity,
            cost: modalSettings?.selectedPart.cost,
            partName: modalSettings?.selectedPart.partName,
            partId: modalSettings?.selectedPart.partId,
            projectId: modalSettings?.selectedPart.projectId,
            statementId: modalSettings?.selectedPart.statementId,
            status: type
        }
        await updatePartRequest(objectToSubmit, modalSettings?.selectedPart.id)
            .then(() => {
                toastNotification.success('Piesă aprobată cu succes!');
            })
            .catch(() => {
                toastNotification.error('Nu s-a putut aprobă piesa!');
            })
            .finally(() => {
                fetchPartsData();
            })
    }

    const handleConfirmAction = async (actionType: any, id: any) => {
        const selectedPart = data.find((part: any) => part.id == id) || null;
        setModalSettings((prev: any) => ({
            ...prev,
            selectedPart,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: true,
                actionType,
                message: actionType === 'APPROVED' ? t("confirmMessage.approve-part") : t("confirmMessage.deny-part"),
            }
        }));
    }

    const handleConfirmActionSubmit = async () => {
        switch (modalSettings.confirmAction.actionType) {
            case 'APPROVED':
                await handlePartApproval(modalSettings.confirmAction.actionType)
                break;
            case 'REJECTED':
                await handlePartApproval(modalSettings.confirmAction.actionType)
                break;
            default:
                break;
        }
        setModalSettings((prev: any) => ({
            ...prev,
            selectedPart: null,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: false,
                actionType: '',
                message: '',
            }
        }));
    }

    const columns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Name"),
            accessorKey: 'partName',
        },
        {
            header: t("Cost"),
            accessorKey: 'cost',
        },
        {
            header: t("Status"),
            accessorKey: 'status',
            cell: ({ row }: any) => {
                switch (row.original.status) {
                    case 'NEW':
                        return 'Nou';
                    case 'APPROVED':
                        return "Aprobat";
                    case 'REJECTED':
                        return "Neaprobat";
                }
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                if (!hasAccess(userRole, ['ADMIN'])) {
                    return null
                }
                const rowActions = [
                    { eventKey: `${row.original.id}_approve`, label: t("Approve"), onClick: () => handleConfirmAction("APPROVED", row.original.id) },
                    { eventKey: `${row.original.id}_deny`, label: t("Deny"), onClick: () => handleConfirmAction("REJECTED", row.original.id) },
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

    return (
        <div>
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
                    actionButton={
                        hasAccess(userRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                            <Button
                                style={{ background: '#0188cc', color: 'white' }}
                                onClick={() => setModalSettings({ ...modalSettings, isOpen: true })}
                            >
                                {t("Add Parts")}
                            </Button>
                        )
                    }
                />
            </div>
            {modalSettings.isOpen && (
                <ModalAddParts
                    isOpen={modalSettings.isOpen}
                    onClose={() => setModalSettings({ ...modalSettings, isOpen: false })}
                    onSubmit={handleSubmit}
                />
            )}
            {modalSettings.isOpenEdit && (
                <ModalEditPart
                    isOpen={modalSettings.isOpenEdit}
                    onClose={() => setModalSettings({ ...modalSettings, isOpenEdit: false, selectedPart: null })}
                    onSubmit={handleEditSubmit}
                    selectedPart={modalSettings.selectedPart}
                />
            )}
            {modalSettings.isOpenDelete && (
                <ModalDelete
                    isOpen={modalSettings.isOpenDelete}
                    message={t("deleteMessage.Are you sure you want to delete this part?")}
                    onConfirmDelete={handleDeleteConfirm}
                    onClose={() => setModalSettings({ ...modalSettings, isOpenDelete: false, selectedPart: null })}
                />
            )}
            {modalSettings.confirmAction.isOpen && (
                <ModalConfirm
                    isOpen={modalSettings.confirmAction.isOpen}
                    message={modalSettings.confirmAction.message}
                    onConfirm={handleConfirmActionSubmit}
                    onClose={() => setModalSettings({ ...modalSettings, confirmAction: { ...modalSettings.confirmAction, isOpen: false, message: '' } })}
                />
            )}
        </div>
    )
}

export default InformatiiPiese
