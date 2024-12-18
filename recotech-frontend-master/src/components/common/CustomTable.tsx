import React, { useState, useMemo, useEffect, useRef } from 'react'
import Table from '../ui/Table'
import Pagination from '../ui/Pagination'
import Select from '../ui/Select'
import Input from '../ui/Input'
// import Checkbox from '../ui/Checkbox'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFacetedMinMaxValues,
    flexRender,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type {
    ColumnDef,
    FilterFn,
    ColumnFiltersState,
} from '@tanstack/react-table'
import type { InputHTMLAttributes, ChangeEvent } from 'react'
import type { CheckboxProps } from '@/components/ui/Checkbox'
import { useTranslation } from 'react-i18next'

type CheckBoxChangeEvent = ChangeEvent<HTMLInputElement>

interface IndeterminateCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
    onChange: (event: CheckBoxChangeEvent) => void
    indeterminate: boolean
    onCheckBoxChange?: (event: CheckBoxChangeEvent) => void
    onIndeterminateCheckBoxChange?: (event: CheckBoxChangeEvent) => void
}

interface DebouncedInputProps
    extends Omit<
        InputHTMLAttributes<HTMLInputElement>,
        'onChange' | 'size' | 'prefix'
    > {
    value: string | number
    onChange: (value: string | number) => void
    debounce?: number
}

interface CustomTableProps {
    columns: ColumnDef<any>[]
    data: any[]
    actionButton?: React.ReactNode
}

const { Tr, Th, Td, THead, TBody, Sorter } = Table

// function IndeterminateCheckbox({
//     indeterminate,
//     onChange,
//     ...rest
// }: IndeterminateCheckboxProps) {
//     const ref = useRef<HTMLInputElement>(null)

//     useEffect(() => {
//         if (typeof indeterminate === 'boolean' && ref.current) {
//             ref.current.indeterminate = !rest.checked && indeterminate
//         }
//     }, [indeterminate, rest.checked])

//     return <Checkbox ref={ref} onChange={(_, e) => onChange(e)} {...rest} />
// }

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 500,
    ...props
}: DebouncedInputProps) {
    const [value, setValue] = useState(initialValue)
    const { t } = useTranslation();

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value)
        }, debounce)

        return () => clearTimeout(timeout)
    }, [value, debounce, onChange])

    return (
        <div className="flex items-center">
            <span className="mr-2">{t("Search")}</span>
            <Input
                {...props}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    )
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({ itemRank })
    return itemRank.passed
}

const CustomTable: React.FC<CustomTableProps> = ({
    columns,
    data,
    actionButton,   
}) => {
    const [rowSelection, setRowSelection] = useState({})
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const { t } = useTranslation();

    const pageSizeOptions = useMemo(() => [
        { value: 5, label: `5 / ${t("Page")}` },
        { value: 10, label: `10 / ${t("Page")}` },
        { value: 20, label: `20 / ${t("Page")}` },
        { value: 30, label: `30 / ${t("Page")}` },
        { value: 40, label: `40 / ${t("Page")}` },
        { value: 50, label: `50 / ${t("Page")}` },
    ], [t]); // Re-create when `t` changes

    const memoizedColumns = useMemo<ColumnDef<any>[]>(
        () => [
            // {
            //     id: 'select',
            //     header: ({ table }) => (
            //         <IndeterminateCheckbox
            //             {...{
            //                 checked: table.getIsAllRowsSelected(),
            //                 indeterminate: table.getIsSomeRowsSelected(),
            //                 onChange: table.getToggleAllRowsSelectedHandler(),
            //             }}
            //         />
            //     ),
            //     cell: ({ row }) => (
            //         <div className="px-1">
            //             <IndeterminateCheckbox
            //                 {...{
            //                     checked: row.getIsSelected(),
            //                     disabled: !row.getCanSelect(),
            //                     indeterminate: row.getIsSomeSelected(),
            //                     onChange: row.getToggleSelectedHandler(),
            //                 }}
            //             />
            //         </div>
            //     ),
            // },
            ...columns,
        ],
        [columns],
    )

    const table = useReactTable({
        data,
        columns: memoizedColumns,
        filterFns: {
            fuzzy: fuzzyFilter,
        },
        state: {
            rowSelection,
            columnFilters,
            globalFilter,
        },
        onRowSelectionChange: setRowSelection,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFacetedMinMaxValues: getFacetedMinMaxValues(),
    })

    const onPaginationChange = (page: number) => {
        table.setPageIndex(page - 1)
    }

    const onSelectChange = (value: number) => {
        table.setPageSize(Number(value))
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                {actionButton && <div>{actionButton}</div>}
                <div className="flex items-center ml-auto">
                    <DebouncedInput
                        value={globalFilter ?? ''}
                        placeholder={`${t("Search all columns")}...`}
                        onChange={(value) => setGlobalFilter(String(value))}
                    />
                </div>
            </div>
            <Table >
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <Th key={header.id} colSpan={header.colSpan}>
                                    {header.isPlaceholder ? null : (
                                        <div
                                            className={
                                                header.column.getCanSort()
                                                    ? 'cursor-pointer select-none flex items-center'
                                                    : ''
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                            {header.column.getCanSort() && (
                                                <Sorter
                                                    sort={header.column.getIsSorted()}
                                                />
                                            )}
                                        </div>
                                    )}
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </THead>
                <TBody className='h-screen'>
                    {table.getRowModel().rows.map((row) => (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <Td key={cell.id}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext(),
                                    )}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </TBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={data.length}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select
                        size="sm"
                        isSearchable={false}
                        value={pageSizeOptions.find(
                            (option) =>
                                option.value ===
                                table.getState().pagination.pageSize,
                        )}
                        options={pageSizeOptions}
                        onChange={(option) =>
                            onSelectChange(option?.value || 10)
                        }
                    />
                </div>
            </div>
        </div>
    )
}

export default CustomTable
