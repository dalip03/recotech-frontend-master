import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, Progress, Spinner } from '../../components/ui'
import CustomTable from '../../components/common/CustomTable'
import { ColumnDef } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import ModalDelete from '../../components/common/ModalDelete'
import ModalAddProjects from './components/modals/ModalAddProjects'

import {
    fetchProjects,
    fetchTotalProjects,
    fetchNewProjects,
    fetchProgressProjects,
    fetchFinishedProjects,
    deleteProject,
    fetchUserFavoriteProjects,
    addFavoriteProject,
    fetchUserProjects,
    getProjectById,
    removeFavoriteProject,
    fetchUserFavoriteProjectsByUserId,
} from '../../api/projectService'

import { fetchUsers } from '../../api/userService'
import { useAppSelector } from '@/store'
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { t } from 'i18next'
import CustomDropdown from '@/components/common/CustomDropdown'
import { fetchProjectTypes } from '@/api/projectTypeService'

interface Proiect {
    createDate: string
    updateDate: string
    id: string
    name: string
    description: string
    type: string
    createdById: number
    status: string
    checkpoint: string
    projectClientId: number
    taskCount: number
    completedTaskCount: number
    materialCost: number
    laborCost: number
    discount: number
    discountType: string
    paymentType: string
    paymentDate: string
    vat: number
    totalCost: number
    totalCostDiscounted: number
    discountCalculated: number
    vatCalculated: number
    totalCostWithVat: number
    discountedLaborCost: number
    isFavorite?: boolean
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

export default function Proiecte() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [data, setData] = useState<{
        projects: Proiect[]
        favoriteProjects: Proiect[]
    }>({
        projects: [],
        favoriteProjects: [],
    })
    const [users, setUsers] = useState<User[]>([])
    const [totalProjects, setTotalProjects] = useState<number | null>(null)
    const [newProjects, setNewProjects] = useState<number | null>(null)
    const [progressProjects, setProgressProjects] = useState<number | null>(
        null,
    )
    const [finishedProjects, setFinishedProjects] = useState<number | null>(
        null,
    )
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

    const userRole = useAppSelector(
        (state) => state.auth.user.authority,
    ) as UserRole
    const userId = useAppSelector((state) => state.auth.user.id) as string

    const handleIdClick = (id: string) => {
        navigate(`/proiecte/${id}`)
    }

    const handleEdit = (id: string) => {
        navigate(`/proiecte/${id}`)
    }

    const fetchFavoriteProjectsData = async () => {
        try {
            // Fetch user favorite project IDs
            const { projects } = await fetchUserFavoriteProjects()
            const projectIds = projects

            // Use Promise.all to fetch each project by ID in parallel
            const favoriteProjects = await Promise.all(
                projectIds.map(async (projectId: string) => {
                    const projectData = await getProjectById(projectId) // Assuming this fetches the project by ID
                    return projectData // Add any additional mapping or transformation here if necessary
                }),
            )

            // Log the project details and update the state with detailed favorite projects data
            setData((prevData) => ({
                ...prevData,
                favoriteProjects, // Store detailed project data in favoriteProjects
            }))
        } catch (error) {
            console.error('Error fetching favorite projects:', error)
        }
    }

    const fetchProjectsData = async () => {
        try {
            // Fetch projects based on user role, with default empty array fallback
            const projects = hasAccess(userRole, ['ADMIN', 'RECEPTION'])
                ? await fetchProjects()
                : await fetchUserProjects()
            const validProjects = projects || [] // Ensure we have an empty array if no projects are fetched

            // Fetch user favorite projects and handle empty or missing data
            const userProjectTypeObj =
                await fetchUserFavoriteProjectsByUserId(userId)
            const userProjectTypes = userProjectTypeObj?.projectTypes || [] // Default to empty array if no projectTypes

            // Fetch project types and handle empty response
            const projectTypes = await fetchProjectTypes()
            const validProjectTypes = projectTypes || [] // Default to empty array if no projectTypes fetched

            // Filter user project types and map to names
            const userProjectTypeNames = validProjectTypes
                .filter((projectType: any) =>
                    userProjectTypes.includes(projectType.id),
                )
                .map((projectType: any) => projectType.name)

            // Fetch all projects and handle empty response
            const allProjects = await fetchProjects()
            const validAllProjects = allProjects || [] // Ensure empty array if no projects are fetched

            // Filter projects based on user project types
            const extendedProjects = validAllProjects.filter((project: any) =>
                userProjectTypeNames.includes(project.type),
            )

            // Combine the original and extended projects, avoiding duplicates
            const combinedProjects = [
                ...new Set([...validProjects, ...extendedProjects]),
            ]

            // Update state with the fetched and filtered projects
            setData((prevData) => ({
                ...prevData,
                projects: combinedProjects,
            }))
        } catch (error) {
            console.error('Error fetching projects:', error)
            // You can optionally set an error state to inform the user about issues fetching data
            setData((prevData) => ({
                ...prevData,
                projects: [], // Optionally reset projects to empty in case of failure
                error: 'Failed to load projects. Please try again later.',
            }))
        }
    }

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true)
            try {
                await fetchProjectsData()
                await fetchFavoriteProjectsData()
                const userData = await fetchUsers()
                setUsers(userData.data.content)
            } catch (error) {
                console.error('Error fetching user data:', error)
            }
            setLoading(false)
        }

        fetchUserData()
    }, [])

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const total = await fetchTotalProjects()
                setTotalProjects(total)

                const newProjects = await fetchNewProjects()
                setNewProjects(newProjects)

                const progress = await fetchProgressProjects()
                setProgressProjects(progress)

                const finished = await fetchFinishedProjects()
                setFinishedProjects(finished)
            } catch (error) {
                console.error('Error fetching statistics:', error)
            }
        }

        fetchStatistics()
    }, [])

    const handleConfirmDelete = () => {
        if (deleteItemId) {
            handleDelete(deleteItemId)
            setIsDeleteModalOpen(false)
        }
    }

    const handleDelete = async (id: string) => {
        const result = await deleteProject(id)
        setData((prevData) => ({
            ...prevData,
            projects: prevData.projects.filter((item) => item.id !== id),
        }))
    }

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false)
        setDeleteItemId(null)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleFavorite = async (id: string) => {
        const isFavorite = data.favoriteProjects.some(
            (project) => project.id === id,
        )
        if (isFavorite) {
            await removeFavoriteProject([id])
        } else {
            await addFavoriteProject([id])
        }
        await fetchFavoriteProjectsData()
    }

    const columns: ColumnDef<Proiect>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
        },
        {
            header: t('Project Name'),
            accessorKey: 'name',
            cell: ({ row }) => (
                <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => handleIdClick(row.original.id)}
                >
                    {row.original.name}
                </span>
            ),
        },
        {
            header: t('Category'),
            accessorKey: 'type',
        },
        {
            header: t('Client'),
            accessorKey: 'client',
            cell: ({ row }) => {
                return 'WIP'
                // if (row.original?.id) {
                //     const projectClient = await getProjectClientById(row.original?.id || 0);
                //     return projectClient?.name;
                // }
                // return '-'
            },
        },
        {
            header: t('Tasks'),
            accessorKey: 'tasks',
            cell: ({ row }) => {
                let projectTasksPercentage =
                    (row.original.completedTaskCount / row.original.taskCount) *
                    100
                projectTasksPercentage = isNaN(projectTasksPercentage)
                    ? 0
                    : Number(projectTasksPercentage.toFixed(2))

                return (
                    <div className="min-w-40">
                        <Progress percent={projectTasksPercentage} />
                    </div>
                )
            },
        },
        {
            header: t('Status'),
            accessorKey: 'status',
        },
        {
            header: t('Delivery Date'),
            accessorKey: 'deliveryDate',
            cell: ({ row }: any) => {
                return row.original.deliveryDate
                    ? new Date(row.original.deliveryDate).toLocaleDateString()
                    : '-'
            },
        },

        
        ...( ((userRole !== 'RECEPTION') && (userRole !== 'OPERATOR')) ? [
        {
            
            header: t('Actions'),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {

                // Check if the user's role is not RECEPTION
                if (!hasAccess(userRole as UserRole, ['ADMIN'])) {
                    return null; // Return nothing if the user is a RECEPTION
                }
                // TODO implement this to the end when favorite functionality is finished
                const rowActions = []
                if (hasAccess(userRole as UserRole, ['ADMIN'])) {
                    rowActions.push(
                        {
                            eventKey: `${row.original.id}_favorite`,
                            label: data.favoriteProjects.some(
                                (project) => project.id === row.original.id,
                            )
                                ? t('Unfavorite')
                                : t('Favorite'),
                            onClick: () => handleFavorite(row.original.id),
                        },
                        {
                            eventKey: `${row.original.id}_edit`,
                            label: t('Edit'),
                            onClick: () => handleEdit(row.original.id),
                        },
                        {
                            eventKey: `${row.original.id}_delete`,
                            label: t('Delete'),
                            onClick: () => handleDelete(row.original.id),
                        },
                    )
                } else {
                    rowActions.push(
                        {
                            eventKey: `${row.original.id}_favorite`,
                            label: data.favoriteProjects.some(
                                (project) => project.id === row.original.id,
                            )
                                ? t('Unfavorite')
                                : t('Favorite'),
                            onClick: () => handleFavorite(row.original.id),
                        },
                        {
                            eventKey: `${row.original.id}_edit`,
                            label: t('Edit'),
                            onClick: () => handleEdit(row.original.id),
                        },
                    )
                }
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ] : []),
    ]

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full w-full">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div>
            <div>
                <h3 className="pb-4 pt-4 font-bold ">{t('Projects')}</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card
                    clickable
                    className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl p-4"
                >
                    <div className="flex flex-col h-full ">
                        <div className="flex-1 pb-6 ">
                            <h5 className="text-xl">
                                {t('Total Projects')}
                            </h5>
                        </div>
                        <div className="flex-1 flex items-end justify-start">
                            <p className="mt-5 text-3xl font-bold">
                                {totalProjects !== null ? totalProjects : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* project in prepration */}

                <Card
                    clickable
                    className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl p-4"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h5 className="text-xl">
                                {t('Projects in preparation')}
                            </h5>
                        </div>
                        <div className="flex-1 flex items-end justify-start">
                            <p className="mt-5 text-3xl font-bold">
                                {newProjects !== null ? newProjects : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* project in progress */}

                <Card
                    clickable
                    className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl p-4"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h5 className="text-xl">
                                {t('Projects in progress')}
                            </h5>
                        </div>
                        <div className="flex-1 flex items-end justify-start">
                            <p className="mt-5 text-3xl font-bold">
                                {progressProjects !== null
                                    ? progressProjects
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
                {/* Finished Projects */}
                <Card
                    clickable
                    className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl p-4"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1">
                            <h5 className="text-xl">
                                {t('Finished Projects')}
                            </h5>
                        </div>
                        <div className="flex-1 flex items-end justify-start">
                            <p className="mt-5 text-3xl font-bold">
                                {finishedProjects !== null
                                    ? finishedProjects
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
            {hasAccess(userRole as UserRole, ['ADMIN']) && (
                <div className="">
                    <h3 className="pb-4 pt-4 font-bold ">{t('Favorite Projects')}</h3>
                    <div
                        style={{
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '16px',
                        }}
                    >
                        <CustomTable
                            columns={columns}
                            data={data.favoriteProjects}
                            actionButton={
                                <Link to={'/proiecte/nou'}>
                                    <Button
                                        style={{
                                            background: '#0188cc',
                                            color: 'white',
                                        }}
                                    >
                                        {t('Add Projects')}
                                    </Button>
                                </Link>
                            }
                        />
                    </div>
                </div>
            )}
            <div className="">
                <h3 className="pb-4 pt-4 font-bold ">{t('All Projects')}</h3>
                <div
                    className="mt-2"
                    style={{
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '16px',
                    }}
                >
                    {hasAccess(userRole, ['ADMIN', 'RECEPTION','OPERATOR','MAGAZIE','PIESAR']) && 
                    (    
                        <CustomTable
                            columns={columns}
                            data={data.projects}
                            actionButton={
                                userRole !== 'OPERATOR' && userRole !== 'MAGAZIE' && userRole !== 'PIESAR' && (
                                <Link to={'/proiecte/nou'}>
                                    <Button
                                        style={{
                                            background: '#0188cc',
                                            color: 'white',
                                        }}
                                    >
                                        {t('Add Projects')}
                                    </Button>
                                </Link>
                                )
                            }
                        />
                    )}
                </div>
            </div>
            <div>
                <ModalAddProjects
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            </div>
            <div>
                <ModalDelete
                    isOpen={isDeleteModalOpen}
                    message={t(
                        'deleteMessage.Are you sure you want to delete this project?',
                    )}
                    onConfirmDelete={handleConfirmDelete}
                    onClose={handleCancelDelete}
                />
            </div>
        </div>
    )
}
