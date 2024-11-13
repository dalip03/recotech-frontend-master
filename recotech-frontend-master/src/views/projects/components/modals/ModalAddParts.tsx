import { fetchParts, fetchPartsCategories } from "@/api/partsService";
import { Button, Dialog, FormItem, Input, Select } from "@/components/ui";
import { useAppSelector } from "@/store";
import { hasAccess, UserRole } from "@/utils/sharedHelpers";
import { Field, FieldArray, FieldProps, Form, Formik } from "formik";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { HiMinus, HiPlus } from "react-icons/hi";

const ModalAddParts = ({ isOpen, onClose, onSubmit }: any) => {
    const [modalData, setModalData] = useState({
        partsCategories: [],
        parts: {},
    });

    const initialValues = {
        parts: [],
    }

    const user = useAppSelector((state) => state.auth.user);

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

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={1200}>
            <Formik
                initialValues={initialValues}
                onSubmit={(values) => onSubmit(values)}
            >
                {({ setFieldValue, errors, touched, values }) => (
                    <Form>
                        <h3>Adauga Piese</h3>
                        <FieldArray name="parts">
                            {({ remove, push }) => (
                                <div>
                                    {values.parts && values.parts.length > 0 ? (
                                        values.parts.map((part: any, index: any) => {
                                            const isCategorySelected = !!values.parts[index]?.category;

                                            return (
                                                <div key={index} className="flex flex-row items-center mb-4 gap-4">
                                                    {/* Cod Piesa */}
                                                    <FormItem className="mb-0 flex-1" label={t("Part Code")}>
                                                        <Field name={`parts[${index}].partCode`}>
                                                            {({ field }: FieldProps) => <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} type="text" />}
                                                        </Field>
                                                    </FormItem>

                                                    {/* Locatie */}
                                                    <FormItem className="mb-0 flex-1" label={t("Location")}>
                                                        <Field name={`parts[${index}].location`}>
                                                            {({ field }: FieldProps) => <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} type="text" />}
                                                        </Field>
                                                    </FormItem>

                                                    {/* Category Select */}
                                                    <FormItem className="mb-0 flex-1" label={t("Category")}>
                                                        <Field name={`parts[${index}].category`}>
                                                            {({ field, form }: FieldProps) => {
                                                                const categoryOptions = modalData.partsCategories.map((category: any) => ({
                                                                    label: category,
                                                                    value: category,
                                                                }));

                                                                const selectedCategoryOption = categoryOptions.find(
                                                                    (option: any) => option.value === values.parts[index]?.category
                                                                );

                                                                return (
                                                                    <Select
                                                                        {...field}
                                                                        options={categoryOptions}
                                                                        value={selectedCategoryOption}
                                                                        isDisabled={!hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])}
                                                                        onChange={async (option) => {
                                                                            form.setFieldValue(field.name, option?.value);
                                                                            form.setFieldValue(`parts[${index}].part`, null); // Reset part when category changes

                                                                            // Dynamically fetch parts for this specific index and category
                                                                            const parts = await fetchParts(`category=${option?.value}`);
                                                                            setModalData((prev: any) => ({
                                                                                ...prev,
                                                                                parts: {
                                                                                    ...prev.parts,
                                                                                    [index]: parts, // Update parts for this index only
                                                                                },
                                                                            }));
                                                                        }}
                                                                    />
                                                                );
                                                            }}
                                                        </Field>
                                                    </FormItem>

                                                    {/* Part Select */}
                                                    <FormItem className="mb-0 flex-1" label={t("Part")}>
                                                        <Field name={`parts[${index}].part`}>
                                                            {({ field, form }: FieldProps) => {
                                                                const partOptions =
                                                                    modalData.parts[index]?.map((part: any) => ({
                                                                        ...part,
                                                                        label: part.name,
                                                                        value: part.id,
                                                                    })) || [];

                                                                const selectedPartOption = partOptions.find(
                                                                    (option: any) => option.value == values.parts[index]?.part?.partId
                                                                );

                                                                return (
                                                                    <Select
                                                                        {...field}
                                                                        options={partOptions}
                                                                        value={selectedPartOption}
                                                                        onChange={(option) => {
                                                                            form.setFieldValue(field.name, option); // Store selected part

                                                                            // Set quantity to 1 and priceAdjustment to 0 when part is selected
                                                                            form.setFieldValue(`parts[${index}].quantity`, 1);
                                                                            form.setFieldValue(`parts[${index}].priceAdjustment`, 0);

                                                                            // Calculate the Pret Final (final price)
                                                                            const partPrice = option?.cost || 0;
                                                                            const finalCost = partPrice * 1; // Initially quantity is 1 and priceAdjustment is 0
                                                                            // form.setFieldValue(`parts[${index}].cost`, finalCost);

                                                                            // Update total materialCost immediately
                                                                            const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                return acc + (i === index ? finalCost : p.cost || 0);
                                                                            }, 0);
                                                                            form.setFieldValue('materialCost', updatedMaterialCost); // Update materialCost
                                                                            form.setFieldValue(`parts[${index}].partCode`, '1234,5678')
                                                                            form.setFieldValue(`parts[${index}].location`, 'Hala 1')
                                                                            form.setFieldValue(`parts[${index}].priceAdjustment`)
                                                                            form.setFieldValue(`parts[${index}].cost`, finalCost);
                                                                        }}
                                                                        isDisabled={!isCategorySelected || !hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])} // Disable until category is chosen
                                                                    />
                                                                );
                                                            }}
                                                        </Field>
                                                    </FormItem>

                                                    {/* Quantity Input */}
                                                    <FormItem className="mb-0 flex-1" label={t("Quantity")}>
                                                        <Field name={`parts[${index}].quantity`}>
                                                            {({ field, form }: FieldProps) => {
                                                                return (
                                                                    <Input
                                                                        {...field}
                                                                        type="number"
                                                                        onChange={(e) => {
                                                                            const quantity = Math.max(1, Number(e.target.value)); // Ensure quantity is at least 1
                                                                            form.setFieldValue(field.name, quantity); // Update quantity in the form

                                                                            // Get part price and price adjustment
                                                                            const partPrice = values.parts[index]?.part?.cost || 0;
                                                                            const priceAdjustment = values.parts[index].priceAdjustment || 0;

                                                                            // Calculate the new Pret Final
                                                                            const finalCost = (partPrice * quantity) + priceAdjustment;
                                                                            form.setFieldValue(`parts[${index}].cost`, finalCost); // Set new Pret Final

                                                                            // Update total materialCost immediately
                                                                            const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                return acc + (i === index ? finalCost : p.cost || 0);
                                                                            }, 0);
                                                                            form.setFieldValue('materialCost', updatedMaterialCost); // Update total materialCost
                                                                        }}
                                                                        disabled={!isCategorySelected || !hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR'])}
                                                                    />
                                                                );
                                                            }}
                                                        </Field>
                                                    </FormItem>

                                                    {/* Discount / Adaos */}
                                                    {hasAccess(user.authority as UserRole, ['ADMIN']) && (
                                                        <FormItem className="mb-0 flex-1" label={`${t("Discount")} / ${t("Addition")}`}>
                                                            <Field name={`parts[${index}].priceAdjustment`}>
                                                                {({ field, form }: FieldProps) => {
                                                                    return (
                                                                        <Input
                                                                            {...field}
                                                                            type="number"
                                                                            onChange={(e) => {
                                                                                const priceAdjustment = Number(e.target.value); // Get the price adjustment (can be negative or positive)
                                                                                form.setFieldValue(field.name, priceAdjustment); // Update priceAdjustment in the form

                                                                                // Get part price and quantity
                                                                                const partPrice = values.parts[index]?.part?.cost || 0;
                                                                                const quantity = values.parts[index]?.quantity || 1;

                                                                                // Calculate the new Pret Final
                                                                                const finalCost = (partPrice * quantity) + priceAdjustment;
                                                                                form.setFieldValue(`parts[${index}].cost`, finalCost); // Set new Pret Final

                                                                                // Update total materialCost immediately
                                                                                const updatedMaterialCost = values.parts.reduce((acc: number, p: any, i: number) => {
                                                                                    return acc + (i === index ? finalCost : p.cost || 0);
                                                                                }, 0);
                                                                                form.setFieldValue('materialCost', updatedMaterialCost); // Update total materialCost
                                                                            }}
                                                                            disabled={!isCategorySelected} // Disable input until category is chosen
                                                                        />
                                                                    );
                                                                }}
                                                            </Field>
                                                        </FormItem>

                                                    )}

                                                    {/* Pret Final */}
                                                    {hasAccess(user.authority as UserRole, ['ADMIN']) && (
                                                        <FormItem className="mb-0 flex-1" label={t("Final Price")}>
                                                            <Field name={`parts[${index}].cost`}>
                                                                {({ field }: FieldProps) => (
                                                                    <Input {...field} disabled={!hasAccess(user.authority as UserRole, ['ADMIN'])} type="number" readOnly />
                                                                )}
                                                            </Field>
                                                        </FormItem>
                                                    )}

                                                    {/* Remove Button */}
                                                    {hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                                                        <Button
                                                            className="mt-[1.7rem]"
                                                            size="xs"
                                                            shape="circle"
                                                            type='button'
                                                            icon={<HiMinus />}
                                                            onClick={() => {
                                                                // Update parts and modalData on removal
                                                                const updatedParts = [...values.parts];
                                                                updatedParts.splice(index, 1); // Remove the part at the current index

                                                                // Update modalData parts, shifting indices
                                                                setModalData((prev: any) => {
                                                                    const updatedModalParts = { ...prev.parts };

                                                                    // Remove part from modal data
                                                                    delete updatedModalParts[index]; // Remove the current index
                                                                    // Shift remaining parts
                                                                    Object.keys(updatedModalParts).forEach((key) => {
                                                                        const currentIndex = parseInt(key, 10);
                                                                        if (currentIndex > index) {
                                                                            updatedModalParts[currentIndex - 1] = updatedModalParts[currentIndex];
                                                                            delete updatedModalParts[currentIndex]; // Remove the old key
                                                                        }
                                                                    });

                                                                    return {
                                                                        ...prev,
                                                                        parts: updatedModalParts,
                                                                    };
                                                                });
                                                                let totalMaterialCost = 0;
                                                                setFieldValue('parts', updatedParts);

                                                                updatedParts.forEach((part, i) => {
                                                                    const partPrice = part.part.cost || 0;
                                                                    const currentQuantity = part.quantity || 1;
                                                                    totalMaterialCost += partPrice * currentQuantity;
                                                                });

                                                                setFieldValue('materialCost', totalMaterialCost)
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        null
                                    )}

                                    {/* Add Button */}
                                    {hasAccess(user.authority as UserRole, ['ADMIN', 'OPERATOR', 'VANZATOR']) && (
                                        <div className="flex justify-center mt-4">
                                            {/* Add new part row */}
                                            <Button
                                                size="xs"
                                                shape="circle"
                                                icon={<HiPlus />}
                                                type="button"
                                                onClick={() =>
                                                    push({
                                                        category: '',
                                                        part: null,
                                                        quantity: null,
                                                        partCode: '',
                                                        location: '',
                                                        priceAdjustment: 0,
                                                    })
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </FieldArray>
                        <div className="flex justify-end mt-6">
                            <Button variant="plain" onClick={onClose}>
                                Închide
                            </Button>
                            <Button variant="solid" type="submit">
                                Salvează
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Dialog>
    )
}

export default ModalAddParts;