import { Button } from '@/components/ui'
import { useEffect, useMemo, useState } from 'react'
import { HiPencil, HiTrash } from 'react-icons/hi'
import CustomTable from '../../components/common/CustomTable'
import ModalAddUser from './components/modals/ModalAddUser'
import { fetchUsers } from '@/api/userService'
import { t } from 'i18next'
import CustomTableSSRPagination from '@/components/common/CustomTabeSSRPagination'
import { getTranslatedRole } from '@/utils/sharedHelpers'
import CustomDropdown from '@/components/common/CustomDropdown'
import { fetchUserFavoriteProjects, fetchUserFavoriteProjectsByUserId } from '@/api/projectService'

const Utilizatori = () => {
    const [modalData, setModalData] = useState<any>({
        isOpen: false,
        selectedUser: null,
    })
    const [data, setData] = useState<any>({
        users: [],
        pageIndex: 0,
        pageSize: 10,
        totalCount: 0
    });

    const getData = async (page?: number, pageSize?: number) => {
        // Fetch the user data
        const response = await fetchUsers(page, pageSize);

        // Use Promise.all to wait for all async operations in the map
        const users = await Promise.all(response.data.content.map(async (user: { id: number; firstName: string; lastName: string }) => {
            const userFavoriteProjects = await fetchUserFavoriteProjectsByUserId(user.id);
            return {
                ...user,
                userFullName: `${user.firstName} ${user.lastName}`,
                userFavoriteProjects: userFavoriteProjects.projectTypes
            };
        }));

        console.log('Users data:', users);

        // Update state
        setData((prev: any) => ({
            ...prev,
            users: users,
            pageIndex: page ?? 0,
            pageSize: pageSize ?? 10,
            totalCount: response.data.totalElements
        }));
    };


    useEffect(() => {
        const fetchData = async () => {
            await getData(data.pageIndex, data.pageSize);
        }
        fetchData();
    }, [])

    const handleEdit = (id: any) => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
            selectedUser: data.users.find((user: any) => user.id == id)
        }))
    }

    const handleDelete = () => {
        console.log('Delete')
    }

    const handleOpenModal = () => {
        setModalData((prev: any) => ({
            ...prev,
            isOpen: true,
        }))
    }

    const handleCloseModal = async (refetch: boolean) => {
        if (refetch) {
            await getData(data.pageIndex, data.pageSize);
        }
        setModalData((prev: any) => ({
            ...prev,
            isOpen: false,
            selectedUser: null,
        }))
    }

    const columns = useMemo(() => [
        {
            header: t("Name"),
            accessorKey: 'userFullName',
        },
        {
            header: t("User"),
            accessorKey: 'username',
        },
        {
            header: t("Role"),
            accessorKey: 'role',
            cell: ({ row }: any) => {
                return (getTranslatedRole(row.original.role))
            }
        },
        {
            header: t("White Points"),
            accessorKey: 'whitePoints',
        },
        {
            header: t("Black Points"),
            accessorKey: 'blackPoints',
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                    // { eventKey: `${row.original.id}_delete`, label: t("Delete"), onClick: () => handleDelete(row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div >
                )
            },
        },
    ], [t, data.users])

    return (
        <div>
            <div>
                <h3 className="text-3xl font-semibold mb-4">{t("Users")}</h3>
            </div>
            <div className="flex flex-row justify-between gap-4 "></div>
            <div
                className="mt-4"
                style={{
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                }}
            >
                <CustomTableSSRPagination
                    columns={columns}
                    data={data.users}
                    fetchData={getData}
                    pageIndex={data.pageIndex}
                    totalCount={data.totalCount}
                    actionButton={
                        <Button
                            style={{ background: '#0188cc', color: 'white' }}
                            onClick={handleOpenModal}
                        >
                            {t("Add User")}
                        </Button>
                    }
                />
            </div>
            {modalData.isOpen && (
                <div>
                    <ModalAddUser isOpen={modalData.isOpen} onClose={handleCloseModal} userData={modalData.selectedUser} />
                </div>
            )}
        </div>
    )
}

export default Utilizatori
