import { fetchTasks, finishTask, removeTaskAssignee, saveTask, updateTask, updateTaskAssignee, updateTaskStatus } from "@/api/sarciniService";
import { fetchUsers } from "@/api/userService";
import CustomDropdown from "@/components/common/CustomDropdown";
import CustomTable from "@/components/common/CustomTable";
import { useAppSelector } from "@/store";
import ModalSarcini from "@/views/sarcini/components/modals/ModalSarcini";
import { CellContext, Row } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next"

const MyTasks = () => {
    // TODO finish this when talking about backend
    const { t } = useTranslation();
    const [data, setData] = useState([]);
    const [modalSettings, setModalSettings] = useState<any>({
        isOpen: false,
        isOpenDelete: false,
        selectedTask: null,
    });
    const user = useAppSelector((state) => state.auth.user)

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

    const fetchData = async () => {
        try {
            const allTasks = await fetchTasks();
            const tasks = allTasks.filter((task: any) => task.template != true);
            const usersData = await fetchUsers();
            const users = usersData.data.content
            const extendedTasks = tasks.map((task: any) => ({
                ...task,
                createdBy: users.find((user: any) => String(user.id) === String(task.createdBy)),
                assignedTo: task.assignedTo.map((assignedId: any) => {
                    const user = users.find((user: any) => String(user.id) === String(assignedId));
                    return user ? user.id : null;  // Return the user ID if found
                }).filter((id: any) => id !== null) // Filter out any null values

            }))
            // Format the data if needed to match your table structure
            const formattedData = extendedTasks.map((task: any) => ({
                ...task,
                id: task.id.toString(),
                name: task.name,
                project: task?.project ?? null,
                type: task?.type ?? null,
                description: task.description || null,
                status: task?.status ?? null,
                deadline: task?.deadline ?? null,
                priority: task.priority || null,
            }))

            setData(formattedData.filter((task: any) => task.assignedTo.some((assignedUser: any) => assignedUser === user.id)))
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }

    const handleFinalize = async (id: string) => {
        try {
            await finishTask('APPROVED', id);
            await fetchData();  // Fetch updated data after task finalization
        } catch (error) {
            console.error('Error finalizing task:', error);
        }
    };

    const handleEdit = (id: string) => {
        const selectedTask = data.find((sarcina: any) => sarcina.id === id);
        setModalSettings({
            ...modalSettings,
            isOpen: true,
            selectedTask: selectedTask,
        })
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

        await updateTaskStatus(submitObject.status, taskId);
        delete submitObject?.priority;
        delete submitObject?.status;

        await updateTask(submitObject, taskId);

        setModalSettings({ ...modalSettings, isOpen: false, selectedTask: null })
        await fetchData();
    }

    const handleDelete = async (id: string) => {
        setModalSettings({ ...modalSettings, isOpenDelete: true, selectedTask: data.find((sarcina: any) => sarcina.id === id) });
    };

    const myTasksColumns = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t("Name"),
            accessorKey: 'name',
        },
        {
            header: t("Description"),
            accessorKey: 'description',
        },
        {
            header: t("Status"),
            accessorKey: 'status',
        },
        {
            header: t("Actions"),
            accessorKey: 'actions',
            cell: ({ row }: CellContext<Row<unknown>, unknown>) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_finalize`, label: t("Finalize"), onClick: () => handleFinalize(row.original.id) },
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
    ];

    return (
        <div>
            <div className="flex items-center justify-between w-full mb-4 mt-4">
                <h4 className="text-3xl font-semibold">{t("My Tasks")}</h4>
            </div>
            <div
                className="mt-4"
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                }}
            >
                <CustomTable columns={myTasksColumns} data={data} />
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
        </div>
    )
}

export default MyTasks;