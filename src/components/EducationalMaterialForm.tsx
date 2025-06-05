import React, { useState, useEffect } from 'react';
import type {
    EducationalMaterialRequestDto,
    TextBlockDto,
    TestDto,
    QuestionDto,
    AnswerOptionDto,
} from '../api';

import { Form, Button, Row, Col, Card, Accordion } from 'react-bootstrap';

type LocalTextBlock = TextBlockDto & { tempId: string };
type LocalAnswerOption = AnswerOptionDto & { tempId: string };
type LocalQuestion = Omit<QuestionDto, 'answerOptions'> & { tempId: string; answerOptions: LocalAnswerOption[] };
type LocalTest = Omit<TestDto, 'questions'> & { tempId?: string; questions: LocalQuestion[] };

interface EducationalMaterialFormProps {
    initialData?: Partial<EducationalMaterialRequestDto>;
    onSubmit: (data: EducationalMaterialRequestDto) => void;
    onCancel: () => void;
    isSubmitting: boolean;
    mode: 'create' | 'edit';
}

const EducationalMaterialForm: React.FC<EducationalMaterialFormProps> = ({
                                                                             initialData,
                                                                             onSubmit,
                                                                             onCancel,
                                                                             isSubmitting,
                                                                             mode,
                                                                         }) => {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [textBlocks, setTextBlocks] = useState<LocalTextBlock[]>([]);
    const [test, setTest] = useState<LocalTest | null>(null);

    useEffect(() => {
        setTitle(initialData?.title || '');
        setTopic(initialData?.topic || '');
        setTextBlocks(
            initialData?.textBlocks?.map((tb, i) => ({
                ...tb,
                tempId: `tb-${i}-${Date.now()}`,
            })) || [{ tempId: `tb-0-${Date.now()}`, title: '', content: '' }]
        );
        if (initialData?.test) {
            const newTest: LocalTest = {
                questions: initialData.test.questions.map((q, qi) => ({
                    ...q,
                    tempId: `q-${qi}-${Date.now()}`,
                    answerOptions: q.answerOptions.map((ao, ai) => ({
                        ...ao,
                        tempId: `ao-${qi}-${ai}-${Date.now()}`,
                    })),
                })),
            };
            setTest(newTest);
        } else {
            setTest(null);
        }
    }, [initialData]);

    const addTextBlock = () => setTextBlocks([...textBlocks, { tempId: `tb-${textBlocks.length}-${Date.now()}`, title: '', content: '' }]);
    const removeTextBlock = (tempId: string) => setTextBlocks(textBlocks.filter(tb => tb.tempId !== tempId));
    const handleTextBlockChange = (tempId: string, field: 'title' | 'content', value: string) => {
        setTextBlocks(prev => prev.map(tb => tb.tempId === tempId ? { ...tb, [field]: value } : tb));
    };

    const toggleTest = () => setTest(test ? null : { questions: [{ tempId: `q-0-${Date.now()}`, text: '', answerOptions: [{ tempId: `ao-0-0-${Date.now()}`, text: '', isCorrect: true }] }] });
    const addQuestion = () => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: [...prevTest!.questions, { tempId: `q-${prevTest!.questions.length}-${Date.now()}`, text: '', answerOptions: [{ tempId: `ao-${prevTest!.questions.length}-0-${Date.now()}`, text: '', isCorrect: true }] }],
        }));
    };
    const removeQuestion = (qTempId: string) => {
        if (!test) return;
        setTest(prevTest => ({ ...prevTest!, questions: prevTest!.questions.filter(q => q.tempId !== qTempId) }));
    };
    const handleQuestionTextChange = (qTempId: string, value: string) => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: prevTest!.questions.map(q => q.tempId === qTempId ? { ...q, text: value } : q),
        }));
    };

    const addAnswerOption = (qTempId: string) => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: prevTest!.questions.map(q => {
                if (q.tempId === qTempId) {
                    return { ...q, answerOptions: [...q.answerOptions, { tempId: `ao-${q.tempId}-${q.answerOptions.length}-${Date.now()}`, text: '', isCorrect: q.answerOptions.length === 0 }] };
                }
                return q;
            }),
        }));
    };
    const removeAnswerOption = (qTempId: string, aoTempId: string) => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: prevTest!.questions.map(q => {
                if (q.tempId === qTempId) {
                    return { ...q, answerOptions: q.answerOptions.filter(ao => ao.tempId !== aoTempId) };
                }
                return q;
            }),
        }));
    };
    const setCorrectAnswer = (qTempId: string, aoTempIdToSetCorrect: string) => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: prevTest!.questions.map(q => {
                if (q.tempId === qTempId) {
                    const newAnswerOptions = q.answerOptions.map(ao => ({
                        ...ao,
                        isCorrect: ao.tempId === aoTempIdToSetCorrect,
                    }));
                    return { ...q, answerOptions: newAnswerOptions };
                }
                return q;
            }),
        }));
    };
    const handleAnswerOptionTextChange = (qTempId: string, aoTempId: string, value: string) => {
        if (!test) return;
        setTest(prevTest => ({
            ...prevTest!,
            questions: prevTest!.questions.map(q =>
                q.tempId === qTempId
                    ? {
                        ...q,
                        answerOptions: q.answerOptions.map(ao =>
                            ao.tempId === aoTempId ? { ...ao, text: value } : ao
                        ),
                    }
                    : q
            ),
        }));
    };


    const internalHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (test) {
            for (const q of test.questions) {
                if (q.answerOptions.length > 0 && !q.answerOptions.some(ao => ao.isCorrect)) {
                    alert(`Please mark a correct answer for question: "${q.text || `Question ${test.questions.indexOf(q) + 1}`}"`);
                    return;
                }
                if (q.answerOptions.length === 1) {
                    alert(`Question "${q.text || `Question ${test.questions.indexOf(q) + 1}`}" must have at least two answer options or no options if there is no question text.`);
                    return;
                }
            }
        }

        const requestDto: EducationalMaterialRequestDto = {
            title,
            topic,
            textBlocks: textBlocks.map(({ tempId, ...tb }) => tb),
            test: test ? {
                questions: test.questions.map(({ tempId, answerOptions, ...q }) => ({
                    ...q,
                    answerOptions: answerOptions.map(({ tempId: aoTempId, ...ao }) => ao),
                })),
            } : undefined,
        };
        onSubmit(requestDto);
    };

    return (
        <Form onSubmit={internalHandleSubmit}>
            <Form.Group as={Row} className="mb-3" controlId="formMaterialTitle">
                <Form.Label column sm="2">Title</Form.Label>
                <Col sm="10"><Form.Control type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} /></Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="formMaterialTopic">
                <Form.Label column sm="2">Topic</Form.Label>
                <Col sm="10"><Form.Control type="text" value={topic} onChange={e => setTopic(e.target.value)} required disabled={isSubmitting} /></Col>
            </Form.Group>

            <h5 className="mt-4">Text Blocks</h5>
            {textBlocks.map((tb, index) => (
                <Card key={tb.tempId} className="mb-3">
                    <Card.Header>
                        Text Block {index + 1}
                        <Button variant="outline-danger" size="sm" onClick={() => removeTextBlock(tb.tempId)} className="float-end" disabled={isSubmitting || textBlocks.length <=1}>Remove</Button>
                    </Card.Header>
                    <Card.Body>
                        <Form.Group className="mb-2">
                            <Form.Label>Block Title (Optional)</Form.Label>
                            <Form.Control type="text" value={tb.title} onChange={e => handleTextBlockChange(tb.tempId, 'title', e.target.value)} disabled={isSubmitting} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Content</Form.Label>
                            <Form.Control as="textarea" rows={3} value={tb.content} onChange={e => handleTextBlockChange(tb.tempId, 'content', e.target.value)} required disabled={isSubmitting}/>
                        </Form.Group>
                    </Card.Body>
                </Card>
            ))}
            <Button variant="outline-success" onClick={addTextBlock} className="mb-3" disabled={isSubmitting}>Add Text Block</Button>

            <h5 className="mt-4">Test</h5>
            <Form.Check type="switch" id="toggle-test-switch" label="Include Test" checked={!!test} onChange={toggleTest} className="mb-3" disabled={isSubmitting}/>

            {test && (
                <Accordion defaultActiveKey={test.questions.length > 0 ? test.questions[0].tempId : undefined } alwaysOpen>
                    {test.questions.map((q, qIndex) => (
                        <Accordion.Item eventKey={q.tempId} key={q.tempId}>
                            <Accordion.Header>
                                Question {qIndex + 1}: {q.text.substring(0,30) || `(New Question)`}{q.text.length > 30 ? "..." : ""}
                                <a onClick={(e) => {e.stopPropagation(); removeQuestion(q.tempId);}} className="ms-auto text-danger" disabled={isSubmitting}>Remove Question</a>
                            </Accordion.Header>
                            <Accordion.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Question Text</Form.Label>
                                    <Form.Control as="textarea" value={q.text} onChange={e => handleQuestionTextChange(q.tempId, e.target.value)} required={q.answerOptions.length > 0} disabled={isSubmitting}/>
                                </Form.Group>
                                <h6>Answer Options (Mark one as correct)</h6>
                                {q.answerOptions.map((ao, aoIndex) => (
                                    <Card key={ao.tempId} className="mb-2">
                                        <Card.Body className="p-2">
                                            <Row className="align-items-center">
                                                <Col xs={8} md={9}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder={`Option ${aoIndex + 1}`}
                                                        value={ao.text}
                                                        onChange={e => handleAnswerOptionTextChange(q.tempId, ao.tempId, e.target.value)}
                                                        required
                                                        disabled={isSubmitting}
                                                    />
                                                </Col>
                                                <Col xs="auto" className="d-flex align-items-center">
                                                    <Form.Check
                                                        type="radio"
                                                        name={`correctAnswer-${q.tempId}`}
                                                        id={`correct-${q.tempId}-${ao.tempId}`}
                                                        checked={ao.isCorrect}
                                                        onChange={() => setCorrectAnswer(q.tempId, ao.tempId)}
                                                        disabled={isSubmitting}
                                                        aria-label={`Mark option ${aoIndex + 1} as correct`}
                                                    />
                                                </Col>
                                                <Col xs="auto" className="d-flex align-items-center">
                                                    <Button variant="outline-danger" size="sm" onClick={() => removeAnswerOption(q.tempId, ao.tempId)} disabled={isSubmitting || q.answerOptions.length <= 1}>X</Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                                <Button variant="outline-info" size="sm" onClick={() => addAnswerOption(q.tempId)} disabled={isSubmitting}>Add Answer Option</Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            )}
            {test && <Button variant="outline-primary" onClick={addQuestion} className="mt-2 mb-3" disabled={isSubmitting}>Add Question</Button>}

            <hr />
            <div className="d-flex justify-content-end mt-3">
                <Button variant="secondary" onClick={onCancel} className="me-2" disabled={isSubmitting}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Create Material')}
                </Button>
            </div>
        </Form>
    );
};

export default EducationalMaterialForm;