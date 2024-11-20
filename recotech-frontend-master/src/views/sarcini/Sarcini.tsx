import { useEffect, useState } from 'react'
import { Button, Card } from '../../components/ui'
import { HiCheck, HiOutlineClipboardList, HiPencil, HiTrash } from 'react-icons/hi'
import {
    fetchTasks,
    fetchTaskStatistics,
    removeTaskAssignee,
    saveTask,
    updateTask,
    updateTaskAssignee,
    updateTaskStatus,
} from '../../api/sarciniService'
import { CellContext, Row } from '@tanstack/react-table'
import { fetchUsers } from '@/api/userService'
import CustomTable from "@/components/common/CustomTable";
import ModalDelete from "@/components/common/ModalDelete";

import { deleteTask, finishTask } from "@/api/sarciniService";
import { useAppSelector } from '@/store'
import ModalSarcini from './components/modals/ModalSarcini'
import toastNotification from '@/components/common/ToastNotification'
import CustomDropdown from '@/components/common/CustomDropdown'
import { useTranslation } from 'react-i18next'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import TaskStatistics from './components/TaskStatistics'
import { Link } from 'react-router-dom'
import { sendNotification } from '@/api/notificationService'
import { NotificationType } from '@/components/template/Notification'
import { getProjectById } from '@/api/projectService'

const Sarcini = () => {
    const [data, setData] = useState<any>({
        allTasks: [],
        myTasks: [],
    });
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedTask: null,
    });



    const user = useAppSelector((state) => state.auth.user)
    const { t } = useTranslation();

    const fetchData = async () => {
        try {
            // Fetch tasks and filter out templates
            const allTasks = await fetchTasks();
            const tasks = allTasks.filter((task: any) => task.template !== true);

            // Fetch users
            const usersData = await fetchUsers();
            const users = usersData.data.content;

            // Fetch project details for each task
            const extendedTasks = await Promise.all(
                tasks.map(async (task: any) => {
                    const project = await getProjectById(task.projectId); // Fetch each project by its ID
                    return {
                        ...task,
                        createdBy: users.find((user: any) => String(user.id) === String(task.createdBy)),
                        assignedTo: task.assignedTo
                            .map((assignedId: any) => users.find((user: any) => String(user.id) === String(assignedId)) || null)
                            .filter((user: any) => user !== null), // Exclude null values
                        project: project || null // Project details from `fetchProjectById`
                    };
                })
            );

            // Format tasks for your table structure
            const formattedData = extendedTasks.map((task: any) => ({
                id: task.id.toString(),
                name: task.name,
                project: task.project ? { id: task.project.id, name: task.project.name } : null, // Include project name and id
                type: task.type ?? null,
                description: task.description || null,
                status: task.status && task.status != '' ? task.status : null,
                deadline: task.deadline ?? null,
                priority: task.priority || null,
                createdBy: task.createdBy,
                assignedTo: task.assignedTo
            }));

            // Filter for user's assigned tasks and set state
            setData({
                allTasks: formattedData,
                myTasks: formattedData.filter((task: any) =>
                    task.assignedTo.some((assignedUser: any) => String(assignedUser.id) === String(user.id))
                ),
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    useEffect(() => {
        const fetchAllData = async () => {
            try {
                await fetchData();
            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }
        fetchAllData()
    }, [])

    const handleAssignTaskToSelf = async (taskId: string) => {
        try {
            await updateTaskAssignee(user.id, taskId)
                .then(() => {
                    toastNotification.success('Sarcină preluată cu succes!');
                })
                .catch(() => {
                    toastNotification.error('Nu s-a putut prelua sarcina!');
                })
            await fetchData();
        } catch (error) {
            console.error('Error assigning task:', error);
        }
    }

    const allTasksColumns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Project"),
            accessorKey: 'project',
            cell: ({ row }: any) => {
                return (
                    row.original.project && (
                        <Link className='text-blue-500 hover:text-blue-300' to={`/proiecte/${row.original.project.id}`}>
                            {row.original.project.name}
                        </Link>
                    ) || ('-')
                )
            }
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        // TODO refactor post relationship integration
        {
            header: t("Operators"),
            accessorKey: 'assignedTo',
            cell: ({ row }: any) => {
                // TODO REFACTOR THIS WHEN RELATIONSHIP IS IMPLEMENTED
                return (row.original.assignedTo) ? row.original.assignedTo.map((user: any) => `${user.lastName} ${user.firstName}`).join(', ') : '-'
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
                return (row.original.deadline) ? new Date(row.original.deadline).toLocaleDateString() : '-'
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                ]
                if (hasAccess(user.authority as UserRole, ['ADMIN'])) {
                    rowActions.push({ eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDelete(row.original.id) })
                }
                !row.original.assignedTo.includes(user.id) && rowActions.push({ eventKey: `${row.original.id}_assign`, label: t("Self Assign Task"), onClick: () => handleAssignTaskToSelf(row.original.id) })
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ]

    const myTasksColumns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Project"),
            accessorKey: 'project',
            cell: ({ row }: any) => {
                return (
                    row.original.project && (
                        <Link className='text-blue-500 hover:text-blue-300' to={`/proiecte/${row.original.project.id}`}>
                            {row.original.project.name}
                        </Link>
                    ) || ('-')
                )
            }
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        // TODO refactor post relationship integration
        {
            header: t("Operators"),
            accessorKey: 'assignedTo',
            cell: ({ row }: any) => {
                // TODO REFACTOR THIS WHEN RELATIONSHIP IS IMPLEMENTED
                return (row.original.assignedTo) ? row.original.assignedTo.map((user: any) => `${user.lastName} ${user.firstName}`).join(', ') : '-'
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
                return (row.original.deadline) ? new Date(row.original.deadline).toLocaleDateString() : '-'
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actions',
            cell: ({ row }: CellContext<Row<unknown>, unknown>) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_finalize`, label: t("Finalize"), onClick: () => handleFinalize(row.original.id) },
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                ]
                if (hasAccess(user.authority as UserRole, ['ADMIN'])) {
                    rowActions.push({ eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDelete(row.original.id) })
                }
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ];

    // My Tasks Methods

    const handleFinalize = async (id: string) => {
        try {
            await finishTask('APPROVED', id);
            await fetchData();  // Fetch updated data after task finalization
        } catch (error) {
            console.error('Error finalizing task:', error);
        }
    };

    // All Tasks Methods

    const handleEdit = (id: string) => {
        const selectedTask = data.allTasks.find((sarcina: any) => sarcina.id === id);
        setModalSettings({
            ...modalSettings,
            isOpen: true,
            selectedTask: selectedTask,
        })
    }

    const username = useAppSelector((state) => state.auth.user.username);
    const handleOperatorAddedToProject = async (projectId: any, userId: any) => {
        const notificationData: NotificationType = {
            object: {
                roles: [],
                userId: [userId],
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

    const handleSubmit = async (taskData: any) => {
        const taskId = taskData.id;
        const submitObject: any = {
            name: taskData.taskTitle,
            description: taskData.description,
            status: taskData ?? 'TODO',
            priority: 'LOW',
            projectId: taskData.projectId,
            type: taskData.projectType,
            assignedToId: taskData.assignedTo,
            template: modalSettings.selectedTask?.template || false,
        }

        if (modalSettings.selectedTask && modalSettings.selectedTask.assignedTo.length > 0) {
            modalSettings.selectedTask.assignedTo.forEach(async (userId: number) => {
                await removeTaskAssignee(userId, taskId);
            });
        }

        if (taskId) {
            await updateTaskStatus(submitObject.status, taskId);
            delete submitObject?.priority;
            delete submitObject?.status;
            const updateObject = {
                name: submitObject.name,
                description: submitObject.description,
                type: submitObject.type,
                projectId: submitObject.projectId,
            }
            if (submitObject.assignedToId.length > 0) {
                await updateTask(updateObject, taskId);
                submitObject.assignedToId.forEach(async (userId: number) => {
                    await updateTaskAssignee(userId, taskId);
                    await handleOperatorAddedToProject(taskData.projectId, userId);
                });

            } else {
                await updateTask(submitObject, taskId);
            }
        } else {
            const additionalUsers = submitObject.assignedToId.slice(1);
            submitObject.assignedToId = submitObject.assignedToId[0];
            const result: any = await saveTask(submitObject);
            additionalUsers.forEach(async (userId: any) => {
                await updateTaskAssignee(userId, result.data.id);
                await handleOperatorAddedToProject(taskData.projectId, userId);
            });
        }
        setModalSettings({ ...modalSettings, isOpen: false, selectedTask: null })
        await fetchData();
    }

    // Common Methods 
    const handleDelete = async (id: string) => {
        setModalSettings({ ...modalSettings, isOpenDelete: true, selectedTask: data.allTasks.find((sarcina: any) => sarcina.id === id) });

    };

    const handleConfirmDelete = async () => {
        await deleteTask(modalSettings?.selectedTask?.id);
        await fetchData();  // Re-fetch data after deletion confirmation
        setModalSettings({ ...modalSettings, isOpenDelete: false, selectedTask: null });
    };

    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Tasks")}</h3>
            </div>
            <TaskStatistics />
            <div>
                <div>
                    <h3 className="pb-4 pt-4 font-bold ">
                        {t("My Tasks")}
                    </h3>
                </div>
                <div
                  
                    style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '16px',
                    }}
                >
                    <CustomTable columns={myTasksColumns} data={data.myTasks} />
                </div>

            </div>
            <div>
                <div>
                <h3 className="pb-4 pt-4 font-bold ">
                        {t("All Tasks")}
                    </h3>
                </div>
                <div

                    style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '16px',
                    }}
                >
                    <CustomTable
                        columns={allTasksColumns}
                        data={data.allTasks}
                        actionButton={
                            hasAccess(user.authority as UserRole, ['ADMIN']) && (
                                <Button
                                    style={{ background: '#0188cc', color: 'white' }}
                                    onClick={() => setModalSettings({ ...modalSettings, isOpen: true, selectedTask: null })}
                                >
                                    {t("Add Tasks")}
                                </Button>
                            )
                        }
                    />
                </div>
            </div>
            {modalSettings.isOpen && (
                <ModalSarcini
                    isOpen={modalSettings.isOpen}
                    onClose={() => setModalSettings({ ...modalSettings, isOpen: false, selectedTask: null })}
                    handleSubmit={handleSubmit}
                    data={modalSettings.selectedTask}
                    projectId={modalSettings?.selectedTask?.projectId}
                />
            )}
            {modalSettings.isOpenDelete && (
                <ModalDelete
                    isOpen={modalSettings.isOpenDelete}
                    message={t("deleteMessage.Are you sure you want to delete this task?")}
                    onConfirmDelete={handleConfirmDelete}
                    onClose={() => setModalSettings({ ...modalSettings, isOpenDelete: false, selectedTask: null })}
                />
            )}
        </div>
    )
}

export default Sarcini
