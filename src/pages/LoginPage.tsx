import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginUser, type LoginRequestDto } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data);
            navigate('/materials');
        },
        onError: (error: any) => {
            console.error("Login failed:", error);
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const credentials: LoginRequestDto = { username, password };
        mutation.mutate(credentials);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Login</h2>
                    {mutation.isError && (
                        <Alert variant="danger">
                            { (mutation.error as any)?.response?.data?.message || (mutation.error as Error)?.message || "Login failed. Please check your credentials."}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                disabled={mutation.isPending}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={mutation.isPending}
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Logging in...' : 'Login'}
                        </Button>
                    </Form>
                    <div className="mt-3 text-center">
                        Don't have an account? <Link to="/register">Register here</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default LoginPage;