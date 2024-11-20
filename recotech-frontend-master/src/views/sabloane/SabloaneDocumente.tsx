import { useEffect, useState } from 'react'
import { Card, Dropdown } from '@/components/ui'
import CustomDropdown from '../../components/common/CustomDropdown'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import ModalSabloaneDocumente from './documente/components/modals/SabloaneDocumenteModal'
import { deleteDocument, fetchDocuments, saveDocument, saveFile, updateDocument, downloadFile, fetchFileById } from '@/api/documentsService'
import { fetchUsers } from '@/api/userService'
import ModalDelete from '@/components/common/ModalDelete'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { getFileExtensionFromMimeType } from '@/utils/sharedHelpers'
import { useTranslation } from 'react-i18next'

const SabloaneDocumente = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [documents, setDocuments] = useState<any>([]);
    const [users, setUsers] = useState<any>([]);
    const { t } = useTranslation();

    const [projectTypes, setProjectTypes] = useState<any>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
    });

    const handleOpenModal = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedDocument(null);
    }

    const fetchDocumentsData = async () => {
        const documents = await fetchDocuments();
        console.log(documents);
        const filteredDocuments = documents.content.filter((doc: { status: string }) => doc.status.trim().toUpperCase() == "DRAFT");
        setDocuments(filteredDocuments);
        setFilteredDocuments(filteredDocuments);
    }

    const fetchProjectTypeData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypes(result);
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchDocumentsData();
            await fetchProjectTypeData();
            const users = await fetchUsers();
            setUsers(users.data.content);
        }
        fetchData();
    }, [])

    const handleDownload = async (documentObj: any) => {
        const result = await downloadFile(documentObj.fileKey);
        const fileExtension = getFileExtensionFromMimeType(result.data.type);
        const documentName = fileExtension ? `${documentObj.name}.${fileExtension}` : documentObj.name;
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', documentName); // Use the filename from headers or a fallback
        document.body.appendChild(link);
        link.click();
        link.remove();

    }

    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        if (values.documentFile) {
            const reader = new FileReader();

            reader.onload = async (event: any) => {
                const arrayBuffer = event.target.result;
                const binaryBlob = new Blob([arrayBuffer], { type: values.documentFile.type });
                formData.append('file', binaryBlob, values.documentFile.name);
                try {
                    const result = await saveFile(formData);

                    const documentObject: any = {
                        name: values.name,
                        status: values.status,
                        projectType: values.projectType,
                        fileKey: result.uuid,
                        isUsingVariables: values.containsVariables,
                        isClientSignatureRequired: values.requiresClientSignature,
                    };

                    if (values.containsVariables) {
                        const variablesObject: any = {};
                        values.variables.forEach((variable: any) => {
                            if (variable.label && variable.syntax) {
                                variablesObject[variable.syntax] = variable.label;
                            }
                        });
                        documentObject.variables = variablesObject;
                    }

                    if (values.id) {
                        await updateDocument(values.id, documentObject);
                    } else {
                        await saveDocument(documentObject);
                    }
                    await fetchDocumentsData();
                } catch (error) {
                    console.error('Upload error:', error);
                }
            };

            reader.onerror = (error) => {
                console.error('File reading error:', error);
            };

            reader.readAsArrayBuffer(values.documentFile);
        } else {
            console.error('The selected file is not valid or no file is selected.');
        }
        handleCloseModal();
    };

    const handleEdit = (documentId: any) => {
        setSelectedDocument(documents.find((document: any) => document.id === documentId));
        setIsModalOpen(true);
    }

    const handleDelete = (documentId: any) => {
        setSelectedDocument(documents.find((document: any) => document.id === documentId));
        setIsModalDeleteOpen(true);
    }

    const handleDeleteConfirmation = async () => {
        const result = await deleteDocument(selectedDocument.id);
        setSelectedDocument(null);
        await fetchDocumentsData();
        setIsModalDeleteOpen(false);
    }

    const handleProjectTypeFilter = (projectType: string) => {
        setFilters((prev: any) => ({ ...prev, type: projectType }));
        filterDocuments(projectType, '');
    }

    const handleSearch = (value: string) => {
        setFilters((prev: any) => ({ ...prev, search: value }));
        filterDocuments('', value.toLowerCase());
    }

    const filterDocuments = (projectType?: string, search?: string) => {
        const filteredDocuments = documents.filter((document: any) => {
            const typeCondition = projectType != '' ? document.projectType === projectType : true;
            const searchCondition = search != '' ? document.name.toLowerCase().includes(search) : true;
            return typeCondition && searchCondition;
        });
        setFilteredDocuments(filteredDocuments);
    }

    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Document Templates")}</h3>
            </div>
            <div className="flex items-center justify-between">
                <Button
                  
                    shape="circle"
                    onClick={handleOpenModal}
                >
                    {t("New Template")} +
                </Button>
                <div className="flex items-center ml-auto gap-4">
                    <Button className="flex flex-1 items-center mb-4" shape="circle">
                        <Dropdown className="" title={filters.type != '' ? filters.type : t("All Documents")}>
                            <Dropdown.Item onClick={() => handleProjectTypeFilter('')} eventKey="all">{t("All Documents")}</Dropdown.Item>
                            {projectTypes && projectTypes.map((projectType: any) => {
                                return (
                                    <Dropdown.Item onClick={() => handleProjectTypeFilter(projectType.name)} eventKey={projectType.id}>{projectType.name}</Dropdown.Item>
                                )
                            })}
                        </Dropdown>
                    </Button>
                    <Input
                        className="w-[240px] h-[40px] rounded-full mb-4"
                        placeholder={`${t("Search")}...`}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredDocuments.map((document: any) => {

                    const dropdownItems = [
                        { eventKey: 'download', label: t("Download"), onClick: () => handleDownload(document) },
                        { eventKey: 'edit', label: 'Edit', onClick: () => handleEdit(document.id) },
                        { eventKey: 'delete', label: t("Delete"), onClick: () => handleDelete(document.id) },
                    ]

                    const user = users.find((user: any) => user.id === document.userId)
                    const userFullName = `${user?.firstName} ${user?.lastName}`
                    return (
                        <Card
                            key={document.id}
                            header={
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-black">
                                        {document.name}
                                    </span>
                                    <CustomDropdown items={dropdownItems} />
                                </div>
                            }
                            clickable={true}
                            className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl"
                        >
                            <div className="flex justify-between mt-2">
                                <p>{t("Status")}: </p>
                                <p className="text-right">{document.status}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Project Type")}: </p>
                                <p className="text-right">{document.projectType}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Created By")}: </p>
                                <p className="text-right">{userFullName ?? '-'}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Created On")}: </p>
                                <p className="text-right">{new Date(document.createDate).toLocaleDateString('ro-RO')}</p>
                            </div>
                        </Card>
                    )
                })}

            </div>
            {isModalOpen && (
                <div>
                    <ModalSabloaneDocumente
                        isOpen={isModalOpen}
                        onClose={handleCloseModal}
                        onSubmit={handleSubmit}
                        selectedDocument={selectedDocument}
                    />
                </div>
            )}
            {isModalDeleteOpen && (
                <ModalDelete
                    isOpen={isModalDeleteOpen}
                    message={t("deleteMessage.Are you sure you want to delete this document?")}
                    onConfirmDelete={handleDeleteConfirmation}
                    onClose={() => setIsModalDeleteOpen(false)}
                />
            )}
        </div>
    )
}

export default SabloaneDocumente
