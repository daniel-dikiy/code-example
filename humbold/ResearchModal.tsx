import axios from 'axios';
import Modal from '@/ts/Components/Modal';
import InputLabel from '@/ts/Components/InputLabel';
import SubmitButton from '@/ts/Components/SubmitButton';
import FieldLayout from '@/ts/Layouts/Components/FieldLayout';
import { router } from '@inertiajs/react';
import { getClasses, getPlaceholder } from '@/ts/Components/FieldFunctions';
import { Field, Form, Formik, FormikProps } from 'formik';
import { useEffect, useRef, useState } from 'react';
import { IResearchModal } from '@/ts/types/components/research-modal';
import { ResearchModalSchema } from '@/ts/schemas/ResearchModalSchema';
import { IYearList } from '@/ts/types/lists';
import { getAllYearsByProject } from '@/ts/Components/Requests';
import { formatNumber } from '@/ts/Components/StringFunctions';

const ResearchModal = ({ show, onClose, setShowResearchFinishModal, currentIdRow, type, setShowFromSubRow, showFromSubRow }: IResearchModal) => {
    const formikRef = useRef<FormikProps<any>>();
    const [loading, setLoading] = useState<boolean>(true);
    const [years, setYears] = useState<Array<IYearList>>([]);
    const [flz_value, setFlzValue] = useState<string>('-');

    const initializeYears = async () => {
        setYears(await getAllYearsByProject(currentIdRow) ?? []);
    };

    const planns = [
        {
            id: 1,
            name: 'Ja'
        },
        {
            id: 2,
            name: 'Nein'
        }
    ];

    const getValues = async () => {
        try {
            const request = await axios.request({
                url: `/api/dashboard/research/${currentIdRow}`,
                method: 'get',
            });

            if (request.data) {
                formikRef.current?.setFieldValue('planned', request.data.planned);
                formikRef.current?.setFieldValue('max_payment', request.data.max_payment);
                formikRef.current?.setFieldValue('solution', request.data.solution);
                formikRef.current?.setFieldValue('year_id', request.data.year_id);
                formikRef.current?.setFieldValue('project_id', request.data.project_id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    const handleSubmit = async (values: Object) => {
        try {
            setLoading(true);
            let url = '';
            let method = '';

            if (type === 'create') {
                url = '/api/dashboard/research';
                method = 'post';
            } else if (type === 'edit') {
                url = `/api/dashboard/research/${currentIdRow}`;
                method = 'put';
            }

            url && method && await axios.request({
                url: url,
                method: method,
                data: values
            });

            router.reload();
            onClose();
            showFromSubRow ? setShowFromSubRow(false) : setShowResearchFinishModal(true);
        } catch (error: any) {
            if (error.response?.status === 422 && formikRef.current) {
                for (let key in error.response.data.errors) {
                    const value = error.response.data.errors[key];
                    formikRef.current.setFieldError(key, value.length ? value[0] : 'Error');
                }
            } else {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        show && currentIdRow && initializeYears();
    }, [show, currentIdRow])

    useEffect(() => {
        if (years && formikRef.current?.values?.year_id) {
            const flz = years.find(el => el.id === Number(formikRef.current.values.year_id))?.flz;
            flz && setFlzValue(flz.value);
        }
    }, [years, formikRef.current]);

    useEffect(() => {
        years.length && type === 'edit'
            ? getValues()
            : setTimeout(() => {
                setLoading(false);
            }, 1000);
    }, [years, type]);

    return (
        <Formik
            innerRef={formikRef as any}
            validationSchema={ResearchModalSchema}
            initialValues={{
                planned: '',
                max_payment: '',
                solution: '',
                year_id: '',
                project_id: currentIdRow
            }}
            onSubmit={(values: Object) => handleSubmit(values)}
        >
            {({ isSubmitting, touched, errors, setFieldValue }
                : { isSubmitting: boolean, touched: any, errors: any, setFieldValue: any }) => (
                <Modal
                    show={show}
                    onClose={onClose}
                    maxWidth='3xl'
                    title='Forschungszulage 5'
                    titleClassname='text-2xl font-bold'
                    loading={loading}
                >
                    <Form>
                        <table className='w-full'>
                            <tbody>
                                <tr>
                                    <td className='w-1/3'>
                                        <InputLabel htmlFor='planned'>
                                            Sind für das Jahr des Projektendes schon Auszahlungen geplant?
                                            <span className='text-red-500'>*</span>
                                        </InputLabel>
                                    </td>
                                    <td className='w-2/3'>
                                        <FieldLayout>
                                            <Field
                                                id='planned'
                                                name='planned'
                                                as='select'
                                                className={getClasses({
                                                    error: errors.planned,
                                                    touch: touched.planned,
                                                })}
                                            >
                                                <option disabled value=''>
                                                    {getPlaceholder({
                                                        error: errors.planned,
                                                        touch: touched.planned,
                                                        placeholder: 'Bitte wählen'
                                                    })}
                                                </option>
                                                {
                                                    planns.map((obj, key) => {
                                                        return <option key={key} value={obj.id}>{obj.name}</option>;
                                                    })
                                                }
                                            </Field>
                                        </FieldLayout>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='w-1/3'>
                                        <InputLabel htmlFor='year_id'>
                                            Jahr
                                            <span className='text-red-500'>*</span>
                                        </InputLabel>
                                    </td>
                                    <td className='w-2/3'>
                                        <FieldLayout>
                                            <Field
                                                id='year_id'
                                                name='year_id'
                                                as='select'
                                                className={getClasses({
                                                    error: errors.year_id,
                                                    touch: touched.year_id,
                                                })}
                                                onChange={(event: { target: { value: string; }; }) => {
                                                    const value = event.target.value;
                                                    const flz = years.find(el => el.id === Number(value))?.flz;
                                                    flz && setFlzValue(flz.value);
                                                    setFieldValue('year_id', value);
                                                }}
                                            >
                                                <option disabled value=''>
                                                    {getPlaceholder({
                                                        error: errors.year_id,
                                                        touch: touched.year_id,
                                                        placeholder: 'Bitte wählen'
                                                    })}
                                                </option>
                                                {
                                                    years.map((obj, key) => {
                                                        return <option key={key} value={obj.id}>{obj.name}</option>;
                                                    })
                                                }
                                            </Field>
                                        </FieldLayout>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='w-1/3'>
                                        <InputLabel htmlFor='year_id'>
                                            FLZ Wert
                                        </InputLabel>
                                    </td>
                                    <td className='w-2/3'>
                                        {formatNumber(flz_value)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className='w-1/3'>
                                        <InputLabel htmlFor='max_payment'>
                                            Höhe der erwarteten Auszahlung im Jahr des Projektendes in EUR
                                            <span className='text-red-500'>*</span>
                                        </InputLabel>
                                    </td>
                                    <td className='w-2/3'>
                                        <FieldLayout>
                                            <Field
                                                id='max_payment'
                                                name='max_payment'
                                                type='text'
                                                className={getClasses({
                                                    error: errors.max_payment,
                                                    touch: touched.max_payment,
                                                })}
                                                placeholder={getPlaceholder({
                                                    error: errors.max_payment,
                                                    touch: touched.max_payment,
                                                    placeholder: 'Bitte eingeben'
                                                })}
                                                onChange={(event: { target: { value: string; }; }) => {
                                                    const value = event.target.value;
                                                    setFieldValue('max_payment', value.replace(',', '.'));
                                                }}
                                            />
                                        </FieldLayout>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='w-1/3'>
                                        <InputLabel htmlFor='solution'>
                                            Gewünschte Forschungszulage für dieses Projekt
                                            <span className='text-red-500'>*</span>
                                        </InputLabel>
                                    </td>
                                    <td className='w-2/3'>
                                        <FieldLayout>
                                            <Field
                                                id='solution'
                                                name='solution'
                                                type='text'
                                                className={getClasses({
                                                    error: errors.solution,
                                                    touch: touched.solution,
                                                })}
                                                placeholder={getPlaceholder({
                                                    error: errors.solution,
                                                    touch: touched.solution,
                                                    placeholder: 'Bitte eingeben'
                                                })}
                                                onChange={(event: { target: { value: string; }; }) => {
                                                    const value = event.target.value;
                                                    setFieldValue('solution', value.replace(',', '.'));
                                                }}
                                            />
                                        </FieldLayout>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <SubmitButton
                            isSubmitting={isSubmitting}
                            type={type}
                            title='Forschungszulage speichern'
                        />

                    </Form>
                </Modal>
            )}
        </Formik>
    );
};

export default ResearchModal;