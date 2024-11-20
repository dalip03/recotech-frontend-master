import { useEffect, useState } from 'react'
import { Card, Spinner, toast } from '../../components/ui'
import CustomDropdown from '../../components/common/CustomDropdown'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import { Input } from '../../components/ui/Input'
import { deleteDocument, downloadFile, fetchDocuments, saveDocument, saveFile, updateDocument } from '@/api/documentsService'
import ModalAddDocuments from '../projects/components/modals/ModalAddDocuments'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { fetchUsers } from '@/api/userService'
import ModalDelete from '@/components/common/ModalDelete'
import toastNotification from '@/components/common/ToastNotification'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'


const Documente = () => {
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([])
    const [modalSettings, setModalSettings] = useState({
        isOpen: false,
        isOpenDelete: false,
    })
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [projectTypes, setProjectTypes] = useState<any>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [users, setUsers] = useState<any>([]);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
    });

    const { t } = useTranslation();

    const fetchPageData = async () => {
        setLoading(true);
        try {
            await fetchDocumentsData();
            await fetchProjectTypeData();
            const result = await fetchUsers();
            setUsers(result.data.content);
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchPageData()
        }

        fetchData()
    }, [])

    const handleDownload = async (documentObj: any) => {
        const documentName = documentObj.name;
        const result: any = await downloadFile(documentObj.fileKey);
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', documentName); // Use the filename from headers or a fallback
        document.body.appendChild(link);
        link.click();
        link.remove();

    }

    const fetchDocumentsData = async () => {
        const documents = await fetchDocuments();
        const filteredDocuments = documents.content.filter((doc: { status: string }) => doc.status.trim().toUpperCase() !== "DRAFT");
        setDocuments(filteredDocuments);
        setFilteredDocuments(filteredDocuments);
    }

    const fetchProjectTypeData = async () => {
        const result = await fetchProjectTypes();
        setProjectTypes(result);
    }

    const handleDelete = (documentId: any) => {
        setSelectedDocument(documents.find((document: any) => document.id === documentId));
        setModalSettings({ ...modalSettings, isOpenDelete: true });
    }

    const handleDeleteConfirmation = async () => {
        await deleteDocument(selectedDocument.id);
        await fetchDocumentsData();
        setSelectedDocument(null);
        setModalSettings({ ...modalSettings, isOpenDelete: false });
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

    const handleModalClose = async () => {
        await fetchDocumentsData();
        setModalSettings({ ...modalSettings, isOpen: false })
    }

    if (loading) {
        <div className='flex justify-center items-center h-full w-full'>
            <Spinner size={40} />
        </div>
    }

    return (
        <div>
            <div>
            <h3 className="pb-4 pt-4 font-bold ">{t("Documents")}</h3>
            </div>
            <div className="flex flex-wrap items-center justify-between">
                <Button onClick={() => setModalSettings((prev) => ({ ...prev, isOpen: true }))} className="mb-4 w-full lg:w-fit" shape="circle">
                    {t("New Document")} +
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
                        { eventKey: 'a', label: 'Descarca', onClick: () => handleDownload(document) },
                        { eventKey: 'd', label: 'Delete', onClick: () => handleDelete(document.id) },
                    ]

                    const user = users.find((user: any) => user.id === document.userId)
                    const userFullName = `${user?.firstName} ${user?.lastName}`
                    return (
                        <Card
                            key={document.id}
                            header={
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-black">
                                        {document.name || 'No Name'}
                                    </span>
                                    <CustomDropdown items={dropdownItems} />
                                </div>
                            }
                            clickable={true}
                            className="flex-1 hover:shadow-lg transition duration-150 ease-in-out rounded-2xl w-full"
                        >
                            {/* TODO GET PROPER RELATIONSHIP OBJECTS FOR DOCS */}
                            <div className="flex justify-between mt-2">
                                <p>{t("Project")}: </p>
                                {document.projectId && (
                                    <Link to={`/proiecte/${document.projectId}`} className="text-right">
                                        {document.projectId}
                                    </Link>
                                ) || <p className="text-right">{'-'}</p>}
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Client")}: </p>
                                {document.clientId && (
                                    <Link to={`/clienti/${document.clientId}`} className="text-right">
                                        {document.clientId}
                                    </Link>
                                ) || <p className="text-right">{'-'}</p>}
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
            {modalSettings.isOpen && (
                <ModalAddDocuments
                    isOpen={modalSettings.isOpen}
                    onClose={handleModalClose}
                />
            )}
            {modalSettings.isOpenDelete && (
                <ModalDelete
                    message={t("deleteMessage.Are you sure you want to delete this document?")}
                    isOpen={modalSettings.isOpenDelete}
                    onClose={() => setModalSettings((prev) => ({ ...prev, isOpenDelete: false }))}
                    onConfirmDelete={handleDeleteConfirmation}
                />
            )}
        </div>
    )
}

export default Documente
