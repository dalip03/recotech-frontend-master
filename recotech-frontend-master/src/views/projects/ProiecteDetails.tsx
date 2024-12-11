import { useNavigate, useParams } from 'react-router-dom';
import Steps from '@/components/ui/Steps';
import { Card } from '@/components/ui';
import Tabs from '@/components/ui/Tabs';
import InformatiiClienti from './components/InformatiiClient';
import InformatiiProiect from './components/InformatiiProiect';
import InformatiiFinanciare from './components/InformatiiFinanciare';
import InformatiiDocumente from './components/InformatiiDocumente';
import InformatiiSarcini from './components/InformatiiSarcini';
import InformatiiPiese from './components/InformatiiPiese';
import InformatiiConstatari from './components/InformatiiConstatari';
import { useEffect, useState } from 'react';
import { getProjectById, updateProject } from '@/api/projectService';
import { fetchProjectTypes } from '@/api/projectTypeService';
import toastNotification from '@/components/common/ToastNotification';
import { useAppSelector } from '@/store';
import { hasAccess, UserRole } from '@/utils/sharedHelpers';
import { useTranslation } from 'react-i18next';

const { TabNav, TabList, TabContent } = Tabs;

export default function ProiectDetails() {
    const { id }: any = useParams<any>();
    const [currentStep, setCurrentStep] = useState(1);
    const [project, setProject] = useState<any>();
    const [steps, setSteps] = useState<{ label: string; description: string }[]>([]);

    const { t } = useTranslation();
    const navigate = useNavigate();

    const userRole = useAppSelector((state) => state.auth.user.authority) as UserRole;

    const handleCardClick = (step: number) => {
        if (!hasAccess(userRole, ['ADMIN'])) {
            toastNotification.error('Nu aveți acces la această acțiune');
            return;
        }
        project.checkpoint = step;
        const submittableObject = {
            name: project.name,
            description: project.description,
            status: project.status,
            type: project.type,
            checkpoint: step,
            materialCost: project.materialCost,
            laborCost: project.laborCost,
            discount: project.discount,
            discountType: project.discountType,
            paymentType: project.paymentType,
            paymentDate: project.paymentDate,
            vat: project.vat
        };
        if (id !== 'nou') {
            updateProject(id, submittableObject);
        }
        setCurrentStep(step);
    };

    const getCurrentProject = async () => {
        // TODO CHECK IF USER CAN ACTUALLY VIEW THIS PROJECT. IF NOT REDIRECT TO DASHBOARD
        if (id !== 'nou') {
            const result = await getProjectById(id);
            const projectTypes = await fetchProjectTypes();
            const currentProjectType = projectTypes.find((projectType: any) => projectType.name === result.type);

            setProject(result);
            setCurrentStep(result.checkpoint ?? 1);

            // Create steps based on variables in currentProjectType
            if (currentProjectType && currentProjectType.variables) {
                const dynamicSteps = Object.entries(currentProjectType.variables).map(([key, value], index) => ({
                    label: key, // Step label (e.g., "Pas 1")
                    description: `${value}` // Description can include the value or any other text you want
                }));
                setSteps(dynamicSteps);
            } else {
                setSteps([]); // Fallback to empty if no variables found
            }
        }
    };

    useEffect(() => {
        const fetchProject = async () => {
            await getCurrentProject();
        };
        fetchProject();
    }, []);

    return (
        <div className="text-xl font-semibold">
            <h2 className=" pt-4 font-bold ">{t("Project")}: {id}</h2>

            <div className="mb-4">
                <Steps current={currentStep}>
                    {steps.map((step, index) => (
                        <Steps.Item key={index} />
                    ))}
                </Steps>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
                {steps.map((step, index) => (
                    <Card
                        key={index}
                        clickable
                        className="hover:shadow-lg transition duration-150 ease-in-out rounded-2xl min-h-40"
                        onClick={() => handleCardClick(index + 1)} // Adjusted index for 1-based step
                    >
                        <h5 className="text-xl font-bold">{step.label}</h5>
                        <p className="mt-4 text-xl font-bold">{step.description}</p>
                    </Card>
                ))}
            </div>
            <div className="mt-4">
                <Tabs defaultValue="tab1" variant="pill">
                    <TabList>
                        <TabNav value="tab1">{t("Project Information")}</TabNav>
                        {id && id !== 'nou' && (
                            <>
                                {hasAccess(userRole, ['ADMIN', 'VANZATOR', 'RECEPTION']) && (
                                    <>
                                        <TabNav value="tab2">{t("Client Information")}</TabNav>
                                        <TabNav value="tab3">{t("Financial Information")}</TabNav>
                                    </>
                                )}
                                {hasAccess(userRole, ['ADMIN', 'RECEPTION', 'VANZATOR']) && (
                                    <TabNav value="tab4">{t("Documents")}</TabNav>
                                )}
                                {hasAccess(userRole, ['ADMIN', 'OPERATOR', 'RECEPTION', 'PIESAR', 'VANZATOR']) && (
                                    <>
                                        <TabNav value="tab5">{t("Tasks")}</TabNav>
                                    </>
                                )}
                                {hasAccess(userRole, ['ADMIN', 'OPERATOR', 'RECEPTION', 'MAGAZIE', 'PIESAR', 'VANZATOR']) && (
                                    <TabNav value="tab6">{t("Statements")}</TabNav>
                                )}
                                {hasAccess(userRole, ['ADMIN', 'PIESAR', 'MAGAZIE', 'RECEPTION', 'OPERATOR', 'VANZATOR']) && (
                                    <TabNav value="tab7">{t("Parts")}</TabNav>
                                )} 
                            </>
                        )}
                    </TabList>
                    <div className="p-4">
                        <TabContent value="tab1">
                            <InformatiiProiect projectId={id} />
                        </TabContent>
                        {id && id !== 'nou' && (
                            <>
                                <TabContent value="tab2">
                                    <InformatiiClienti />
                                </TabContent>
                                <TabContent value="tab3">
                                    <InformatiiFinanciare />
                                </TabContent>
                                <TabContent value="tab4">
                                    <InformatiiDocumente />
                                </TabContent>
                                <TabContent value="tab5">
                                    <InformatiiSarcini projectId={id} />
                                </TabContent>
                                <TabContent value="tab6">
                                    <InformatiiConstatari projectId={id} />
                                </TabContent>
                                <TabContent value="tab7">
                                    <InformatiiPiese projectId={id} />
                                </TabContent>
                            </>
                        )}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
