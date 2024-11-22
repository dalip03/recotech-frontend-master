import { Button, Checkbox, Dialog, FormItem, Input, Select } from "@/components/ui";
import { Field, FieldProps, Form, Formik } from "formik";
import { mockOptions } from "@/utils/mockPartData";
import data from "@/views/clients/details-sections/mock-email-data";

export default function NewModalParts({ isOpen, onClose, selectedPart }: any) {
    const onSubmit = (values: any) => {
        console.log(values);
    }

    console.log('sp', selectedPart);

    const initialValues = {
        name: selectedPart?.name ?? "",
        brand: selectedPart?.brand ?? "",
        model: selectedPart?.model ?? "",
        year: selectedPart?.year ?? "",
        body: selectedPart.body ?? "",
        fuel: selectedPart.fuel ?? "",
        engine: selectedPart.engine ?? "",
        kw: selectedPart.kw ?? "",
        engineCode: selectedPart.engineCode ?? "",
        quantity: selectedPart.quantity ?? "",
        quality: selectedPart.quality ?? "",
        color: selectedPart.color ?? "",
        provider: selectedPart.provider ?? "",
        location: selectedPart.location ?? "",
        shelf1: selectedPart.shelf1 ?? "",
        floor: selectedPart.floor ?? "",
        shelf2: selectedPart.shelf2 ?? "",
        po: selectedPart.po ?? "",
        internalDescription: selectedPart.internalDescription ?? "",
        externalDescription: selectedPart.externalDescription ?? "",
        code: selectedPart.code ?? "",
        code1: selectedPart.code1 ?? "",
        code2: selectedPart.code2 ?? "",
        code3: selectedPart.code3 ?? "",
        code4: selectedPart.code4 ?? "",
        isDisplayableAutovit: selectedPart.isDisplayableAutovit ?? false,
        isFromUk: selectedPart.isFromUk ?? false,
        isReconditioningNeeded: selectedPart.isReconditioningNeeded ?? false
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} className={"!w-11/12 !max-w-full !my-10"}>
            <div className="space-y-4 ">
                <h3>{selectedPart.name}, Cod Piesa: {selectedPart.code}</h3>
                <div className="max-h-[80svh] overflow-y-auto">
                    <Formik
                        initialValues={initialValues}
                        onSubmit={onSubmit}
                    >
                        {({ errors, touched, values }) => (
                            <Form>
                                {/* First Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-8 md:gap-3">
                                    <FormItem className="md:col-span-2 mb-2 md:mb-4" label="Piesa">
                                        <Field name="name">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Nume piesa..."
                                                    disabled
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 mb-2 md:mb-4 " label="Marca">
                                        <Field name="brand" className="text-black">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.brand, label: selectedPart.brand };
                                                return (
                                                    <Select
                                                        className="text-black"
                                                        {...field}
                                                        value={option}
                                                        options={[selectedPart.brand]} // Add options as needed
                                                        placeholder="Marca..."
                                                        isDisabled
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-2 mb-2 md:mb-4" label="Model">
                                        <Field name="model">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.model, label: selectedPart.model };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Modelul..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 mb-2 md:mb-4" label="An">
                                        <Field name="year">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.brand, label: selectedPart.brand };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Anul..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-2 mb-2 md:mb-4" label="Caroserie">
                                        <Field name="body">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.body, label: selectedPart.body };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Caroseria..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Second Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-6 md:gap-3">
                                    <FormItem className="md:col-span-1 mb-2 md:mb-4" label="Carburant">
                                        <Field name="fuel">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.fuel, label: selectedPart.fuel };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Carburant..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 mb-2 md:mb-4" label="Motorizare">
                                        <Field name="engine">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.engine, label: selectedPart.engine };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Motorizare..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />

                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 mb-2 md:mb-4" label="KW">
                                        <Field name="kw">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.kw, label: selectedPart.kw };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="KW..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-3 mb-2 md:mb-4" label="Cod Motor">
                                        <Field name="engineCode">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Cod motor..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Third Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-12 md:gap-3">
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Cant.">
                                        <Field name="quantity">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="number"
                                                    placeholder="Cant...."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Calitate">
                                        <Field name="quality">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.quality, label: selectedPart.quality };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Calitate..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-2 [&>label]:text-slate-600 mb-2 md:mb-4" label="Culoare">
                                        <Field name="color">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.color, label: selectedPart.color };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Culoare..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-2 [&>label]:text-slate-600 mb-2 md:mb-4" label="Furnizor">
                                        <Field name="provider">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.provider, label: selectedPart.provider };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Furnizor..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    {/* TODO ????????? */}
                                    <FormItem className="md:col-span-2 [&>label]:text-slate-600 mb-2 md:mb-4" label="Hala/Zona">
                                        <Field name="location">
                                            {({ field }: FieldProps) => {
                                                const option = { value: selectedPart.location, label: selectedPart.location };
                                                return (
                                                    <Select
                                                        {...field}
                                                        value={option}
                                                        options={[option]} // Add options as needed
                                                        placeholder="Hala/Zona..."
                                                        isDisabled 
                                                        className="text-black"
                                                    />
                                                )

                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Rastel">
                                        <Field name="shelf1">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Rastel..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Etaj">
                                        <Field name="floor">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Etaj..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Raft">
                                        <Field name="shelf2">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Raft..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="PO">
                                        <Field name="po">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="PO..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Other Inputs */}
                                <div className="grid grid-cols-1">
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="Observatii INTERNE">
                                        <Field name="internalDescription">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Observatii..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                <div className="grid grid-cols-1">
                                    <FormItem className="md:col-span-1 [&>label]:text-slate-600 mb-2 md:mb-4" label="OBSERVATII (Informatii PUBLICE)">
                                        <Field name="externalDescription">
                                            {({ field }: FieldProps) => (
                                                <Input
                                                    {...field}
                                                    textArea
                                                    placeholder="Observatii..."
                                                    disabled 
                                                    className="text-black"
                                                />
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Codes */}
                                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-3">
                                    <FormItem className="[&>label]:text-slate-600 mb-2 md:mb-4" label="Cod 1">
                                        <Field name="code1">
                                            {({ field }: FieldProps) => (
                                                <Input {...field} type="text" placeholder="Cod 1..." disabled className="text-black"/>
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="[&>label]:text-slate-600 mb-2 md:mb-4" label="Cod 2">
                                        <Field name="code2">
                                            {({ field }: FieldProps) => (
                                                <Input {...field} type="text" placeholder="Cod 2..." disabled className="text-black"/>
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="[&>label]:text-slate-600 mb-2 md:mb-4" label="Cod 3">
                                        <Field name="code3">
                                            {({ field }: FieldProps) => (
                                                <Input {...field} type="text" placeholder="Cod 3..." disabled className="text-black"/>
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="[&>label]:text-slate-600 mb-2 md:mb-4" label="Cod 4">
                                        <Field name="code4">
                                            {({ field }: FieldProps) => (
                                                <Input {...field} type="text" placeholder="Cod 4..." disabled className="text-black"/>
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Checkboxes */}
                                <div className="flex flex-col md:flex-row md:gap-3">
                                    <FormItem className="flex-1 mb-2 md:mb-4">
                                        <Field name="isDisplayableAutovit">
                                            {({ field, form }: FieldProps) => {
                                                return (
                                                    <Checkbox
                                                        {...field}
                                                        checked={field.value} // Set 'checked' for checkboxes
                                                        onChange={(value) => form.setFieldValue(field.name, value)}
                                                        className="text-slate-600 [&>span]:!opacity-100 [&>input]:!bg-gray-300"
                                                        disabled
                                                    >
                                                        Afiseaza pe AUTOVIT daca indeplineste conditiile
                                                    </Checkbox>
                                                )
                                            }}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="mb-2 md:mb-4">
                                        <Field name="isFromUk">
                                            {({ field, form }: FieldProps) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value} // Set 'checked' for checkboxes
                                                    onChange={(value) => form.setFieldValue(field.name, value)}
                                                    className="[&>span]:!opacity-100 [&>input]:!bg-gray-300"
                                                    disabled
                                                >
                                                    Masina UK
                                                </Checkbox>
                                            )}
                                        </Field>
                                    </FormItem>
                                    <FormItem className="mb-2 md:mb-4">
                                        <Field name="isReconditioningNeeded">
                                            {({ field, form }: FieldProps) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value} // Set 'checked' for checkboxes
                                                    onChange={(value) => form.setFieldValue(field.name, value)}
                                                    className="text-slate-600 [&>span]:!opacity-100 [&>input]:!bg-gray-300"
                                                    disabled
                                                >
                                                    Necesita Reconditionare
                                                </Checkbox>
                                            )}
                                        </Field>
                                    </FormItem>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex justify-end mt-6">
                                    <Button variant="plain" onClick={onClose}>
                                        Înapoi
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>

                </div>
            </div>
        </Dialog>
    )
}