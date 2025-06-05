import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

const NotFoundPage: React.FC = () => {
    return (
        <Container className="text-center mt-5">
            <Row>
                <Col>
                    <h1>404 - Page Not Found</h1>
                    <p>Sorry, the page you are looking for does not exist.</p>
                    <Link to="/materials" className="btn btn-primary">Go to Materials</Link>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;