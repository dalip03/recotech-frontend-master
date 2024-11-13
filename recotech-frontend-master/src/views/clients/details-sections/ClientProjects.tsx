import { fetchClientProjects } from "@/api/clientService";
import { fetchUserById, fetchUsers } from "@/api/userService";
import CustomDropdown from "@/components/common/CustomDropdown";
import CustomTable from "@/components/common/CustomTable";
import toastNotification from "@/components/common/ToastNotification";
import { Spinner } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiPencil } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

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
}

const ClientProjects = ({ client }: any) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [users, setUsers] = useState<any>([])
    const { t } = useTranslation();

    const fetchClientProjectsTableData = async (clientId: any) => {
        await fetchClientProjects(clientId)
            .then((response: any) => {
                setData(response)
            })
            .catch((error: any) => {
                toastNotification.error('Nu s-au putut găsi proiectele clientului');
            })

        await fetchUsers()
            .then((response: any) => {
                setUsers(response.data.content);
            })
    }

    useEffect(() => {
        const fetchClientProjectsData = async () => {
            setLoading(true);
            await fetchClientProjectsTableData(client.id);
            setLoading(false);
        }
        fetchClientProjectsData();
    }, [client])

    const getUserName = (userId: number) => {
        const user = users.find((user: any) => user.id === userId)
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown'
    }

    const handleEdit = (id: string) => {
        navigate(`/proiecte/${id}`)
    }

    const columns: ColumnDef<Proiect>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: ({ row }) => (
                <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={() => handleEdit(row.original.id)}
                >
                    {row.original.id}
                </span>
            ),
        },
        {
            header: 'Nume Proiect',
            accessorKey: 'name',
        },
        {
            header: 'Categorie',
            accessorKey: 'type',
        },
        {
            header: 'Descriere',
            accessorKey: 'description',
        },
        {
            header: 'Status',
            accessorKey: 'status',
        },
        {
            header: t("Operator"),
            accessorKey: 'createdById',
            cell: ({ row }) => (
                <span>{getUserName(row.original.createdById)}</span>
            ),
        },
        {
            header: t("Actions"),
            accessorKey: 'actiuni',
            cell: ({ row }) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_edit`, label: t("Edit"), onClick: () => handleEdit(row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            },
        },
    ]

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div>
            <h3>Proiecte Asociate</h3>
            <CustomTable
                columns={columns}
                data={data}
            />
        </div>
    )
}

export default ClientProjects;