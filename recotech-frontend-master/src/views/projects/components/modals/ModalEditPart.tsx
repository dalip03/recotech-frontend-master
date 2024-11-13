import { fetchParts, fetchPartsCategories } from "@/api/partsService";
import { Button, Dialog, FormItem, Input, Select } from "@/components/ui";
import { Field, FieldProps, Form, Formik } from "formik";
import { useEffect, useState } from "react";

const ModalEditPart = ({ isOpen, onClose, onSubmit, selectedPart }: any) => {
    const [modalData, setModalData] = useState({
        partsCategories: [],
        parts: [],
    })

    useEffect(() => {
        async function fetchData() {
            const partsCategories = await fetchPartsCategories();
            setModalData((prev: any) => ({
                ...prev,
                partsCategories,
            }))
        }

        if (isOpen) {
            fetchData();
        }
    }, [])

    useEffect(() => {
        const fetchPartsForPreSelectedCategories = async () => {
            const parts = await fetchParts(`category=${selectedPart.part.category}`);
            setModalData((prev: any) => ({
                ...prev,
                parts
            }));
        }

        fetchPartsForPreSelectedCategories();

    }, [isOpen, selectedPart]);

    console.log(selectedPart);
    const initialValues = {
        category: selectedPart?.part?.category ?? '',
        part: selectedPart?.part ?? '',
        quantity: selectedPart?.quantity ?? '',
        cost: selectedPart?.cost ?? '',
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} >
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
            >
                {({ setFieldValue, errors, touched, values }) => {
                    const isCategorySelected = !!values.category;
                    return (
                        <Form>
                            <h3>Editeaza Piesa</h3>
                            <div className="flex flex-col gap-4 mt-6">
                                <FormItem className="mb-0 flex-1" label="Category">
                                    <Field name={`category`}>
                                        {({ field, form }: FieldProps) => {
                                            const categoryOptions = modalData.partsCategories.map((category): any => ({
                                                label: category,
                                                value: category,
                                            }));

                                            const selectedCategoryOption = categoryOptions.find(
                                                (option) => option.value === values.category
                                            );

                                            return (
                                                <Select
                                                    {...field}
                                                    options={categoryOptions}
                                                    value={selectedCategoryOption}
                                                    onChange={async (option) => {
                                                        form.setFieldValue(field.name, option?.value);
                                                        form.setFieldValue(`part`, null); // Reset part when category changes

                                                        // Dynamically fetch parts for this specific index and category
                                                        const parts = await fetchParts(`category=${option?.value}`);
                                                        setModalData((prev) => ({
                                                            ...prev,
                                                            parts
                                                        }));
                                                    }}
                                                />
                                            );
                                        }}
                                    </Field>
                                </FormItem>
                                <FormItem className="mb-0 flex-1" label="Part">
                                    <Field name={`part`}>
                                        {({ field, form }: FieldProps) => {
                                            const partOptions = modalData.parts?.map((part: any) => ({
                                                ...part,
                                                label: part.name,
                                                value: part.id,
                                            })) || [];

                                            const selectedPartOption = partOptions.find(
                                                (option) => option.value == values.part.id
                                            );

                                            return (
                                                <Select
                                                    {...field}
                                                    options={partOptions}
                                                    value={selectedPartOption}
                                                    onChange={(option) => {
                                                        form.setFieldValue(field.name, option); // Store selected part
                                                    }}
                                                    isDisabled={!isCategorySelected} // Disable until category is chosen
                                                />
                                            );
                                        }}
                                    </Field>
                                </FormItem>
                                <FormItem className="mb-0 flex-1" label="Quantity">
                                    <Field name={`quantity`}>
                                        {({ field, form }: FieldProps) => {
                                            return (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    // min="1"
                                                    onChange={(e) => {
                                                        const quantity = Math.max(1, Number(e.target.value)); // Ensure quantity is at least 1
                                                        form.setFieldValue(field.name, quantity);
                                                        let totalMaterialCost = 0;
                                                        const partPrice = values.cost || 0;
                                                        const currentQuantity = values.quantity;
                                                        totalMaterialCost += partPrice * currentQuantity;
                                                        form.setFieldValue('materialCost', totalMaterialCost);
                                                    }}
                                                    disabled={!isCategorySelected} // Disable input until category is chosen
                                                />
                                            );
                                        }}
                                    </Field>
                                </FormItem>
                            </div>
                            <div className="flex justify-end mt-6">
                                <Button variant="plain" onClick={onClose}>
                                    Închide
                                </Button>
                                <Button variant="solid" type="submit">
                                    Salvează
                                </Button>
                            </div>
                        </Form>
                    )
                }}
            </Formik>
        </Dialog>
    )
}

export default ModalEditPart;