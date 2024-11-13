import { forwardRef, useRef, useState, useCallback, useEffect } from 'react'
import classNames from 'classnames'
import { useConfig } from '../ConfigProvider'
import cloneDeep from 'lodash/cloneDeep'
import FileItem from './FileItem'
import Button from '../Button/Button'
import CloseButton from '../CloseButton'
import Notification from '../Notification/Notification'
import toast from '../toast/toast'
import type { CommonProps } from '../@types/common'
import type { ReactNode, ChangeEvent, MouseEvent } from 'react'

export interface UploadProps extends CommonProps {
    accept?: string
    beforeUpload?: (file: FileList | null, fileList: File[]) => boolean | string
    disabled?: boolean
    draggable?: boolean
    fileList?: File[]
    fileListClass?: string
    fileItemClass?: string
    multiple?: boolean
    onChange?: (file: File[], fileList: File[]) => void
    onFileRemove?: (file: File[]) => void
    showList?: boolean
    tip?: string | ReactNode
    uploadLimit?: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field?: any
}

const fileListToArray = (fileList: FileList | null): File[] => {
    if (!fileList) return []
    return Array.from(fileList)
}

const Upload = forwardRef<HTMLDivElement, UploadProps>((props, ref) => {
    const {
        accept,
        beforeUpload,
        disabled = false,
        draggable = false,
        fileList = [],
        fileListClass,
        fileItemClass,
        multiple,
        onChange,
        onFileRemove,
        showList = true,
        tip,
        uploadLimit,
        children,
        className,
        field,
        ...rest
    } = props

    const fileInputField = useRef<HTMLInputElement>(null)
    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)

    const { themeColor, primaryColorLevel } = useConfig()

    useEffect(() => {
        if (JSON.stringify(files) !== JSON.stringify(fileList)) {
            setFiles(fileList)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(fileList)])

    const triggerMessage = (msg: string | ReactNode = '') => {
        toast.push(
            <Notification type="danger" duration={2000}>
                {msg || 'Upload Failed!'}
            </Notification>,
            {
                placement: 'top-center',
            }
        )
    }

    // Update this function to accumulate new files rather than replacing the current list
    // Modify addNewFiles to handle single file behavior
    const addNewFiles = (newFiles: FileList | null) => {
        const newFileArray = fileListToArray(newFiles)

        if (!multiple) {
            // If not in multi-file mode, only store the first file
            return newFileArray.slice(0, 1)
        }

        // Prevent adding duplicate files (by file name)
        const updatedFiles = [...files, ...newFileArray].reduce((acc, file) => {
            if (!acc.some(existingFile => existingFile.name === file.name)) {
                acc.push(file)
            }
            return acc
        }, [] as File[])

        // Enforce upload limit
        if (typeof uploadLimit === 'number' && uploadLimit !== 0) {
            return updatedFiles.slice(0, uploadLimit)
        }

        return updatedFiles
    }

    // Modify onNewFileUpload to support both single and multiple file handling
    const onNewFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const { files: newFiles } = e.target
        let result: boolean | string = true

        if (beforeUpload) {
            result = beforeUpload(newFiles, files)

            if (result === false) {
                triggerMessage()
                return
            }

            if (typeof result === 'string' && result.length > 0) {
                triggerMessage(result)
                return
            }
        }

        if (result) {
            const updatedFiles = addNewFiles(newFiles)
            setFiles(updatedFiles)
            // Call onChange and ensure it's backward compatible
            onChange?.(updatedFiles, multiple ? files : updatedFiles) // Pass the correct files array for single or multiple mode
        }
    }

    // Modify removeFile to support single file behavior
    const removeFile = (fileIndex: number) => {
        const deletedFileList = files.filter((_, index) => index !== fileIndex)
        setFiles(deletedFileList)
        // Ensure single-file removal clears the field appropriately
        onFileRemove?.(multiple ? deletedFileList : [])
    }


    const triggerUpload = (e: MouseEvent<HTMLDivElement>) => {
        if (!disabled) {
            fileInputField.current?.click()
        }
        e.stopPropagation()
    }

    const renderChildren = () => {
        if (!draggable && !children) {
            return (
                <Button disabled={disabled} onClick={(e) => e.preventDefault()}>
                    Upload
                </Button>
            )
        }

        if (draggable && !children) {
            return <span>Choose a file or drag and drop here</span>
        }

        return children
    }

    const handleDragLeave = useCallback(() => {
        if (draggable) {
            setDragOver(false)
        }
    }, [draggable])

    const handleDragOver = useCallback(() => {
        if (draggable && !disabled) {
            setDragOver(true)
        }
    }, [draggable, disabled])

    const handleDrop = useCallback(() => {
        if (draggable) {
            setDragOver(false)
        }
    }, [draggable])

    const draggableProp = {
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
    }

    const draggableEventFeedbackClass = `border-${themeColor}-${primaryColorLevel}`

    const uploadClass = classNames(
        'upload',
        draggable && `upload-draggable`,
        draggable && !disabled && `hover:${draggableEventFeedbackClass}`,
        draggable && disabled && 'disabled',
        dragOver && draggableEventFeedbackClass,
        className
    )

    const uploadInputClass = classNames(
        'upload-input',
        draggable && `draggable`
    )

    return (
        <>
            <div
                ref={ref}
                className={uploadClass}
                {...(draggable ? draggableProp : { onClick: triggerUpload })}
                {...rest}
            >
                <input
                    ref={fileInputField}
                    className={uploadInputClass}
                    type="file"
                    disabled={disabled}
                    multiple={multiple}
                    accept={accept}
                    title=""
                    value=""
                    onChange={onNewFileUpload}
                    {...field}
                    {...rest}
                ></input>
                {renderChildren()}
            </div>
            {tip}
            {showList && (
                <div className={classNames('upload-file-list', fileListClass)}>
                    {files.map((file, index) => (
                        <FileItem key={file.name + index} file={file} className={fileItemClass}>
                            <CloseButton
                                className="upload-file-remove"
                                onClick={() => removeFile(index)}
                            />
                        </FileItem>
                    ))}
                </div>
            )}
        </>
    )
})

Upload.displayName = 'Upload'

export default Upload
