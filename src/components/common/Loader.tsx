import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center my-5">
            <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">{message}</p>
        </div>
    );
};

export default Loader;