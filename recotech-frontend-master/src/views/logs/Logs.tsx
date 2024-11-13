import { useEffect, useState } from 'react'
import CustomTable from '../../components/common/CustomTable'
import Button from '@/components/ui/Button'
import { fetchLogs } from '@/api/logService';
import { Spinner } from '@/components/ui';
import DataDetailsModal from './modals/DataDetailsModal';
import { ColumnDef } from '@tanstack/react-table';
import { t } from 'i18next';
import { getTranslatedRole } from '@/utils/sharedHelpers';

const Logs = () => {
    const [modalSettings, setModalSettings] = useState({
        isOpen: false,
        selectedLog: null,
    })
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);

    const fetchLogData = async () => {
        await fetchLogs()
            .then((logs) => setData(logs))
            .catch(() => setData([]));
    }

    useEffect(() => {
        const fetchLogsData = async () => {
            setLoading(true);
            await fetchLogData();
            setLoading(false);
        }
        fetchLogsData();
    }, [])

    const columns: ColumnDef<any>[] = [
        {
            header: t("Action"),
            accessorKey: 'action',
        },
        {
            header: t("Route"),
            accessorKey: 'route',
        },
        {
            header: t("User"),
            accessorKey: 'username',
        },
        {
            header: t("Role"),
            accessorKey: 'role',
            cell: ({ row }: any) => {
                const actualRole = row.original.role.replace('ROLE_', '');
                return getTranslatedRole(actualRole);
            }
        },
        {
            header: t("Date"),
            accessorKey: 'date',
            cell: ({ row }: any) => {
                const date = new Date(row.original.date);

                return (
                    <div className="flex items-center">
                        <span>{date.toLocaleDateString()}</span>
                    </div>
                );
            }
        },
        {
            header: t("Status"),
            accessorKey: 'status',
            cell: ({ row }: any) => {
                const status = row.original.status;

                let colorClass = '!text-green-500';
                let borderClass = '!border-green-500';
                let bgClass = '!bg-green-100'; // Washed out green background
                let text = 'Success';

                switch (status) {
                    case '500':
                        colorClass = 'text-red-500';
                        borderClass = '!border-red-500';
                        bgClass = '!bg-red-100'; // Washed out red background
                        text = 'Error 500';
                        break;
                    case '404':
                        colorClass = 'text-yellow-500';
                        borderClass = '!border-yellow-500';
                        bgClass = '!bg-yellow-100'; // Washed out yellow background
                        text = 'Not Found';
                        break;
                    case '403':
                        colorClass = 'text-red-500';
                        borderClass = '!border-red-500';
                        bgClass = '!bg-red-100';
                        text = 'Forbidden';
                        break;
                    case '401':
                        colorClass = 'text-red-500';
                        borderClass = '!border-red-500';
                        bgClass = '!bg-red-100';
                        text = 'Unauthorized';
                        break;
                    case '200':
                        colorClass = 'text-green-500';
                        borderClass = '!border-green-500';
                        bgClass = '!bg-green-100';
                        text = 'Success';
                        break;
                    case '201':
                        colorClass = 'text-green-500';
                        borderClass = '!border-green-500';
                        bgClass = '!bg-green-100';
                        text = 'Created';
                        break;
                    case '202':
                        colorClass = 'text-green-500';
                        borderClass = '!border-green-500';
                        bgClass = '!bg-green-100';
                        text = 'Accepted';
                        break;
                    case '204':
                        colorClass = 'text-green-500';
                        borderClass = '!border-green-500';
                        bgClass = '!bg-green-100';
                        text = 'No Content';
                        break;
                    default:
                        colorClass = 'text-gray-500';
                        borderClass = '!border-gray-500';
                        bgClass = '!bg-gray-100';
                        text = 'Unknown';
                }

                return (
                    <div
                        className={`${colorClass} ${bgClass} ${borderClass} border px-4 py-1 rounded-lg text-center`}
                    >
                        {text}
                    </div>
                );
            }
        },
        {
            header: t("Details"),
            accessorKey: 'modificare',
            enableSorting: false,
            cell: ({ row }: any) => (
                <Button
                    onClick={() => setModalSettings({ isOpen: true, selectedLog: row.original })}
                    className="text-white rounded"
                    style={{ backgroundColor: '#0188cc' }}
                    disabled={row.original.content == null}
                >
                    {row.original.content != null ? `👁️ ${t("View")}` : `${t("No additional details")}`}
                </Button>
            ),
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
        <div
            className="mt-4"
            style={{
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '16px',
            }}
        >
            <CustomTable columns={columns} data={data} />
            {modalSettings.isOpen && (
                <DataDetailsModal
                    isOpen={modalSettings.isOpen}
                    selectedLog={modalSettings.selectedLog}
                    onClose={() => setModalSettings((prev) => ({ ...prev, isOpen: false }))}
                />
            )}
        </div>
    )
}

export default Logs
