import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import type {EducationalMaterialListItemDto} from '../api';
import { useAuth } from '../contexts/AuthContext';

interface MaterialCardProps {
    material: EducationalMaterialListItemDto;
    onEdit: (materialId: number) => void;
    onDelete: (materialId: number) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onEdit, onDelete }) => {
    const { authUser } = useAuth();

    const canEdit = authUser && (authUser.role === 'ROLE_ADMIN' || authUser.username === material.authorUsername);
    const canDelete = authUser && (authUser.role === 'ROLE_ADMIN' || authUser.username === material.authorUsername);

    return (
        <Card className="mb-3 h-100">
            <Card.Body className="d-flex flex-column">
                <Card.Title>{material.title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">Topic: {material.topic}</Card.Subtitle>
                <Card.Text>
                    <small>Author: {material.authorUsername}</small><br/>
                    <small>Reading Time: {material.readingTimeMinutes || 'N/A'} min</small><br/>
                </Card.Text>
                <div className="mt-auto">
                    <Link to={`/materials/${material.id}`} className="btn btn-outline-primary me-2">View Details</Link>
                    {canEdit && (
                        <Button variant="outline-secondary" onClick={() => onEdit(material.id)} className="me-2">
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button variant="outline-danger" onClick={() => onDelete(material.id)}>
                            Delete
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default MaterialCard;