import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMaterials, deleteMaterial, type EducationalMaterialListItemDto } from '../api';
import MaterialCard from '../components/MaterialCard';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { Container, Row, Col, Button, Form, Pagination } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import MaterialFormModal from "../components/MaterialFormModal.tsx";

const MaterialListPage: React.FC = () => {
    const { authUser } = useAuth();
    const queryClient = useQueryClient();

    const [showCreateEditModal, setShowCreateEditModal] = useState(false);
    const [editingMaterialId, setEditingMaterialId] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [topicFilter, setTopicFilter] = useState('');

    const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
        queryKey: ['materials', currentPage, topicFilter],
        queryFn: () => {
            const params: any = { page: currentPage, size: 6 };
            if (topicFilter) params.topic = topicFilter;
            return fetchMaterials(params);
        },
        placeholderData: (previousData) => previousData,
        staleTime: 1000 * 60,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMaterial,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['materials'] });
            alert('Material deleted successfully!');
        },
        onError: (err: any) => {
            alert(`Error deleting material: ${err.response?.data?.message || err.message}`);
        }
    });

    const handleDelete = (id: number) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingMaterialId(null);
        setShowCreateEditModal(true);
    };

    const handleOpenEditModal = (id: number) => {
        setEditingMaterialId(id);
        setShowCreateEditModal(true);
    };

    const handleModalClose = () => {
        setShowCreateEditModal(false);
        setEditingMaterialId(null); // Important to reset
    };

    const handleFilterSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
        e?.preventDefault();
        setCurrentPage(0);
    };

    if (isLoading) return <Loader message="Fetching materials..." />;
    if (isError) return <ErrorMessage message={(error as Error)?.message || 'Could not fetch materials.'} />;

    const materials = data?.content || [];
    const totalPages = data?.totalPages || 0;

    return (
        <Container fluid>
            <Row className="my-3 align-items-center">
                <Col md={8}>
                    <h1>Educational Materials</h1>
                </Col>
                <Col md={4} className="text-md-end">
                    {authUser && (
                        <Button variant="primary" onClick={handleOpenCreateModal}>
                            Create New Material
                        </Button>
                    )}
                </Col>
            </Row>

            <Form onSubmit={handleFilterSubmit} className="mb-4 p-3 border rounded">
                <Row className="g-3 align-items-end">
                    <Col md={5}>
                        <Form.Group controlId="topicFilter">
                            <Form.Label>Filter by Topic</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter topic (e.g., Java, React)"
                                value={topicFilter}
                                onChange={e => setTopicFilter(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>


            {materials.length === 0 && !isLoading ? (
                <p>No materials found.</p>
            ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                    {materials.map((material: EducationalMaterialListItemDto) => (
                        <Col key={material.id}>
                            <MaterialCard
                                material={material}
                                onEdit={() => handleOpenEditModal(material.id)}
                                onDelete={() => handleDelete(material.id)}
                            />
                        </Col>
                    ))}
                </Row>
            )}

            {totalPages > 1 && (
                <Pagination className="justify-content-center mt-4">
                    <Pagination.Prev onClick={() => setCurrentPage(old => Math.max(old - 1, 0))} disabled={currentPage === 0 || isPlaceholderData} />
                    {[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)} disabled={isPlaceholderData}>
                            {page + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={() => setCurrentPage(old => (data && !data.last ? old + 1 : old))} disabled={data?.last || isPlaceholderData} />
                </Pagination>
            )}

            {showCreateEditModal && ( // Conditionally render modal to ensure fresh state/fetch on open
                <MaterialFormModal
                    show={showCreateEditModal}
                    onHide={handleModalClose}
                    materialIdToEdit={editingMaterialId}
                />
            )}
        </Container>
    );
};

export default MaterialListPage;