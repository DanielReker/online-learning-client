import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMaterialById, type TextBlockResponseDto } from '../api';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import {Container, Card, Row, Col, Breadcrumb, Button} from 'react-bootstrap';
import TestPlayer from '../components/TestPlayer';
import { useAuth } from '../contexts/AuthContext';

const MaterialDetailPage: React.FC = () => {
    const { materialId } = useParams<{ materialId: string }>();
    const { authUser } = useAuth();

    const { data: material, isLoading, isError, error } = useQuery({
        queryKey: ['material', materialId],
        queryFn: () => materialId ? fetchMaterialById(materialId) : Promise.reject(new Error("No material ID")),
        enabled: !!materialId,
    });

    if (isLoading) return <Loader message="Loading material details..." />;
    if (isError) return <ErrorMessage message={(error as Error)?.message || 'Could not load material.'} />;
    if (!material) return <ErrorMessage message="Material not found." />;

    const canEdit = authUser && (authUser.role === 'ROLE_ADMIN' || authUser.username === material.authorUsername);

    return (
        <Container>
            <Breadcrumb className="mt-3">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/materials" }}>Materials</Breadcrumb.Item>
                <Breadcrumb.Item active>{material.title}</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="my-4">
                <Col>
                    <h1>{material.title}</h1>
                    <p className="text-muted">
                        Topic: {material.topic} | Author: {material.authorUsername} | Reading Time: {material.readingTimeMinutes || 'N/A'} min
                    </p>
                    {canEdit && <Button variant="outline-secondary" className="mb-3">Edit Material</Button>}
                </Col>
            </Row>

            {material.textBlocks && material.textBlocks.length > 0 && (
                <>
                    <h3 className="mt-4">Content</h3>
                    {material.textBlocks.map((block: TextBlockResponseDto, index: number) => (
                        <Card key={block.id || `tb-${index}`} className="mb-3">
                            {block.title && <Card.Header as="h5">{block.title}</Card.Header>}
                            <Card.Body>
                                {block.content.split('\n').map((paragraph, i) => (
                                    <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{paragraph}</p>
                                ))}
                            </Card.Body>
                        </Card>
                    ))}
                </>
            )}

            {material.test && material.test.questions && material.test.questions.length > 0 && (
                <TestPlayer testData={material.test} materialId={material.id} />
            )}

            {!material.textBlocks?.length && (!material.test || !material.test.questions?.length) && (
                <p>This material currently has no content or test.</p>
            )}

        </Container>
    );
};

export default MaterialDetailPage;