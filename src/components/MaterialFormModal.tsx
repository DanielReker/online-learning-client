import React from 'react';
import { Modal } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchMaterialById,
    createMaterial,
    updateMaterial,
    type EducationalMaterialRequestDto,
    type EducationalMaterialResponseDto,
    type AnswerOptionDto
} from '../api';
import EducationalMaterialForm from './EducationalMaterialForm';
import Loader from './common/Loader';
import ErrorMessage from './common/ErrorMessage';

interface MaterialFormModalProps {
    show: boolean;
    onHide: () => void;
    materialIdToEdit?: number | string | null;
}

const mapResponseToInitialFormData = (
    responseDto: EducationalMaterialResponseDto
): {
    test: { questions: { text: string; answerOptions: { text: string; isCorrect: boolean }[] }[] } | undefined;
    topic: string;
    title: string;
    textBlocks: { title: string | undefined; content: string }[]
} => {
    return {
        title: responseDto.title,
        topic: responseDto.topic,
        textBlocks: responseDto.textBlocks.map(tb => ({
            title: tb.title,
            content: tb.content,
        })),
        test: responseDto.test ? {
            questions: responseDto.test.questions.map(q => ({
                text: q.text,
                answerOptions: q.answerOptions.map(ao => ({
                    text: ao.text,
                    isCorrect: (ao as AnswerOptionDto).isCorrect || false,
                })),
            })),
        } : undefined,
    };
};


const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ show, onHide, materialIdToEdit }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!materialIdToEdit;

    const {
        data: materialDataForEdit,
        isLoading: isLoadingEditData,
        isError: isErrorLoadingEditData,
        error: errorLoadingEditData,
    } = useQuery({
        queryKey: ['materialToEdit', materialIdToEdit],
        queryFn: () => (materialIdToEdit ? fetchMaterialById(materialIdToEdit) : Promise.resolve(null)),
        enabled: isEditMode,
    });

    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            if (isEditMode && materialIdToEdit) {
                queryClient.invalidateQueries({ queryKey: ['material', materialIdToEdit] });
                queryClient.invalidateQueries({ queryKey: ['materialToEdit', materialIdToEdit] });
            }
            onHide();
        },
    };

    const createMutation = useMutation({ mutationFn: createMaterial, ...mutationOptions });
    const updateMutation = useMutation({
        mutationFn: (payload: { id: number | string; material: EducationalMaterialRequestDto }) =>
            updateMaterial(payload.id, payload.material),
        ...mutationOptions,
    });

    const handleFormSubmit = (data: EducationalMaterialRequestDto) => {
        if (isEditMode && materialIdToEdit) {
            updateMutation.mutate({ id: materialIdToEdit, material: data });
        } else {
            createMutation.mutate(data);
        }
    };

    const initialFormData = isEditMode && materialDataForEdit
        ? mapResponseToInitialFormData(materialDataForEdit)
        : undefined;

    const isLoading = createMutation.isPending || updateMutation.isPending;
    const mutationError = createMutation.error || updateMutation.error;

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={!isLoading}>
            <Modal.Header closeButton={!isLoading}>
                <Modal.Title>{isEditMode ? 'Edit' : 'Create'} Educational Material</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isEditMode && isLoadingEditData && <Loader message="Loading material data..." />}
                {isEditMode && isErrorLoadingEditData && (
                    <ErrorMessage message={(errorLoadingEditData as Error)?.message || 'Failed to load material for editing.'} />
                )}
                {(!isEditMode || (isEditMode && materialDataForEdit && !isLoadingEditData)) && (
                    <EducationalMaterialForm
                        key={materialIdToEdit || 'create'}
                        initialData={initialFormData}
                        onSubmit={handleFormSubmit}
                        onCancel={onHide}
                        isSubmitting={isLoading}
                        mode={isEditMode ? 'edit' : 'create'}
                    />
                )}
                {mutationError && (
                    <div className="mt-3">
                        <ErrorMessage message={(mutationError as any)?.response?.data?.message || (mutationError as Error)?.message || 'An error occurred during submission.'} />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default MaterialFormModal;