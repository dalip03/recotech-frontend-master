import { deleteStatement, fetchStatements, saveStatement, updateStatement, updateStatementAssignee } from "@/api/constatariService";
import { sendNotification } from "@/api/notificationService";
import { deletePartRequest, fetchPartById, fetchStatementParts, savePartsRequest, updatePartRequest } from "@/api/partsService";
import { fetchUsers } from "@/api/userService";
import CustomDropdown from "@/components/common/CustomDropdown";
import CustomTable from "@/components/common/CustomTable";
import ModalDelete from "@/components/common/ModalDelete";
import { NotificationType } from "@/components/template/Notification";
import { Button } from "@/components/ui";
import { useAppSelector } from "@/store";
import { hasAccess, UserRole } from "@/utils/sharedHelpers";
import ModalConstatari from "@/views/constatari/components/modals/ModalConstatari";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiPencil, HiTrash } from "react-icons/hi";

interface Constatare {
    id: string
    nume: string
    cost: string
    status: string
    comentarii: string
    operator: string
    actiuni: string
}

export default function InformatiiConstatari({ projectId }: any) {

    const [data, setData] = useState([]);
    const [users, setUsers] = useState([]);
    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedStatement: null,
    })

    const { t } = useTranslation();
    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;
    const username = useAppSelector((state) => state.auth.user.username);

    const fetchStatementData = async () => {
        try {
            const statements = (await fetchStatements()).filter((statement: any) => statement.projectId == projectId);

            setData(statements);
            const users = await fetchUsers();
            setUsers(users.data.content);
        } catch (e) {
            console.error('Error fetching data', e);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchStatementData();
        }
        fetchData();
    }, [])

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
            header: t("Cost"),
            accessorKey: 'cost',
        },
        {
            header: t("Status"),
            accessorKey: 'status',
            cell: ({ row }: any) => {
                return row.original.status.replace('_', ' ');
            }
        },
        {
            header: t("Operator"),
            accessorKey: 'operator',
            cell: ({ row }: any) => {
                const assignedToIds = row.original.assignedTo ?? [];
                const operatori = users.filter((user: any) => assignedToIds.includes(user.id));
                const operatorNames = operatori.map((op: any) => `${op.lastName} ${op.firstName}`).join(', ');
                return operatorNames;
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [];
                if (hasAccess(userRole, ['ADMIN'])) {
                    rowActions.push(
                        { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                        { eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDelete(row.original.id) },
                    )
                } else {
                    rowActions.push(
                        { eventKey: `${row.original.id}_edit`, label: t("View"), onClick: () => handleEdit(row.original.id) }
                    )
                }
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ]



    const handleDelete = (id: string) => {
        setModalData((prevModalData: any) => ({
            ...prevModalData,
            isOpenDelete: true,
            selectedStatement: data.find((statement: any) => statement.id === id),
        }))
    }

    const handleConfirmDelete = async () => {
        // @ts-ignore
        await deleteStatement(modalData.selectedStatement?.id);
        await fetchStatementData();
        setModalData((prevModalData: any) => ({
            ...prevModalData,
            isOpenDelete: false,
            selectedStatement: null,
        }))
    }

    const handleCancelDelete = () => {
        setModalData((prevModalData: any) => ({
            ...prevModalData,
            isOpenDelete: false,
            selectedStatement: null,
        }))
    }

    const handleClose = () => {
        setModalData((prevModalData: any) => ({
            ...prevModalData,
            isOpen: false,
            selectedStatement: null,
        }))
    }

    const handleOpen = () => {
        setModalData((prevModalData: any) => ({
            ...prevModalData,
            isOpen: true,
            selectedStatement: null,
        }))
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
    }

    const handlePartRequest = async (partValues: any, statementId: any) => {
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
                statementId: statementId,
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
        console.log('AICI', notificationData);
        await sendNotification(notificationData);
    }

    const handleSubmit = async (values: any) => {
        const statementId = values.id;
        const submitObject = {
            name: values.name,
            description: values.description,
            cost: Number(values.laborCost),
            status: values?.status != '' ? values.status : 'TODO',
            projectId: projectId,
            deadline: values.deadline ? new Date(values.deadline) : null,
            template: values.template ?? true,
            type: values.statementType ?? '',
            assignedToId: values.assignedTo ?? [],
        }

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
            await handlePartRequest(values.parts, statementId);
        } else {
            const additionalUsers = submitObject.assignedToId.slice(1);
            submitObject.assignedToId = submitObject.assignedToId[0];
            const result: any = await saveStatement(submitObject);
            console.log(result);

            await handlePartRequest(values.parts, result.data.id);
            additionalUsers.forEach(async (userId: any) => {
                await updateStatementAssignee(userId, result.data.id);
                await handleOperatorAddedToProject(submitObject.projectId, userId);
            });
        }
        setModalData((prev: any) => ({ ...prev, isOpen: false, selectedStatement: null }))
        await fetchStatementData();
    }

    return (
        <div>
            <div>
                <h3 className="text-3xl font-semibold mb-4">{t("Statements")}</h3>
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
                    actionButton={
                        hasAccess(userRole, ['ADMIN']) && (
                            <Button
                                style={{ background: '#0188cc', color: 'white' }}
                                onClick={() => handleOpen()}
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
                        projectId={projectId}
                        isOpen={modalData.isOpen}
                        data={modalData.selectedStatement}
                        handleSubmit={handleSubmit}
                        onClose={handleClose}
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
            </div>
        </div>
    )
}