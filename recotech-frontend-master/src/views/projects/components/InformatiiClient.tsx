import { useEffect, useState } from 'react';
import { Button, Checkbox, Input, Select } from '../../../components/ui';
import Radio from '../../../components/ui/Radio';
import { fetchClients } from '../../../api/clientService';
import DatePicker from '@/components/ui/DatePicker/DatePicker';
import { addProjectClient, getProjectClientById, updateProjectClient } from '@/api/projectClientService';
import { useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '@/api/projectService';
import { useTranslation } from 'react-i18next';
import { hasAccess, UserRole } from '@/utils/sharedHelpers'
import { useAppSelector } from '@/store'

interface ProjectClient {
    id?: number | null;
    clientReferenceId: number | null;
    createDate?: string;
    type: string;
    name: string;
    vat: string;
    email: string;
    phone: string;
    billingAddress: string;
    billingCity: string;
    billingCounty: string;
    billingPostalCode: string;
    shippingAddress: string;
    shippingCity: string;
    shippingCounty: string;
    shippingPostalCode: string;
}

const InformatiiClienti = () => {
    const [clients, setClients] = useState<ProjectClient[]>([]);
    const [clientOptions, setClientOptions] = useState([]);
    const [client, setClient] = useState<ProjectClient>({
        id: null,
        clientReferenceId: null,
        createDate: '',
        type: 'COMPANY',
        name: '',
        vat: '',
        email: '',
        phone: '',
        billingAddress: '',
        billingCity: '',
        billingCounty: '',
        billingPostalCode: '',
        shippingAddress: '',
        shippingCity: '',
        shippingCounty: '',
        shippingPostalCode: '',
    });
    const [sameAddress, setSameAddress] = useState<boolean>(false);
    const [project, setProject] = useState<any>();
    const { id } = useParams();

    const { t } = useTranslation();
    const userRole = useAppSelector((state) => state.auth.user.authority);
    const hasAccess = ['SUPER_ADMIN', 'ADMIN'].includes(userRole);

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const clientsData = await fetchClients();
                setClients(clientsData);
                const project = await getProjectById(id || '');
                setProject(project);
                let projectClient = null;
                if (project?.projectClientId) {
                    projectClient = await getProjectClientById(project?.projectClientId || 0);
                }
                if (projectClient) {
                    setClient(projectClient);
                }
                setClientOptions(clientsData.map((client: any) => ({ value: client.id, label: client.name })));
            } catch (error) {
                console.error('Error fetching clients:', error);
            }
        };

        fetchClientData();
    }, [id]);

    const onCheck = (isChecked: boolean) => {
        console.log(isChecked)
        setSameAddress(isChecked);
        if (isChecked) {
            setClient((prevClient) => ({
                ...prevClient,
                shippingAddress: prevClient.billingAddress,
                shippingCity: prevClient.billingCity,
                shippingCounty: prevClient.billingCounty,
                shippingPostalCode: prevClient.billingPostalCode,
            }));
        } else {
            setClient((prevClient) => ({
                ...prevClient,
                shippingAddress: '',
                shippingCity: '',
                shippingCounty: '',
                shippingPostalCode: '',
            }));
        }
    };

    const handleClientChange = (selectedClient: any) => {
        const clientData = clients.find((c) => c.id === selectedClient.value);
        if (clientData) {
            setClient(clientData);
            setSameAddress(isSameShippingAddress(clientData)); // Set same address based on the selected client
        }
    };

    const handleSave = async () => {
        try {
            if (client?.id === null) {
                throw new Error('No client selected');
            }

            // Validate required fields
            if (!client.name || !client.email || !client.phone) {
                throw new Error('Please fill out all required fields (name, email, phone)');
            }

            const referenceClient = await getProjectClientById(Number(client.id));
            console.log('ref', referenceClient);
            // Make the API request to update the client
            if (id === 'nou' || !referenceClient) {
                const clientToSend = {
                    projectId: id ? parseInt(id) : '',
                    clientId: client.id ?? '',
                    // deliveryDate: client.deliveryDate ?? '',
                };
                await addProjectClient(clientToSend);

            } else {
                const clientToSend = {
                    type: client.type,
                    name: client.name,
                    vat: client.vat,
                    email: client.email,
                    phone: client.phone,
                    billingAddress: client.billingAddress,
                    billingCity: client.billingCity,
                    billingCounty: client.billingCounty,
                    billingPostalCode: client.billingPostalCode,
                    shippingAddress: client.shippingAddress,
                    shippingCity: client.shippingCity,
                    shippingCounty: client.shippingCounty,
                    shippingPostalCode: client.shippingPostalCode,
                };
                await updateProjectClient(Number(id), clientToSend);
            }
            const submittableObject = {
                name: project.name,
                description: project.description,
                status: project.status,
                type: project.type,
                checkpoint: project.checkpoint,
                materialCost: project.materialCost,
                laborCost: project.laborCost,
                discount: project.discount,
                discountType: project.discountType,
                paymentType: project.paymentType,
                paymentDate: project.paymentDate,
                vat: project.vat,
                deliveryDate: project.deliveryDate
            };
            console.log(submittableObject);
            await updateProject(Number(id), submittableObject);
        } catch (error: any) {
            console.error('Error updating client:', error);
        }
    };

    const isSameShippingAddress = (clientData: ProjectClient) => {
        return clientData.billingAddress !== '' && clientData.billingAddress === clientData.shippingAddress &&
            clientData.billingCity === clientData.shippingCity &&
            clientData.billingCounty === clientData.shippingCounty &&
            clientData.billingPostalCode === clientData.shippingPostalCode;
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            <div className="flex flex-row items-center space-x-2">
                <label className="whitespace-nowrap" htmlFor="client-type">{`${t("Select")} ${t("Client")}:`}</label>
                <Select
                isDisabled={!hasAccess}
                    placeholder={t("Client")}
                    className='rounded-full flex-1 flex-wrap min-w-[10rem] lg:max-w-[30%]'
                    style={{ flex: '0 1 100%' }}
                    value={clientOptions.find((clientOption: any) => clientOption.value === client.clientReferenceId)}
                    options={clientOptions}
                    onChange={handleClientChange} // Updated to handle client change
                />
            </div>
            <div className="flex flex-col">
                <label className="block" htmlFor="client-type">{t("Type")}:</label>
                <div className="flex items-center space-x-4">
                    <Radio
                    disabled={!hasAccess}
                        id="client-individual"
                        className="mr-4"
                        name="clientType"
                        checked={client.type === 'INDIVIDUAL'}
                        onChange={() => setClient((prevClient) => ({ ...prevClient, type: 'INDIVIDUAL' }))}
                    >
                        {t("client-individual")}
                    </Radio>
                    <Radio
                    disabled={!hasAccess}
                        id="client-company"
                        name="clientType"
                        checked={client.type === 'COMPANY'}
                        onChange={() => setClient((prevClient) => ({ ...prevClient, type: 'COMPANY' }))}
                    >
                        {t("client-company")}
                    </Radio>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="client-name">
                        {`${t("Name")} / ${t("Company Name")}`}
                    </label>
                    <Input
                    disabled={!hasAccess}
                        id="client-name"
                        placeholder={`${t("Name")} / ${t("Company Name")}`}
                        value={client.name}
                        onChange={(e) => setClient((prev) => ({ ...prev, name: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="client-vat">
                        {t("VAT")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="client-vat"
                        placeholder={t("VAT")}
                        value={client.vat}
                        onChange={(e) => setClient((prev) => ({ ...prev, vat: e.target.value }))}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="client-email">
                        Email
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="client-email"
                        placeholder="Email"
                        value={client.email}
                        onChange={(e) => setClient((prev) => ({ ...prev, email: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="client-phone">
                        {t("Phone")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="client-phone"
                        placeholder={t("Phone")}
                        value={client.phone}
                        onChange={(e) => setClient((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                </div>
            </div>
            <div>
                <label className="mb-2" htmlFor="billing-address">
                    {t("Billing Address")}
                </label>
                <Input
                 disabled={!hasAccess}
                    id='billing-address'
                    placeholder={t("Billing Address")}
                    textArea
                    value={client.billingAddress}
                    onChange={(e) => setClient((prev) => ({ ...prev, billingAddress: e.target.value }))}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="billing-city">
                        {t("City")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="billing-city"
                        placeholder={t("City")}
                        value={client.billingCity}
                        onChange={(e) => setClient((prev) => ({ ...prev, billingCity: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="billing-county">
                        {t("County")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="billing-county"
                        placeholder={t("County")}
                        value={client.billingCounty}
                        onChange={(e) => setClient((prev) => ({ ...prev, billingCounty: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="billing-postal-code">
                        {t("Zip Code")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="billing-postal-code"
                        placeholder={t("Zip Code")}
                        value={client.billingPostalCode}
                        onChange={(e) => setClient((prev) => ({ ...prev, billingPostalCode: e.target.value }))}
                    />
                </div>
            </div>
            <div>
                <Checkbox
                 disabled={!hasAccess}
                    className="mb-4"
                    checked={sameAddress || isSameShippingAddress(client)}
                    onChange={(e) => onCheck(e)}
                >
                    {t("Shipping Address is the same as Billing Address")}
                </Checkbox>
            </div>
            <div>
                <label className="mb-2" htmlFor="shipping-address">
                    {t("Shipping Address")}
                </label>
                <Input
                 disabled={!hasAccess}
                    id="shipping-address"
                    placeholder={t("Shipping Address")}
                    textArea
                    value={client.shippingAddress}
                    onChange={(e) => setClient((prev) => ({ ...prev, shippingAddress: e.target.value }))}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="shipping-city">
                        {t("City")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="shipping-city"
                        placeholder={t("City")}
                        value={client.shippingCity}
                        onChange={(e) => setClient((prev) => ({ ...prev, shippingCity: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="shipping-county">
                        {t("County")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="shipping-county"
                        placeholder={t("County")}
                        value={client.shippingCounty}
                        onChange={(e) => setClient((prev) => ({ ...prev, shippingCounty: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-2" htmlFor="shipping-postal-code">
                        {t("Zip Code")}
                    </label>
                    <Input
                     disabled={!hasAccess}
                        id="shipping-postal-code"
                        placeholder={t("Zip Code")}
                        value={client.shippingPostalCode}
                        onChange={(e) => setClient((prev) => ({ ...prev, shippingPostalCode: e.target.value }))}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {t("Save")}
                </Button>
            </div>
        </div>
    );
};

export default InformatiiClienti;
