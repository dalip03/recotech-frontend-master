import React from 'react'
import { Button, Dialog, FormContainer, FormItem, Input, Radio, Checkbox } from '@/components/ui'
import { HiUserCircle } from 'react-icons/hi'
import * as Yup from 'yup'
import { Field, Form, Formik } from 'formik'
import { addClient } from '@/api/clientService'
import { useTranslation } from 'react-i18next'

interface ModalAddClientiProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (values: any) => void
    data: any
}

interface FormValues {
    type: string
    name: string
    vat: string
    email: string
    phone: string
    billingAddress: string
    billingCity: string
    billingCounty: string
    billingPostalCode: string
    shippingAddress: string
    shippingCity: string
    shippingCounty: string
    shippingPostalCode: string
}

const validationSchema = Yup.object().shape({
    type: Yup.string()
        .required('Tipul clientului este necesar')
        .oneOf(['INDIVIDUAL', 'COMPANY']),
    name: Yup.string().required('Numele este necesar'),
    vat: Yup.string().when('type', (type: any) =>
        type === 'COMPANY' ? Yup.string().required('VAT este necesar pentru persoane juridice') : Yup.string().notRequired()
    ),
    email: Yup.string().email('Email invalid').required('Emailul este necesar'),
    phone: Yup.string().required('Telefonul este necesar'),
    billingAddress: Yup.string().required('Adresa de facturare este necesară'),
    billingCity: Yup.string().required('Orașul de facturare este necesar'),
    billingCounty: Yup.string().required('Județul de facturare este necesar'),
    billingPostalCode: Yup.string().required('Codul poștal de facturare este necesar'),
    shippingAddress: Yup.string().required('Adresa de livrare este necesară'),
    shippingCity: Yup.string().required('Orașul de livrare este necesar'),
    shippingCounty: Yup.string().required('Județul de livrare este necesar'),
    shippingPostalCode: Yup.string().required('Codul poștal de livrare este necesar'),
})

const ModalAddClienti: React.FC<ModalAddClientiProps> = ({ isOpen, onClose, data, onSubmit }) => {
    const initialValues: FormValues = {
        type: data?.type ?? 'COMPANY',
        name: data?.name ?? '',
        vat: data?.vat ?? '',
        email: data?.email ?? '',
        phone: data?.phone ?? '',
        billingAddress: data?.billingAddress ?? '',
        billingCity: data?.billingCity ?? '',
        billingCounty: data?.billingCounty ?? '',
        billingPostalCode: data?.billingPostalCode ?? '',
        shippingAddress: data?.shippingAddress ?? '',
        shippingCity: data?.shippingCity ?? '',
        shippingCounty: data?.shippingCounty ?? '',
        shippingPostalCode: data?.shippingPostalCode ?? '',
    }

    console.log(data);

    const { t } = useTranslation();

    return (
        <Dialog isOpen={isOpen} width={700} onClose={onClose}>
            <h5>{t("Add Client")}</h5>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form>
                        <div className="max-h-[70vh] w-full overflow-y-auto space-y-5 p-5">
                            <FormContainer layout="horizontal" className="text-left">
                                {/* Tip Client */}
                                <FormItem
                                    labelWidth={140}
                                    label={t("Type")}
                                    invalid={Boolean(errors.type && touched.type)}
                                    errorMessage={errors.type}
                                >
                                    <div className="flex items-center gap-4">
                                        <Radio
                                            name="type"
                                            value="INDIVIDUAL"
                                            checked={values.type === 'INDIVIDUAL'}
                                            onChange={() => setFieldValue('type', 'INDIVIDUAL')}
                                        >
                                            {t("client-individual")}
                                        </Radio>
                                        <Radio
                                            name="type"
                                            value="COMPANY"
                                            checked={values.type === 'COMPANY'}
                                            onChange={() => setFieldValue('type', 'COMPANY')}
                                        >
                                            {t("client-company")}
                                        </Radio>
                                    </div>
                                </FormItem>

                                {/* Nume / Denumire Societate */}
                                <FormItem
                                    labelWidth={140}
                                    label={`${t("Name")} / ${t("Company Name")}`}
                                    invalid={Boolean(errors.name && touched.name)}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        name="name"
                                        placeholder={`${t("Name")} / ${t("Company Name")}`}
                                        component={Input}
                                    />
                                </FormItem>

                                {/* VAT */}
                                {values.type === 'COMPANY' && (
                                    <FormItem
                                        labelWidth={140}
                                        label={t("VAT")}
                                        invalid={Boolean(errors.vat && touched.vat)}
                                        errorMessage={errors.vat}
                                    >
                                        <Field
                                            type="text"
                                            name="vat"
                                            placeholder={t("VAT")}
                                            component={Input}
                                        />
                                    </FormItem>
                                )}

                                {/* Email */}
                                <FormItem
                                    labelWidth={140}
                                    label="Email"
                                    invalid={Boolean(errors.email && touched.email)}
                                    errorMessage={errors.email}
                                >
                                    <Field
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        component={Input}
                                    />
                                </FormItem>

                                {/* Telefon */}
                                <FormItem
                                    labelWidth={140}
                                    label={t("Phone")}
                                    invalid={Boolean(errors.phone && touched.phone)}
                                    errorMessage={errors.phone}
                                >
                                    <Field
                                        type="text"
                                        name="phone"
                                        placeholder={t("Phone")}
                                        component={Input}
                                    />
                                </FormItem>

                                {/* Adresa de Facturare */}
                                <FormItem
                                    labelWidth={140}
                                    label={t("Billing Address")}
                                    invalid={Boolean(errors.billingAddress && touched.billingAddress)}
                                    errorMessage={errors.billingAddress}
                                >
                                    <Field
                                        name="billingAddress"
                                        placeholder={`${t("Billing Address")}...`}
                                        component={Input}
                                        textArea
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("City")}
                                    invalid={Boolean(errors.billingCity && touched.billingCity)}
                                    errorMessage={errors.billingCity}
                                >
                                    <Field
                                        name="billingCity"
                                        placeholder={t("City")}
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("County")}
                                    invalid={Boolean(errors.billingCounty && touched.billingCounty)}
                                    errorMessage={errors.billingCounty}
                                >
                                    <Field
                                        name="billingCounty"
                                        placeholder={t("County")}
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("Zip Code")}
                                    invalid={Boolean(errors.billingPostalCode && touched.billingPostalCode)}
                                    errorMessage={errors.billingPostalCode}
                                >
                                    <Field
                                        name="billingPostalCode"
                                        placeholder={t("Zip Code")}
                                        component={Input}
                                    />
                                </FormItem>

                                {/* Checkbox pentru copierea adresei de facturare */}
                                <FormItem>
                                    <Checkbox
                                        checked={
                                            values.shippingAddress !== '' &&
                                            values.shippingAddress === values.billingAddress &&
                                            values.shippingCity === values.billingCity &&
                                            values.shippingCounty === values.billingCounty &&
                                            values.shippingPostalCode === values.billingPostalCode
                                        }
                                        onChange={(checked) => {
                                            if (checked) {
                                                setFieldValue('shippingAddress', values.billingAddress)
                                                setFieldValue('shippingCity', values.billingCity)
                                                setFieldValue('shippingCounty', values.billingCounty)
                                                setFieldValue('shippingPostalCode', values.billingPostalCode)
                                            } else {
                                                setFieldValue('shippingAddress', '')
                                                setFieldValue('shippingCity', '')
                                                setFieldValue('shippingCounty', '')
                                                setFieldValue('shippingPostalCode', '')
                                            }
                                        }}
                                    >
                                        {t("Shipping Address is the same as Billing Address")}
                                    </Checkbox>
                                </FormItem>

                                {/* Adresa de Livrare */}
                                <FormItem
                                    labelWidth={140}
                                    label={t("Shipping Address")}
                                    invalid={Boolean(errors.shippingAddress && touched.shippingAddress)}
                                    errorMessage={errors.shippingAddress}
                                >
                                    <Field
                                        name="shippingAddress"
                                        placeholder={`${t("Shipping Address")}...`}
                                        component={Input}
                                        textArea
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("City")}
                                    invalid={Boolean(errors.shippingCity && touched.shippingCity)}
                                    errorMessage={errors.shippingCity}
                                >
                                    <Field
                                        name="shippingCity"
                                        placeholder={t("City")}
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("County")}
                                    invalid={Boolean(errors.shippingCounty && touched.shippingCounty)}
                                    errorMessage={errors.shippingCounty}
                                >
                                    <Field
                                        name="shippingCounty"
                                        placeholder={t("County")}
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label={t("Zip Code")}
                                    invalid={Boolean(errors.shippingPostalCode && touched.shippingPostalCode)}
                                    errorMessage={errors.shippingPostalCode}
                                >
                                    <Field
                                        name="shippingPostalCode"
                                        placeholder={t("Zip Code")}
                                        component={Input}
                                    />
                                </FormItem>
                            </FormContainer>

                            {/* Buttons */}
                        </div>
                        <div className="flex justify-between mt-6">
                            <Button variant="plain" onClick={onClose}>
                                {t("Close")}
                            </Button>
                            <Button variant="solid" type="submit">
                                {t("Save")}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

export default ModalAddClienti
