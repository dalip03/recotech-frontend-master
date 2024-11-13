import CustomTable from "@/components/common/CustomTable";
import { Button, Spinner } from "@/components/ui";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchUsers } from "@/api/userService";
import { HiDownload, HiEye } from "react-icons/hi";
import { fetchEmailHistory } from "@/api/emailService";
import { useTranslation } from "react-i18next";
import { downloadFile } from "@/api/documentsService";
import CustomDropdown from "@/components/common/CustomDropdown";

export default function Email() {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<any>([]);
    const [emailHistory, setEmailHistory] = useState<any>([]);

    const navigate = useNavigate();
    const currentPath = window.location.pathname;
    const { t } = useTranslation();

    const fetchUserContent = async () => {
        await fetchUsers().then((res: any) => setUsers(res.data.content));
    }

    const fetchEmailContent = async () => {
        await fetchEmailHistory().then((res: any) => setEmailHistory(res));
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchUserContent();
            await fetchEmailContent();
            setLoading(false);
        }
        fetchData();
    }, [])

    const handleDownload = async (id: any) => {
        const result: any = await downloadFile(id)
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attachment'); // Use the filename from headers or a fallback
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const handlePreview = (id: any) => {
        navigate(`${currentPath}/email/${id}`)
    }

    const columns = [
        {
            "header": "Subiect",
            "accessorKey": "subject",
        },
        {
            header: "Continut",
            accessorKey: "content",
            cell: ({ row }: any) => {
                const content = row.original.content;

                // Decode HTML entities using DOMParser
                const parser = new DOMParser();
                const decodedContent = parser.parseFromString(content, "text/html").body.textContent || "";

                // Strip HTML tags
                const plainTextContent = decodedContent.replace(/<\/?[^>]+(>|$)/g, "");

                // Limit text length to 30 characters
                return plainTextContent.length > 30
                    ? `${plainTextContent.substring(0, 30)}...`
                    : plainTextContent;
            }
        },        
        {
            "header": "Atasamente",
            "accessorKey": "attachments",
            // cell: ({ row }: any) => row.original.attachments.map((attachment: any) => attachment.name).join(', ')
            cell: ({ row }: any) => {
                return row.original.attachmentKey ? t("Yes") : t("No")
            }
        },
        {
            "header": "Trimis De",
            "accessorKey": "sentBy",
            cell: ({ row }: any) => {
                const user = users.find((user: any) => user.username === row.original.fromUsername)
                const userFullName = user && user.firstName && user.lastName ? `${user?.firstName} ${user?.lastName}` : null
                return user ? (userFullName ?? user.username) : 'N/A'
            }
        },
        {
            "header": "Trimis la data",
            "accessorKey": "createDate",
            cell: ({ row }: any) => new Date(row.original.createDate).toLocaleDateString()
        },
        {
            header: t("Actions"),
            "accessorKey": "id",
            cell: ({ row }: any) => {
                const rowActions = [
                    { eventKey: `${row.original.id}_download`, label: t("Download"), onClick: () => handleDownload(row.original.attachmentKey) },
                    { eventKey: `${row.original.id}_view`, label: t("View"), onClick: () => handlePreview(row.original.id) },
                ]
                return (
                    <div className="flex space-x-2">
                        <CustomDropdown items={rowActions} />
                    </div>
                )
            }
        }
    ]

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <h3>Inbox</h3>
            <CustomTable
                columns={columns}
                data={emailHistory}
                actionButton={
                    <Link to={`${currentPath}/new-email`}>
                        <Button
                            style={{ background: '#0188cc', color: 'white' }}
                        >
                            Email nou
                        </Button>
                    </Link>
                }
            />
        </div>
    )
}