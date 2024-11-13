import { Button, Dialog, FormContainer, FormItem, Input } from "@/components/ui";
import { Field, Form, Formik } from "formik";
import * as Yup from 'yup';

interface FormValues {
    name: string
    description: string
    category: string
    quantity: string
    location: string
    cost: string
}

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Numele piesei este necesar'),
    description: Yup.string().required('Descrierea piesei este necesară'),
    category: Yup.string().required('Categoria piesei este necesară'),
    quantity: Yup.string().required('Cantitatea piesei este necesară'),
    cost: Yup.string().required('Prețul piesei este necesar'),
    location: Yup.string().required('Locatia piesei este necesară'),
});

export default function ModalAddPiese({ isOpen, onSubmit, selectedPiece, onClose }: any) {

    const initialValues: FormValues = {
        name: selectedPiece?.name ?? '',
        description: selectedPiece?.description ?? '',
        category: selectedPiece?.category ?? '',
        quantity: selectedPiece?.quantity ?? '',
        location: selectedPiece?.location ?? '',
        cost: selectedPiece?.cost ?? '',
    }

    return (
        <Dialog isOpen={isOpen}>
            <div>
                <h5 className="mb-4">{selectedPiece ? 'Editează piesa' : 'Adaugă piesa'}</h5>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ setFieldValue, errors, touched, values }) => (
                        <Form>
                            <FormContainer layout="horizontal" className="text-left">
                                <FormItem
                                    labelWidth={140}
                                    label="Nume"
                                    invalid={Boolean(errors.name && touched.name)}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder="Nume"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label="Descriere"
                                    invalid={Boolean(errors.description && touched.description)}
                                    errorMessage={errors.description}
                                >
                                    <Field
                                        textArea
                                        type="text"
                                        autoComplete="off"
                                        name="description"
                                        placeholder="Descriere"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label="Categorie"
                                    invalid={Boolean(errors.category && touched.category)}
                                    errorMessage={errors.category}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="category"
                                        placeholder="Categorie"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label="Cantitate"
                                    invalid={Boolean(errors.quantity && touched.quantity)}
                                    errorMessage={errors.quantity}
                                >
                                    <Field
                                        type="number"
                                        autoComplete="off"
                                        name="quantity"
                                        placeholder="Cantitate"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label="Preț"
                                    invalid={Boolean(errors.quantity && touched.quantity)}
                                    errorMessage={errors.quantity}
                                >
                                    <Field
                                        type="number"
                                        autoComplete="off"
                                        name="cost"
                                        placeholder="0.00"
                                        component={Input}
                                    />
                                </FormItem>
                                <FormItem
                                    labelWidth={140}
                                    label="Locatie"
                                    invalid={Boolean(errors.location && touched.location)}
                                    errorMessage={errors.location}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="location"
                                        placeholder="Locatie"
                                        component={Input}
                                    />
                                </FormItem>
                            </FormContainer>
                            <div className="flex justify-between mt-6">
                                <Button variant="plain" onClick={() => onClose(false)}>
                                    Înapoi
                                </Button>
                                <Button variant="solid" type="submit">
                                    {selectedPiece ? 'Actualizează' : 'Salvează'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </Dialog>
    )
}