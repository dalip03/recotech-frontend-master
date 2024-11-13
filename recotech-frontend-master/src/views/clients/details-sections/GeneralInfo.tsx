import { Field, Form, Formik } from 'formik'
import { Button, FormContainer, FormItem, Input, Radio, Checkbox } from '@/components/ui'
import * as Yup from 'yup'

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

const GeneralInfo = ({ client, onSubmit }: any) => {
    const initialValues: FormValues = {
        type: client?.type ?? 'COMPANY',
        name: client?.name ?? '',
        vat: client?.vat ?? '',
        email: client?.email ?? '',
        phone: client?.phone ?? '',
        billingAddress: client?.billingAddress ?? '',
        billingCity: client?.billingCity ?? '',
        billingCounty: client?.billingCounty ?? '',
        billingPostalCode: client?.billingPostalCode ?? '',
        shippingAddress: client?.shippingAddress ?? '',
        shippingCity: client?.shippingCity ?? '',
        shippingCounty: client?.shippingCounty ?? '',
        shippingPostalCode: client?.shippingPostalCode ?? '',
    }

    return (
        <div>
            <h3>Informatii Generale</h3>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                {({ values, setFieldValue, errors, touched }) => (
                    <Form>
                        <FormContainer className="text-left">
                            {/* Tip Client */}
                            <FormItem
                                labelWidth={140}
                                label="Tip"
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
                                        Persoană fizică
                                    </Radio>
                                    <Radio
                                        name="type"
                                        value="COMPANY"
                                        checked={values.type === 'COMPANY'}
                                        onChange={() => setFieldValue('type', 'COMPANY')}
                                    >
                                        Persoană juridică
                                    </Radio>
                                </div>
                            </FormItem>

                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                                {/* Nume / Denumire Societate */}
                                <FormItem
                                    labelWidth={140}
                                    label="Nume / Denumire Societate"
                                    invalid={Boolean(errors.name && touched.name)}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        name="name"
                                        value={values.name}
                                        placeholder="Nume Prenume / Denumire Societate"
                                        component={Input}
                                    />
                                </FormItem>

                                {/* VAT */}
                                {values.type === 'COMPANY' && (
                                    <FormItem
                                        labelWidth={140}
                                        label="VAT"
                                        invalid={Boolean(errors.vat && touched.vat)}
                                        errorMessage={errors.vat}
                                    >
                                        <Field
                                            type="text"
                                            name="vat"
                                            placeholder="VAT"
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
                                    label="Telefon"
                                    invalid={Boolean(errors.phone && touched.phone)}
                                    errorMessage={errors.phone}
                                >
                                    <Field
                                        type="text"
                                        name="phone"
                                        placeholder="Telefon"
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                            <FormItem
                                labelWidth={140}
                                label="Adresa de facturare"
                                invalid={Boolean(errors.billingAddress && touched.billingAddress)}
                                errorMessage={errors.billingAddress}
                            >
                                <Field
                                    name="billingAddress"
                                    placeholder="Adresa de facturare..."
                                    component={Input}
                                    textArea
                                />
                            </FormItem>

                            {/* Adresa de Facturare */}
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>

                                <FormItem
                                    labelWidth={140}
                                    label="Oraș"
                                    invalid={Boolean(errors.billingCity && touched.billingCity)}
                                    errorMessage={errors.billingCity}
                                >
                                    <Field
                                        name="billingCity"
                                        placeholder="Oraș"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label="Județ"
                                    invalid={Boolean(errors.billingCounty && touched.billingCounty)}
                                    errorMessage={errors.billingCounty}
                                >
                                    <Field
                                        name="billingCounty"
                                        placeholder="Județ"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label="Cod Poștal"
                                    invalid={Boolean(errors.billingPostalCode && touched.billingPostalCode)}
                                    errorMessage={errors.billingPostalCode}
                                >
                                    <Field
                                        name="billingPostalCode"
                                        placeholder="Cod Poștal"
                                        component={Input}
                                    />
                                </FormItem>

                            </div>

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
                                    Aceeași adresă pentru livrare
                                </Checkbox>
                            </FormItem>

                            {/* Adresa de Livrare */}
                            <FormItem
                                labelWidth={140}
                                label="Adresa de livrare"
                                invalid={Boolean(errors.shippingAddress && touched.shippingAddress)}
                                errorMessage={errors.shippingAddress}
                            >
                                <Field
                                    name="shippingAddress"
                                    placeholder="Adresa de livrare..."
                                    component={Input}
                                    textArea
                                />
                            </FormItem>
                            <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
                                <FormItem
                                    labelWidth={140}
                                    label="Oraș"
                                    invalid={Boolean(errors.shippingCity && touched.shippingCity)}
                                    errorMessage={errors.shippingCity}
                                >
                                    <Field
                                        name="shippingCity"
                                        placeholder="Oraș"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label="Județ"
                                    invalid={Boolean(errors.shippingCounty && touched.shippingCounty)}
                                    errorMessage={errors.shippingCounty}
                                >
                                    <Field
                                        name="shippingCounty"
                                        placeholder="Județ"
                                        component={Input}
                                    />
                                </FormItem>

                                <FormItem
                                    labelWidth={140}
                                    label="Cod Poștal"
                                    invalid={Boolean(errors.shippingPostalCode && touched.shippingPostalCode)}
                                    errorMessage={errors.shippingPostalCode}
                                >
                                    <Field
                                        name="shippingPostalCode"
                                        placeholder="Cod Poștal"
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                        </FormContainer>

                        {/* Buttons */}
                        <div className="flex justify-end mt-6">
                            <Button variant="solid" type="submit">
                                Salvează Client
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default GeneralInfo;