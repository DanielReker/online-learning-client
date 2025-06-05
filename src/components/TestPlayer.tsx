import React, { useState } from 'react';
import {
    type TestResponseDto,
    type QuestionResponseDto,
    type AnswerOptionResponseDto,
    type TestResultDto,
    type TestSubmissionRequestDto,
    submitTest
} from '../api';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Form, Alert } from 'react-bootstrap';
import Loader from './common/Loader';
import ErrorMessage from "./common/ErrorMessage.tsx";

interface TestPlayerProps {
    testData: TestResponseDto;
    materialId: number | string;
}

type UserAnswersState = Record<string, number | string>;

const TestPlayer: React.FC<TestPlayerProps> = ({ testData, materialId }) => {
    const [userAnswers, setUserAnswers] = useState<UserAnswersState>({});
    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState<TestResultDto | null>(null);

    const mutation = useMutation({
        mutationFn: (submission: TestSubmissionRequestDto) => submitTest(materialId, submission),
        onSuccess: (data) => {
            setResult(data);
            setShowResults(true);
        },
        onError: (error: any) => {
            console.error("Error submitting test:", error);
            alert(`Failed to submit test: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleAnswerChange = (questionId: number, answerOptionId: number) => {
        setUserAnswers(prev => ({ ...prev, [questionId.toString()]: answerOptionId }));
    };

    const handleSubmitTest = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (Object.keys(userAnswers).length !== testData.questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }
        const submissionPayload: TestSubmissionRequestDto = {
            answers: Object.entries(userAnswers).map(([qId, aoId]) => ({
                questionId: parseInt(qId, 10),
                selectedAnswerOptionId: Number(aoId),
            })),
        };
        mutation.mutate(submissionPayload);
    };

    if (showResults && result) {
        return (
            <Card className="mt-4">
                <Card.Header as="h5">Test Results</Card.Header>
                <Card.Body>
                    <Alert variant="info">
                        Your score: <strong>{result.scorePercentage.toFixed(2)}%</strong>
                        <br />
                        ({result.correctAnswersCount} out of {result.totalQuestions} correct)
                    </Alert>
                    <Button variant="outline-secondary" onClick={() => {
                        setShowResults(false);
                        setUserAnswers({});
                        setResult(null);
                    }}>
                        Retake Test
                    </Button>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="mt-4">
            <Card.Header as="h5">Test: {testData.title || 'Knowledge Check'}</Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmitTest}>
                    {testData.questions.map((q: QuestionResponseDto, index: number) => (
                        <Card key={q.id || `q-${index}`} className="mb-3">
                            <Card.Body>
                                <Card.Title as="p">Q{q.questionOrder !== undefined ? q.questionOrder + 1 : index + 1}: {q.text}</Card.Title>
                                {q.answerOptions.map((ao: AnswerOptionResponseDto, aoIndex: number) => (
                                    <Form.Check
                                        key={ao.id || `ao-${aoIndex}`}
                                        type="radio"
                                        id={`q${q.id}-ao${ao.id}`}
                                        name={`question-${q.id}`}
                                        label={ao.text}
                                        value={ao.id}
                                        onChange={() => handleAnswerChange(q.id, ao.id)}
                                        checked={userAnswers[q.id.toString()] === ao.id}
                                        required
                                    />
                                ))}
                            </Card.Body>
                        </Card>
                    ))}
                    {mutation.isPending && <Loader message="Submitting test..." />}
                    {mutation.isError && <ErrorMessage message={(mutation.error as any)?.response?.data?.message || (mutation.error as Error)?.message || 'Failed to submit.'} />}
                    <Button type="submit" variant="success" disabled={mutation.isPending}>
                        Check Answers
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default TestPlayer;