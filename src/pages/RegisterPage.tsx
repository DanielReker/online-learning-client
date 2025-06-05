import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { registerUser, type RegistrationRequestDto } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            alert('Registration successful! Please login.');
            navigate('/login');
        },
        onError: (error: any) => {
            console.error("Registration failed:", error);
        }
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userData: RegistrationRequestDto = { username, email, password };
        mutation.mutate(userData);
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
            <Card style={{ width: '400px' }}>
                <Card.Body>
                    <h2 className="text-center mb-4">Register</h2>
                    {mutation.isError && (
                        <Alert variant="danger">
                            { (mutation.error as any)?.response?.data?.message || (mutation.error as Error)?.message || "Registration failed. Please try again."}
                        </Alert>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="usernameReg">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={mutation.isPending}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="emailReg">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={mutation.isPending}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="passwordReg">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={mutation.isPending}/>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Registering...' : 'Register'}
                        </Button>
                    </Form>
                    <div className="mt-3 text-center">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterPage;