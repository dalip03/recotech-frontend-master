import { Button, Card } from '@/components/ui'
import { useEffect, useState } from 'react'
import CustomDropdown from '../../../components/common/CustomDropdown'
import ModalAddDocuments from './modals/ModalAddDocuments'
import { useParams } from 'react-router-dom'
import { getProjectById } from '@/api/projectService'
import { fetchClients } from '@/api/clientService'
import { deleteDocument, downloadFile, fetchDocuments, saveFile, updateDocument } from '@/api/documentsService'
import Dropdown from '../../../components/ui/Dropdown'
import { Input } from '../../../components/ui/Input'
import { fetchProjectTypes } from '@/api/projectTypeService'
import { fetchUsers } from '@/api/userService'
import { useTranslation } from 'react-i18next'

const InformatiiDocumente = () => {

    const { id } = useParams();
    const { t } = useTranslation();

    const [openModal, setOpenModal] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
    const [projectTypes, setProjectTypes] = useState<any>([]);
    const [users, setUsers] = useState<any>([]);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
    });

    useEffect(() => {
        const fetchProject = async () => {
            const result = await getProjectById(id || '');
            await fetchDocumentsData();
            await fetchProjectTypeData();
            const userResult = await fetchUsers();
            const users = userResult.data.content;
            setUsers(users);
        }
        fetchProject();
    }, [id])

    const handleModalClose = () => {
        setOpenModal(false);
    }

    const handleDownload = async (documentObj: any) => {
        const documentName = documentObj.name;
        const result = await downloadFile(documentObj.fileKey);
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', documentName); // Use the filename from headers or a fallback
        document.body.appendChild(link);
        link.click();
        link.remove();

    }

    const fetchProjectTypeData = async () => {
        const result = await fetchProjectTypes();
        console.log(result)
        setProjectTypes(result);
    }

    const fetchDocumentsData = async () => {
        const documents = await fetchDocuments('projectId=' + id);
        let filteredDocuments = documents.content.filter((doc: { status: string }) => doc.status.trim().toUpperCase() !== "DRAFT");
        setDocuments(filteredDocuments);
        setFilteredDocuments(filteredDocuments);
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
            <div className="flex flex-wrap items-center justify-between">
                <Button onClick={() => setOpenModal(true)} className="mb-4" shape="circle">
                    {t("New Document")} +
                </Button>
                <div className="flex items-center ml-auto gap-4">
                    <Button className="flex flex-1 items-center mb-4" shape="circle">
                        <Dropdown className="" title={filters.type != '' ? filters.type : t("All Documents")}>
                            <Dropdown.Item onClick={() => handleProjectTypeFilter('')} eventKey="all">{t("All Documents")}</Dropdown.Item>
                            {projectTypes && projectTypes.map((projectType: any, index: any) => {
                                return (
                                    <Dropdown.Item key={index} onClick={() => handleProjectTypeFilter(projectType.name)} eventKey={projectType.id}>{projectType.name}</Dropdown.Item>
                                )
                            })}
                        </Dropdown>
                    </Button>
                    <Input
                        className="w-[240px] h-[40px] rounded-full mb-4"
                        placeholder="Cauta..."
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-row gap-5 flex-wrap">
                {filteredDocuments.map((document: any, index) => {

                    const dropdownItems = [
                        { eventKey: 'descarca', label: t("Download"), onClick: () => handleDownload(document) },
                        { eventKey: 'edit', label: 'Edit' },
                        { eventKey: 'delete', label: t("Delete") },
                    ]
                    const user = users.find((user: any) => user.id === document.userId)
                    const userFullName = `${user?.firstName} ${user?.lastName}`
                    return (
                        <Card
                            key={index}
                            header={
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-black">
                                        {document.name}
                                    </span>
                                    <CustomDropdown items={dropdownItems} />
                                </div>
                            }
                            clickable={true}
                            className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl text-base w-full lg:max-w-80"
                            onClick={(e) => console.log('Card Clickable', e)}
                        >
                            <div className="flex justify-between mt-2">
                                <p>{t("Status")}: </p>
                                <p className="text-right">{document.status}</p>
                            </div>
                            <div className="flex justify-between mt-2">
                                <p>{t("Client")}: </p>
                                {/* TODO get client name here */}
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
            {openModal && (
                <ModalAddDocuments
                    isOpen={openModal}
                    onClose={handleModalClose}
                    projectId={id ?? null}
                />
            )}
        </div>
    )
}

export default InformatiiDocumente
