import { getProjectById, updateProject } from '@/api/projectService';
import { Button, DatePicker, Input, Notification, Select, toast } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchStatements } from '@/api/constatariService';
import { useTranslation } from 'react-i18next';

interface Proiect {
    createDate: string;
    updateDate: string;
    id: string;
    name: string;
    description: string;
    type: string;
    createdById: number | null;
    status: string;
    checkpoint: string;
    projectClientId: number | null;
    taskCount: number | null;
    completedTaskCount: number | null;
    materialCost: number | null;
    laborCost: number | null;
    discount: number | null; // Discount as a percentage
    discountType: string;
    paymentType: string;
    paymentDate: string;
    vat: number | null;
    totalCost: number | null;
    totalCostDiscounted: number | null;
    discountCalculated: number | null;
    vatCalculated: number | null;
    totalCostWithVat: number | null;
    discountedLaborCost: number | null;
}

const paymentOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Card', value: 'CARD' },
    { label: 'Transfer Bancar', value: 'TRANSFER' },
];

const defaultVATRate = 19; // default VAT percentage

const InformatiiFinanciare = () => {
    const { id } = useParams<{ id: string }>();

    const [project, setProject] = useState<Proiect | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchData = async () => {
            const result = await getProjectById(id || '');
            result.laborCost = (await fetchStatements()).filter((statement: any) => statement.projectId == result?.id).reduce((acc: any, cur: any) => acc + (cur.cost || 0), 0);
            setProject(result);
        };
        if (typeof id === 'string' && id !== 'nou') {
            fetchData();
        }
    }, [id]);

    // Subtotal before discount
    const subtotal = (project?.materialCost || 0) + (project?.laborCost || 0);

    // Formik validation schema using Yup
    const validationSchema = Yup.object().shape({
        materialCost: Yup.number()
            .nullable()
            .required('Cost Materiale is required')
            .min(0, 'Cost must be at least 0'),
        laborCost: Yup.number()
            .nullable()
            .min(0, 'Cost must be at least 0'),
        discount: Yup.number()
            .nullable()
            .min(0, 'Discount must be at least 0')
            .max(100, 'Discount cannot be more than 100'),
        paymentType: Yup.string().required('Payment method is required'),
        paymentDate: Yup.date().required('Payment date is required'),
    });

    const handleSave = async (values: any) => {
        try {
            if (isNaN(parseInt(id ?? ''))) {
                throw new Error('Invalid project ID');
            }
            const updatedProject = {
                name: project?.name,
                type: project?.type,
                description: project?.description,
                status: project?.status,
                materialCost: values.materialCost,
                laborCost: values.laborCost,
                discount: values.discount,
                paymentType: values.paymentType,
                paymentDate: values.paymentDate,
                vat: project?.vat ?? defaultVATRate,
            };
            await updateProject(parseInt(id ?? ''), updatedProject);
            toast.push(
                <Notification title="Mesasge" type="success">
                    Informațiile financiare au fost actualizate cu succes
                </Notification>,
                { placement: 'bottom-end' }
            )
        } catch (error) {
            console.error('Failed to update project', error);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
            {project && (
                <Formik
                    initialValues={{
                        materialCost: project.materialCost || 0,
                        laborCost: project.laborCost || 0,
                        discount: project.discount || 0,
                        paymentType: project.paymentType || '',
                        paymentDate: project.paymentDate || '',
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSave}
                    enableReinitialize
                >
                    {({ values, setFieldValue }) => (
                        <Form className="grid grid-cols-1 gap-4 md:gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="materials-cost">
                                        {t("Material Cost")}
                                    </label>
                                    <Field
                                        name="materialCost"
                                        as={Input}
                                        id="materials-cost"
                                        placeholder={t("Material Cost")}
                                        type="number"
                                        suffix="RON"
                                    />
                                    <ErrorMessage name="materialCost" component="div" className="text-red-500" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="payment-type">
                                        {t("Payment Methods")}
                                    </label>
                                    <Select
                                        id="payment-type"
                                        value={paymentOptions.find((option) => option.value === values.paymentType)}
                                        options={paymentOptions}
                                        placeholder={t("Payment Methods")}
                                        onChange={(option) =>
                                            setFieldValue('paymentType', option?.value || '')
                                        }
                                    />
                                    <ErrorMessage name="paymentType" component="div" className="text-red-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="labor-cost">
                                        {t("Labour Cost")}
                                    </label>
                                    <Field
                                        name="laborCost"
                                        as={Input}
                                        id="labor-cost"
                                        placeholder={t("Labour Cost")}
                                        suffix="RON"
                                        disabled={true}
                                    />
                                    <ErrorMessage name="laborCost" component="div" className="text-red-500" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2">{t("Payment Date")}</label>
                                    <DatePicker
                                        placeholder={t("Payment Date")}
                                        inputFormat="DD-MM-YYYY"
                                        value={values.paymentDate ? new Date(values.paymentDate) : undefined}
                                        onChange={(value) => setFieldValue('paymentDate', value || '')}
                                    />
                                    <ErrorMessage name="paymentDate" component="div" className="text-red-500" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="discount">
                                        {t("Discount")} (%)
                                    </label>
                                    <Field
                                        name="discount"
                                        as={Input}
                                        id="discount"
                                        placeholder={`${t("Discount")} %`}
                                        suffix="%"
                                    />
                                    <ErrorMessage name="discount" component="div" className="text-red-500" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2" htmlFor="VAT">
                                        {t("VAT")}
                                    </label>
                                    <Input
                                        id="VAT"
                                        placeholder={t("VAT")}
                                        suffix="%"
                                        value={(subtotal * (defaultVATRate / 100)).toFixed(2)}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Financial Summary Section */}
                            <div className="p-4 border border-gray-300 rounded-lg bg-gray-100">
                                <div className="flex justify-between mb-2">
                                    <h5 className="font-semibold">{t("Total Cost")}:</h5>
                                    <span>{subtotal.toFixed(2)} RON</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <h5 className="font-semibold">
                                        {t("Discount")} ({values.discount || 0}%):
                                    </h5>
                                    <span>
                                        -{(subtotal * ((values.discount || 0) / 100)).toFixed(2)} RON
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <h5 className="font-semibold">{t("VAT")} ({defaultVATRate}%):</h5>
                                    <span>{(subtotal * (defaultVATRate / 100)).toFixed(2)} RON</span>
                                </div>
                                <div className="flex justify-between">
                                    <h5 className="font-semibold">{t("Total Payment")}:</h5>
                                    <span>
                                        {(
                                            subtotal -
                                            subtotal * ((values.discount || 0) / 100) +
                                            subtotal * (defaultVATRate / 100)
                                        ).toFixed(2)}{' '}
                                        RON
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <Button className="w-full lg:w-fit" type="submit">
                                    {t("Save")}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
    );
};

export default InformatiiFinanciare;
