import React from 'react';
import { Alert } from 'react-bootstrap';

const ErrorMessage: React.FC<{ message: string; variant?: string }> = ({ message, variant = "danger" }) => {
    if (!message) return null;
    return (
        <Alert variant={variant} className="my-3">
            {message}
        </Alert>
    );
};

export default ErrorMessage;