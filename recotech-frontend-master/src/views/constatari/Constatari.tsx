import { Button } from '../../components/ui'
import React, { useEffect, useState } from 'react'
import { HiCheck, HiOutlineBan, HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../components/common/CustomTable'
import ModalConstatari from './components/modals/ModalConstatari'
import { ColumnDef } from '@tanstack/react-table'
import { deleteStatement, fetchStatements, saveStatement, updateStatement, updateStatementAssignee } from '../../api/constatariService'
import { useNavigate, useParams } from 'react-router-dom'
import ModalDelete from '../../components/common/ModalDelete'
import { fetchUsers } from '@/api/userService'
import { deletePartRequest, fetchPartById, fetchStatementParts, savePartsRequest, updatePartRequest } from '@/api/partsService'
import ModalConfirm from '@/components/common/ModalConfirm'
import toastNotification from '@/components/common/ToastNotification'
import { t } from 'i18next'
import CustomDropdown from '@/components/common/CustomDropdown'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { useAppSelector } from '@/store'
import { NotificationType } from '@/components/template/Notification'
import { sendNotification } from '@/api/notificationService'

interface Constatare {
    id: string
    nume: string
    cost: string
    status: string
    comentarii: string
    operator: string
    actiuni: string
}

const Constatari = () => {
    const { id } = useParams<{ id: string }>() // Get the ID from the URL
    const [data, setData] = useState<Constatare[]>([])

    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedStatement: null,
        confirmAction: {
            isOpen: false,
            actionType: '',
            message: '',
        }
    })
    const [users, setUsers] = useState<any>([]);

    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;
    const username = useAppSelector((state) => state.auth.user.username)


    const fetchStatementData = async () => {
        try {
            const statements = await fetchStatements()
            // Format the data if needed to match your table structure
            const formattedData = statements.map((statement: any) => ({
                ...statement,
                id: statement.id.toString(),
                name: statement.name || 'N/A',
                status: statement.status,
                description: statement.description || 'N/A',
                cost: statement.cost,
                assignedTo: statement.assignedTo,
                projectId: statement.projectId,
                deadline: statement.deadline,
                createdById: statement.createdById ?? null
            }))
            setData(formattedData)
            const usersResult = await fetchUsers();
            const usersData = usersResult.data.content;
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchStatementData();
        }

        fetchData()
    }, [])

    const handlePartApproval = async (type: string) => {
        const selectedStatement = modalData.selectedStatement;
        const statementParts = await fetchStatementParts(selectedStatement?.id);
        let success = true;
        for (const part of statementParts) {
            const objectToSubmit = {
                quantity: part.quantity,
                cost: part.cost,
                partName: part.partName,
                partId: part.partId,
                projectId: part.projectId,
                statementId: part.statementId,
                status: type
            }
            await updatePartRequest(objectToSubmit, part.id)
                .catch(() => {
                    success = false;
                    return;
                })
        }
        success
            ? toastNotification.success('Piesele au fost aprobate cu succes!')
            : toastNotification.error('Nu s-au putut aproba piesele!');
        fetchStatementData();
    }

    const handleConfirmAction = async (actionType: any, id: any) => {
        const selectedStatement = data.find((part: any) => part.id == id) || null;
        setModalData((prev: any) => ({
            ...prev,
            selectedStatement,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: true,
                actionType,
                message: actionType === 'APPROVED' ? t("confirmMessage.approve-part") : t("confirmMessage.deny-part"),
            }
        }));
    }

    const handleConfirmActionSubmit = async () => {
        switch (modalData.confirmAction.actionType) {
            case 'APPROVED':
                await handlePartApproval(modalData.confirmAction.actionType)
                break;
            case 'REJECTED':
                await handlePartApproval(modalData.confirmAction.actionType)
                break;
            default:
                break;
        }
        setModalData((prev: any) => ({
            ...prev,
            selectedStatement: null,
            confirmAction: {
                ...prev.confirmAction,
                isOpen: false,
                actionType: '',
                message: '',
            }
        }));
    }

    const handleDeleteClick = (id: string) => {
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: true,
            selectedStatement: data.find((item) => item.id === id),
        }));
    }

    const handleConfirmDelete = async () => {
        await deleteStatement(modalData.selectedStatement?.id);
        await fetchStatementData();
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: false,
            selectedStatement: null,
        }))
    }


    const handleCancelDelete = () => {
        setModalData((prev: any) => ({
            ...prev,
            isOpenDelete: false,
            selectedStatement: null,
        }))
    }

    const handleOpenModal = () => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
        }))
    }

    const handleCloseModal = () => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: false,
            selectedStatement: null,
        }));
    }

    const handleSaveComentarii = (id: string | null, comentarii: string) => {
        if (id) {
            setData((prevData) =>
                prevData.map((item) =>
                    item.id === id
                        ? { ...item, comentarii } // Update the comment
                        : item,
                ),
            )
        }
    }

    const handleEdit = async (id: any) => {
        const selectedStatement: any = data.find((statement: any) => statement.id === id);

        const statementsParts = await fetchStatementParts(id);

        // Use Promise.all to fetch all parts concurrently
        const updatedParts = await Promise.all(
            statementsParts.map(async (partRequest: any) => {
                const part = await fetchPartById(partRequest.partId);
                // Spread the properties of part into partRequest
                return { ...part, ...partRequest, cost: part.cost, requestCost: partRequest.cost };
            })
        );

        selectedStatement.parts = updatedParts;

        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
            selectedStatement: selectedStatement,
        }));
    };


    const handlePartRequest = async (partValues: any, statementId: any, projectId: any) => {
        // Create a set of part IDs from the current parts to identify which ones are still present
        const currentPartIds = (partValues.map((part: any) => part.part.id));
        const originalParts = modalData.selectedStatement?.parts || [];

        // Identify parts to delete
        const partsToDelete = originalParts.filter((part: any) => !currentPartIds.includes(part.id));

        // Delete the identified parts
        await handleDeleteOldRequestParts(partsToDelete);

        // Process the new or updated parts
        for (const partValue of partValues) {
            const objectToSubmit = {
                quantity: partValue.quantity,
                cost: partValue.part.requestCost ?? (partValue.part.cost * partValue.quantity),
                partName: partValue.part.name,
                partId: partValue.part.id,
                projectId: projectId ?? null,
                statementId: statementId,
                status: "NEW",
            };

            if (partValue.part.partId) {
                // Update the part if it exists
                await updatePartRequest(objectToSubmit, partValue.part.id);
            } else {
                // Save new parts
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
                await savePartsRequest(objectToSubmit);
                await sendNotification(notificationData);
            }
        }
    }

    const handleDeleteOldRequestParts = async (partsToDelete: any[]) => {
        // Loop through each part to delete and perform the delete operation
        for (const part of partsToDelete) {
            // Here, assume you have a function to delete a part by its ID
            await deletePartRequest(part.id); // Replace with your actual delete function
        }
    };

    const handleStatementDoneNotification = async (statementId: any) => {
        const notificationData: NotificationType = {
            object: {
                roles: ["SUPER_ADMIN", "ADMIN", "RECEPTION"],  // specify target role if any
                userId: [],   // specify userId if targeting a specific user
                redirectUrl: `/constatari/${statementId}`,
            },
            objectId: statementId,
            type: "MESSAGE_RECEIVED",
            message: `Statement ${statementId} has been finalized!`,
            timestamp: new Date().toISOString(),
            status: "UNREAD",
            from: username ?? '',
        };
        await sendNotification(notificationData);
    }

    const handleOperatorAddedToProject = async (projectId: any, userId: any) => {
        const notificationData: NotificationType = {
            object: {
                roles: [],  // specify target role if any
                userId: [userId],   // specify userId if targeting a specific user
                redirectUrl: `/proiecte/${projectId}`,
            },
            objectId: projectId,
            type: "MESSAGE_RECEIVED",
            message: `Added to project ${projectId}`,
            timestamp: new Date().toISOString(),
            status: "UNREAD",
            from: username ?? '',
        };
        await sendNotification(notificationData);
    }


    const handleSubmit = async (values: any) => {
        const statementId = values.id;
        const submitObject = {
            name: values.name,
            description: values.description,
            cost: Number(values.laborCost),
            status: values?.status != '' ? values.status : 'TODO',
            projectId: values.projectId,
            deadline: values.deadline ? new Date(values.deadline) : null,
            template: values.template ?? true,
            type: values.statementType ?? '',
            assignedToId: values.assignedTo ?? [],
        }

        try {
            if (statementId) {
                const updateObject = {
                    name: submitObject.name,
                    description: submitObject.description,
                    cost: submitObject.cost,
                    deadline: submitObject.deadline,
                    status: submitObject.status,
                    template: submitObject.template,
                    type: submitObject.type,
                    projectId: submitObject.projectId
                }
                if (submitObject.assignedToId.length > 0) {
                    await updateStatement(updateObject, statementId);
                    submitObject.assignedToId.forEach(async (userId: number) => {
                        await updateStatementAssignee(userId, statementId);
                        await handleOperatorAddedToProject(submitObject.projectId, userId);
                    });

                } else {
                    await updateStatement(submitObject, statementId);
                }
                await handlePartRequest(values.parts, statementId, values.projectId);
                if (values.status != modalData.selectedStatement.status && values.status == 'DONE') {
                    await handleStatementDoneNotification(statementId);
                }
            } else {
                const additionalUsers = submitObject.assignedToId.slice(1);
                submitObject.assignedToId = submitObject.assignedToId[0];
                const result: any = await saveStatement(submitObject);
                const newStatementId = result.id ?? result.data.id;
                await handlePartRequest(values.parts, newStatementId, values.projectId);
                additionalUsers.forEach(async (userId: any) => {
                    await updateStatementAssignee(userId, result.data.id);
                    await handleOperatorAddedToProject(submitObject.projectId, userId);
                });
                if (values.status != modalData.selectedStatement.status && values.status == 'DONE') {
                    await handleStatementDoneNotification(newStatementId);
                }
            }
        } catch (error) {
            console.log('error', error);
        }

        setModalData((prev: any) => ({ ...prev, isOpen: false, selectedStatement: null }))
        await fetchStatementData();
    }

    const columns: ColumnDef<Constatare>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: ({ row }: any) => (
                <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => handleEdit(row.original.id)} // Pass the ID to the modal
                >
                    {row.original.id}
                </span>
            ),
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        {
            header: t("Statement Type"),
            accessorKey: 'type',
        },
        {
            header: t("Operators"),
            accessorKey: 'assignedTo',
            cell: ({ row }: any) => {
                const assignedToIds = row.original.assignedTo ?? [];
                const operatori = users.filter((user: any) => assignedToIds.includes(user.id));
                const operatorNames = operatori.map((op: any) => `${op.lastName} ${op.firstName}`).join(', ');
                return operatorNames;
            }
        },
        {
            header: t("Status"),
            accessorKey: 'status',

            cell: ({ row }: any) => {
                return row.original.status.replace('_', ' ');
            }
        },
        {
            header: t("Deadline"),
            accessorKey: 'deadline',

            cell: ({ row }: any) => {
                console.log(row.original);
                return row.original.deadline ? new Date(row.original.deadline).toLocaleDateString() : '-'
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }) => {
                const rowActions = [];
                if (hasAccess(userRole, ['ADMIN'])) {
                    rowActions.push(
                        { eventKey: `${row.original.id}_approve`, label: t("Approve"), onClick: () => handleConfirmAction("APPROVED", row.original.id) },
                        { eventKey: `${row.original.id}_deny`, label: t("Deny"), onClick: () => handleConfirmAction('REJECTED', row.original.id) },
                        { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                        { eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDeleteClick(row.original.id) },
                    )
                } else if (hasAccess(userRole, ['OPERATOR', 'VANZATOR'])) {
                    rowActions.push(
                        { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                    )
                } else {
                    rowActions.push(
                        { eventKey: `${row.original.id}_view`, label: t("View"), onClick: () => handleEdit(row.original.id) },
                    )
                }
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            }
        },
    ]

    return (
        <div >
            <div >
            <h3 className="pb-4 pt-4 font-bold ">{t("Statements")}</h3>
            </div>
            <div
               
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                    minHeight:'20rem'
                }}
            >
                <CustomTable
                    columns={columns}
                    data={data}
                    actionButton={
                        hasAccess(userRole, ['ADMIN']) && (
                            <Button
                                style={{ background: '#0188cc', color: 'white' }}
                                onClick={() => handleOpenModal()} // Handle adding a new item
                            >
                                {t("Add Statement")}
                            </Button>
                        )
                    }
                />
            </div>
            <div>
                {modalData.isOpen && (
                    <ModalConstatari
                        isOpen={modalData.isOpen}
                        onClose={handleCloseModal}
                        handleSubmit={handleSubmit}
                        data={modalData.selectedStatement}
                        projectId={modalData.selectedStatement?.projectId}
                    />
                )}
                {modalData.isOpenDelete && (
                    <ModalDelete
                        isOpen={modalData.isOpenDelete}
                        message={t("deleteMessage.Are you sure you want to delete this statement?")}
                        onConfirmDelete={handleConfirmDelete}
                        onClose={handleCancelDelete}
                    />
                )}
                {modalData.confirmAction.isOpen && (
                    <ModalConfirm
                        isOpen={modalData.confirmAction.isOpen}
                        message={modalData.confirmAction.message}
                        onConfirm={handleConfirmActionSubmit}
                        onClose={() => setModalData({ ...modalData, confirmAction: { ...modalData.confirmAction, isOpen: false, message: '' } })}
                    />
                )}
            </div>
        </div>
    )
}

export default Constatari
