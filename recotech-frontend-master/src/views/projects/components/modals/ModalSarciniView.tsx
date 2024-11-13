import { sendNotification } from "@/api/notificationService";
import { fetchTasks, saveTask, updateTask, updateTaskAssignee, updateTaskPriority, updateTaskStatus } from "@/api/sarciniService";
import { fetchUsers } from "@/api/userService";
import CustomTable from "@/components/common/CustomTable";
import { NotificationType } from "@/components/template/Notification";
import { Button, Dialog } from "@/components/ui";
import { useAppSelector } from "@/store";
import ModalSarcini from "@/views/sarcini/components/modals/ModalSarcini";
import { CellContext, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiPencil } from "react-icons/hi";


export default function ModalSarciniView({ isOpen, onClose, projectId }: any) {
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedTask: null,
    });
    const [data, setData] = useState([]);
    const [users, setUsers] = useState<any>([]);
    const { t } = useTranslation();

    const fetchData = async () => {
        const result = await fetchTasks();
        const filteredTasks = result.filter((task: { status: string }) => task.status.trim().toUpperCase() == "DRAFT");
        const usersResult = await fetchUsers();
        setUsers(usersResult.data.content);
        setData(filteredTasks);
    }

    useEffect(() => {
        fetchData();
    }, [])

    const allTasksColumns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        {
            header: t("Operators"),
            accessorKey: 'operator',
            cell: ({ row }: any) => {
                const operator = users.find((user: any) => row.original.assignedTo.includes(user.id));
                return (
                    operator ? `${operator.lastName} ${operator.firstName}` : '-'
                )
            }
        },
        {
            header: t("Status"),
            accessorKey: 'status',
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
            cell: ({ row }: CellContext<Row<unknown>, unknown>) => (
                <div className="flex space-x-2">
                    <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleAddTaskToProject(row.original.id)}
                    >
                        {t("Add")}
                    </button>
                </div>
            ),
        },
    ]

    const username = useAppSelector((state) => state.auth.user.username);
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

    const handleAddTaskToProject = async (id: any) => {
        const task: any = data.filter((item: any) => item.id === id)[0];
        const submitObject = {
            name: task.name,
            description: task.description,
            type: task.type,
            status: 'TODO',
            priority: task.priority,
            projectId: parseInt(projectId),
            template: false,
            assignedToId: task.assignedTo[0],
        }
        const result = await saveTask(submitObject);
        await handleOperatorAddedToProject(projectId, task.assignedTo[0]);
        if (result) {
            await fetchData();
        }
    }

    const handleSubmit = async (taskData: any) => {
        const taskId = taskData.id;
        const submitObject: any = {
            name: taskData.taskTitle,
            description: taskData.description,
            status: taskData.status != '' ? taskData.status : 'TODO',
            priority: 'LOW',
            projectId: taskData.projectId,
            type: taskData.projectType,
            assignedToId: taskData.assignedTo,
            template: false,
        }

        if (taskId) {
            await updateTaskStatus(taskData.status, taskId);
            // await updateTaskPriority(submitObject.priority, taskId);
            submitObject.assignedToId.forEach(async (userId: number) => {
                await updateTaskAssignee(userId, taskId);
            });
            delete submitObject?.priority;
            delete submitObject?.status;
            await updateTask(submitObject, taskId);
        } else {
            const additionalUsers = submitObject.assignedToId.slice(1);
            submitObject.assignedToId = submitObject.assignedToId[0];
            const result: any = await saveTask(submitObject);
            additionalUsers.forEach(async (userId: any) => {
                await updateTaskAssignee(userId, result.data.id);
            });
        }
        setModalSettings({ ...modalSettings, isOpen: false, selectedTask: null })
        await fetchData();
    }

    return (
        <div>
            <Dialog width={1200} isOpen={isOpen} onClose={onClose}>
                <h5 className="mb-4">Adaugă Sarcină | Toate Sabloanele</h5>
                <div
                    className="mt-4"
                    style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '16px',
                    }}
                >
                    <CustomTable
                        columns={allTasksColumns}
                        data={data}
                        actionButton={
                            <Button
                                style={{ background: '#0188cc', color: 'white' }}
                                onClick={() => setModalSettings({ ...modalSettings, isOpen: true, selectedTask: null })}
                            >
                                Adauga sarcini
                            </Button>
                        }
                    />
                </div>
            </Dialog>
            {modalSettings.isOpen && (
                <div>
                    <ModalSarcini isOpen={modalSettings.isOpen} handleSubmit={handleSubmit} onClose={() => setModalSettings({ ...modalSettings, isOpen: false })} data={modalSettings.selectedTask} projectId={projectId} />
                </div>
            )}
        </div>
    );
}