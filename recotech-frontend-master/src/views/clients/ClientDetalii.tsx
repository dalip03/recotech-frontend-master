import { Spinner, Tabs } from "@/components/ui";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import { fetchClients, updateClient } from "@/api/clientService";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ClientProjects from "./details-sections/ClientProjects";
import Email from "./details-sections/Email";
import GeneralInfo from "./details-sections/GeneralInfo";

export default function ClientDetalii() {
    const [client, setClient] = useState<any>(null);
    const [clients, setClients] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Get the tab from the search params, default to 'info-general'
    const tabValue: string = searchParams.get('tab') || 'info-general';

    const fetchClient = async () => {
        const result = await fetchClients();
        setClients(result);
        const client = result.find((client: any) => client.id == id);
        setClient(client);
    }

    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);
            await fetchClient();
            setLoading(false);
        };
        fetchClientData();
    }, [id]);

    useEffect(() => {
        // If there's no 'tab' in the search params, set it to 'info-general'
        if (!searchParams.has('tab')) {
            setSearchParams({ tab: 'info-general' });
        }
    }, [searchParams, setSearchParams]);

    const onSaveClientData = async (values: any) => {
        await updateClient(client.id, values);
        await fetchClient();
    }

    const handleTabChange = (newTabValue: string) => {
        // Update the 'tab' query parameter in the URL
        setSearchParams({ tab: newTabValue });
    };

    if (loading) {
        return (
            <div className='flex justify-center items-center h-full w-full'>
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div>
            <h1 className="mb-4">Detalii Client</h1>
            <div className="mt-4">
                <Tabs value={tabValue} variant="pill" onChange={handleTabChange}>
                    <TabList>
                        <TabNav value="info-general">Informatii Generale</TabNav>
                        <TabNav value="email">Email</TabNav>
                        <TabNav value="proiecte-asociate">Proiecte Asociate</TabNav>
                    </TabList>
                    <div className="p-4">
                        <TabContent value="info-general">
                            <GeneralInfo client={client} onSubmit={onSaveClientData} />
                        </TabContent>
                        <TabContent value="email">
                            <Email />
                        </TabContent>
                        <TabContent value="proiecte-asociate">
                            <ClientProjects client={client} />
                        </TabContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
