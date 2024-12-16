import { useState, useEffect } from 'react'
import { Button, Input, Select } from '../../../components/ui'
import { HiMinus, HiOutlineUser, HiPlus } from 'react-icons/hi'
import {
    updateProject,
    getProjectById,
    addProject,
} from '../../../api/projectService'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchUsers } from '../../../api/userService'
import Avatar from '@/components/ui/Avatar/Avatar'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { fetchTasks } from '@/api/sarciniService'
import { updateUserPoints } from '@/api/userService'
import DatePicker from '@/components/ui/DatePicker/DatePicker'
import { useAppSelector } from '@/store'
import { useTranslation } from 'react-i18next'
import { sendNotification } from '@/api/notificationService'
import { NotificationType } from '@/components/template/Notification'

interface Proiect {
    createDate: string
    updateDate: string
    id: string
    name: string
    description: string
    type: string
    createdById: number | null
    status: string
    checkpoint: string
    projectClientId: number | null
    taskCount: number | null
    completedTaskCount: number | null
    materialCost: number | null
    laborCost: number | null
    discount: number | null
    discountType: string
    paymentType: string
    paymentDate: string
    vat: number | null
    totalCost: number | null
    totalCostDiscounted: number | null
    discountCalculated: number | null
    vatCalculated: number | null
    totalCostWithVat: number | null
    discountedLaborCost: number | null
    deliveryDate: any
}

interface User {
    id: number
    username: string
    firstName: string
    lastName: string
    role: string
    whitePoints: number
    blackPoints: number
}

const InformatiiProiect = ({ projectId,edit }: any) => {
    // let editt = true;
    //  editt = edit? edit : true;
    // console.log("editt -- ",editt )
    // console.log("edit -- ",edit )
    const { id } = useParams<{ id: string }>()
    const [users, setUsers] = useState<User[]>([])
    const user = useAppSelector((state) => state.auth.user);
    const [originalProject, setOriginalProject] = useState<Proiect>({
        createDate: '',
        updateDate: '',
        id: '',
        name: '',
        description: '',
        type: '',
        createdById: null,
        status: '',
        checkpoint: '',
        projectClientId: null,
        taskCount: null,
        completedTaskCount: null,
        materialCost: null,
        laborCost: null,
        discount: null,
        discountType: '',
        paymentType: '',
        paymentDate: '',
        vat: null,
        totalCost: null,
        totalCostDiscounted: null,
        discountCalculated: null,
        vatCalculated: null,
        totalCostWithVat: null,
        discountedLaborCost: null,
        deliveryDate: null,
    });
    const [project, setProject] = useState<Proiect>({
        createDate: '',
        updateDate: '',
        id: '',
        name: '',
        description: '',
        type: '',
        createdById: null,
        status: '',
        checkpoint: '',
        projectClientId: null,
        taskCount: null,
        completedTaskCount: null,
        materialCost: null,
        laborCost: null,
        discount: null,
        discountType: '',
        paymentType: '',
        paymentDate: '',
        vat: null,
        totalCost: null,
        totalCostDiscounted: null,
        discountCalculated: null,
        vatCalculated: null,
        totalCostWithVat: null,
        discountedLaborCost: null,
        deliveryDate: null,
    });
    const [projectTypeOptions, setProjectTypeOptions] = useState<any>([]);
    const [operatori, setOperatori] = useState<any>([]);

    const { t } = useTranslation();
    const navigate = useNavigate();

    const userRole = useAppSelector((state) => state.auth.user.authority);
    const hasAccess = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    const fetchProjectTypesData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypeOptions(result.map((result: any) => ({ value: result.name, label: result.name })));
    }


    const fetchUserData = async () => {
        try {
            const userDataResult = await fetchUsers()
            const userData = userDataResult.data.content
            const tasks = await fetchTasks();
            const taskUserIds = tasks.filter((task: any) => task.projectId == projectId).map((task: any) => task.assignedTo).flat().filter((userId: any, index: any, self: any) => self.indexOf(userId) === index);
            setOperatori(userData.filter((user: any) => taskUserIds.includes(user.id)));
            setUsers(userData)
        } catch (error) {
            console.error('Error fetching user data:', error)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const result = await getProjectById(id || '');
            setOriginalProject(result);
            setProject(result);
        }
        if (typeof id === 'string' && id !== 'nou') {
            fetchData()
        }

        fetchProjectTypesData();
    }, [id])

    useEffect(() => {
        const fetchUsersData = async () => {
            await fetchUserData();
        }

        fetchUsersData()
    }, [])

    const handleSave = async () => {
        const projectId: any = id;
        if (projectId !== 'nou') {
            await updateExistingProject(parseInt(projectId, 10))
        } else {
            await addNewProject();
        }
    }

    const updateExistingProject = async (projectId: number) => {
        try {
            if (isNaN(projectId)) {
                throw new Error('Invalid project ID')
            }
            const updatedProject = {
                name: project.name,
                type: project.type,
                description: project.description,
                status: project.status,
                deliveryDate: project.deliveryDate,
            }

            console.log(project.status)
            console.log(originalProject.status)

            if (project.status !== originalProject.status && project.status === 'COMPLETE') {
                const notificationData: NotificationType = {
                    object: {
                        roles: ["SUPER_ADMIN", "ADMIN", "RECEPTION"],  // specify target role if any
                        userId: [],   // specify userId if targeting a specific user
                        redirectUrl: `/proiecte/${projectId}`,
                    },
                    objectId: projectId,
                    type: "MESSAGE_RECEIVED",
                    message: `Project ${projectId} has been finalized!`,
                    timestamp: new Date().toISOString(),
                    status: "UNREAD",
                    from: user.username ?? '',
                };
                await sendNotification(notificationData);
            }
            await updateProject(projectId, updatedProject);
        } catch (error) {
            console.error('Failed to update project', error)
        }
    }

    const addNewProject = async () => {
        try {
            const projectData = {
                name: project.name,
                type: project.type,
                description: project.description,
                status: project.status != '' ? project.status : 'NEW',
                deliveryDate: project.deliveryDate,
            }

            const result = await addProject(projectData);

            navigate(`/proiecte/${result.id}`);
        } catch (error) {
            console.error('Failed to add project', error);
        }
    }

    const handleAddWhitePoints = async (userId: number) => {
        // Fix refetch bug
        const user: any = users.find((user: any) => user.id === userId);
        const result = await updateUserPoints({ whitePoints: user.whitePoints + 1, blackPoints: user.blackPoints }, user.id);
        await fetchUserData();
    }

    const handleAddBlackPoints = async (userId: number) => {
        // Fix refetch bug
        const user: any = users.find((user: any) => user.id === userId);
        const result = await updateUserPoints({ blackPoints: user.blackPoints + 1, whitePoints: user.whitePoints }, user.id);
        await fetchUserData();
    }

    const statuses = [
        { id: 1, value: 'NEW', label: 'NEW' },
        { id: 2, value: 'APPROVED', label: 'APPROVED' },
        { id: 3, value: 'DECLINED', label: 'DECLINED' },
        { id: 4, value: 'PAID', label: 'PAID' },
        { id: 5, value: 'IN_PROGRESS', label: 'IN PROGRESS' },
        { id: 6, value: 'COMPLETE', label: 'COMPLETE' },
    ]

    return (
        <div className='space-y-10'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="project-title">
                        {t("Project Title")}
                    </label>
                    <Input  
                    disabled={!hasAccess && edit === false}
                        id="project-title"
                        placeholder={t("Title")}
                        value={project.name}
                        onChange={(e) =>
                            setProject((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="project-type">
                        {t("Project Type")}
                    </label>
                    <Select isDisabled={!hasAccess && edit === false}
                        placeholder={t("Project Type")}
                        className='rounded-full'
                        value={projectTypeOptions.find((projectType: any) => projectType.value === project.type)}
                        options={projectTypeOptions}
                        onChange={(option) => setProject((prev) => ({
                            ...prev,
                            type: option?.value || '',
                        }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="project-type">
                        {t("Project Status")}
                    </label>
                    <Select isDisabled={!hasAccess && edit === false}
                        placeholder={t("Project Status")}
                        className='rounded-full'
                        value={statuses.find((status) => status.value === project.status)}
                        options={statuses}
                        onChange={(option) => setProject((prev) => ({
                            ...prev,
                            status: option?.value || '',
                        }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="delivery-date">
                        {t("Delivery Date")}
                    </label>
                    <DatePicker 
                    disabled={!hasAccess && edit === false}
                        value={project?.deliveryDate ? new Date(project?.deliveryDate) : null}
                        onChange={(date) => setProject((prev: any) => ({ ...prev, deliveryDate: date }))}
                    />
                </div>
            </div>
            <div>
                <label className="mb-2" htmlFor="project-info">
                    {`${t("Brand")}; An; ccm, comb, kw, ${t("Engine Type")}`}
                </label>
                <Input disabled={!hasAccess && edit === false}
                    id='project-info'
                    placeholder="Informații Proiect"
                    textArea
                    value={project.description}
                    onChange={(e) =>
                        setProject((prev) => ({
                            ...prev,
                            description: e.target.value,
                        }))
                    }
                />
            </div>
            
            {hasAccess && (<div className='text-right'>
                <Button className='w-full lg:w-fit' onClick={handleSave}>
                    {t("Save")}
                </Button>
            </div>)}
            {hasAccess && (
                <div className='space-y-5'>
                    <h4>{t("Project Operators")}</h4>
                    <div className='flex flex-row gap-5'>
                        {operatori && operatori.map((user: any, index: number) => (
                            <div key={index} className='flex flex-col justify-center items-center gap-3'>
                                <Avatar size={60} icon={<HiOutlineUser />} />
                                <p className='text-xs'>{`${user.lastName} ${user.firstName}`}</p>
                                <div className='flex flex-row items-end gap-2'>
                                    <div className='flex flex-col gap-2 min-h-2'>
                                        <div className="flex min-h-2 flex-row gap-1">
                                            {[...Array(Math.min(user.blackPoints, 1))].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 h-3 bg-black rounded-full m-auto"
                                                ></div>
                                            ))}
                                            {user.blackPoints > 1 && (
                                                <span className="text-xs">+{user.blackPoints - 1}</span>
                                            )}
                                        </div>
                                        <Button onClick={() => handleAddBlackPoints(user.id)} size='xs' shape="circle" icon={<HiMinus />} />
                                    </div>
                                    <div className='flex flex-col gap-2 min-h-2'>
                                        <div className="flex flex-row gap-1">
                                            {[...Array(Math.min(user.whitePoints, 1))].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 h-3 bg-white rounded-full m-auto border"
                                                ></div>
                                            ))}
                                            {user.whitePoints > 1 && (
                                                <span className="text-xs">+{user.whitePoints - 1}</span>
                                            )}
                                        </div>
                                        <Button onClick={() => handleAddWhitePoints(user.id)} size='xs' shape="circle" icon={<HiPlus />} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div >

    )
}

export default InformatiiProiect
