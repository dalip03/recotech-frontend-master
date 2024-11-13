import { Button } from '@/components/ui'
import { useEffect, useState } from 'react'
import { HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../../components/common/CustomTable'
import ModalSarcini from '../../sarcini/components/modals/ModalSarcini'
import { fetchTasks, saveTask, updateTask, updateTaskAssignee, updateTaskStatus } from '@/api/sarciniService'
import { fetchUsers } from '@/api/userService'
import ModalSarciniView from './modals/ModalSarciniView'
import { useTranslation } from 'react-i18next'
import CustomDropdown from '@/components/common/CustomDropdown'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { useAppSelector } from '@/store'
import { NotificationType } from '@/components/template/Notification'
import { sendNotification } from '@/api/notificationService'

interface InformatiiSarciniProps {
    projectId: any
}

const InformatiiSarcini: React.FC<InformatiiSarciniProps> = ({ projectId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        selectedTask: null
    })
    const [projectTasks, setProjectTasks] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])

    const { t } = useTranslation();
    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;

    const fetchData = async () => {
        const response = await fetchTasks();
        let filteredTasks = response.filter((task: { status: string }) => task.status.trim().toUpperCase() !== "DRAFT");
        filteredTasks = filteredTasks.filter((task: { projectId: any }) => (task.projectId == projectId));

        setProjectTasks(filteredTasks);
        const usersData = await fetchUsers();
        const fetchedUsers = usersData.data.content;

        setUsers(fetchedUsers);
    }

    useEffect(() => {
        const fetchProjectTasks = async () => {
            await fetchData()
        }
        fetchProjectTasks();
    }, [])

    const handleEdit = (id: any, preview: boolean = false) => {
        const editTask = projectTasks.find((task) => task.id == id);
        setModalSettings((prev: any) => ({
            ...prev,
            isOpen: true,
            selectedTask: editTask,
        }))
    }

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
            template: modalSettings.selectedTask?.template || false,
        }

        if (taskId) {
            await updateTaskStatus(taskData.status, taskId);
            submitObject.assignedToId.forEach(async (userId: number) => {
                await updateTaskAssignee(userId, taskId);
                await handleOperatorAddedToProject(taskData.projectId, userId);
            });
            const updateTaskObject = {
                name: taskData.taskTitle,
                description: taskData.description,
                type: taskData.projectType,
                projectId: taskData.projectId,
            }
            await updateTask(updateTaskObject, taskId);
        } else {
            await saveTask(submitObject);
        }
        setModalSettings({ ...modalSettings, isOpen: false, selectedTask: null })
        await fetchData();
    }

    const handleDelete = () => {
        console.log('Delete')
    }

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        fetchData();

    }

    // id, nume, operatori (toți operatorii),status ,pana la data de
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
            header: t("Operators"),
            accessorKey: 'operator',
            cell: ({ row }: any) => {
                const operator = users.find((user) => row.original.assignedTo.includes(user.id));
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
                return row.original.deadline ? new Date(row.original.deadline).toLocaleDateString() : '-'
            }
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [];
                if (hasAccess(userRole as UserRole, ['ADMIN'])) {
                    rowActions.push({ eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) })
                } else {
                    rowActions.push({ eventKey: `${row.original.id}_view`, label: t("View"), onClick: () => handleEdit(row.original.id, true) })
                }
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
                    data={projectTasks}
                    actionButton={
                        // TODO ROLES that can add tasks here
                        hasAccess(userRole, ['ADMIN']) && (
                            <Button
                                style={{ background: '#0188cc', color: 'white' }}
                                onClick={handleOpenModal}
                            >
                                {t("Add Task")}
                            </Button>
                        )
                    }
                />
            </div>
            {isModalOpen && (
                <ModalSarciniView projectId={projectId} isOpen={isModalOpen} onClose={handleCloseModal} />
            )}
            {modalSettings.isOpen && (
                <div>
                    <ModalSarcini isOpen={modalSettings.isOpen} handleSubmit={handleSubmit} onClose={() => setModalSettings({ ...modalSettings, isOpen: false })} data={modalSettings.selectedTask} projectId={projectId} />
                </div>
            )}
        </div>
    )
}

export default InformatiiSarcini
