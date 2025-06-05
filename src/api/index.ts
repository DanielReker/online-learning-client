import axiosInstance from '../config/axiosConfig';


export interface ErrorResponseDto {
    timestamp?: string;
    status?: number;
    error?: string;
    message?: string;
    path?: string;
    validationErrors?: Record<string, string>;
}

export interface AnswerOptionDto {
    text: string;
    isCorrect: boolean;
}

export interface QuestionDto {
    text: string;
    answerOptions: AnswerOptionDto[];
}

export interface TestDto {
    title: string;
    questions: QuestionDto[];
}

export interface TextBlockDto {
    title?: string;
    content: string;
}

export interface EducationalMaterialRequestDto {
    title: string;
    topic: string;
    textBlocks: TextBlockDto[];
    test?: TestDto;
}

export interface UserAnswerDto {
    questionId: number;
    selectedAnswerOptionId: number;
}

export interface TestSubmissionRequestDto {
    answers: UserAnswerDto[];
}

export interface RegistrationRequestDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequestDto {
    username: string;
    password: string;
}

export interface TokenRefreshRequestDto {
    refreshToken: string;
}

export interface AnswerOptionResponseDto {
    id: number;
    text: string;
}

export interface QuestionResponseDto {
    id: number;
    text: string;
    answerOptions: AnswerOptionResponseDto[];
    questionOrder?: number;
}

export interface TestResponseDto {
    id: number;
    title: string;
    questions: QuestionResponseDto[];
}

export interface TextBlockResponseDto {
    id: number;
    title?: string;
    content: string;
}

export interface EducationalMaterialResponseDto {
    id: number;
    title: string;
    topic: string;
    readingTimeMinutes?: number;
    authorUsername: string;
    textBlocks: TextBlockResponseDto[];
    test?: TestResponseDto;
    createdAt: string;
    updatedAt: string;
}

export interface TestResultDto {
    materialId: number;
    scorePercentage: number;
    totalQuestions: number;
    correctAnswersCount: number;
}

export interface TokenResponseDto {
    accessToken: string;
    refreshToken: string;
    username: string;
    role: string;
    expiresIn: number;
}

export interface Pageable {
    page?: number;
    size?: number;
    sort?: string[];
}

export interface SortObject {
    empty?: boolean;
    sorted?: boolean;
    unsorted?: boolean;
}

export interface PageableObject {
    offset?: number;
    sort?: SortObject;
    pageNumber?: number;
    pageSize?: number;
    paged?: boolean;
    unpaged?: boolean;
}

export interface Page<T> {
    content: T[];
    pageable: PageableObject;
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: SortObject;
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}

export interface EducationalMaterialListItemDto {
    id: number;
    title: string;
    topic: string;
    readingTimeMinutes?: number;
    authorUsername: string;
    createdAt: string;
}


export const fetchMaterials = async (params?: {
                                         page?: number;
                                         size?: number;
                                         sort?: string;
                                         topic?: string;
                                         minReadingTimeMinutes?: number;
                                         maxReadingTimeMinutes?: number;
                                         hasTest?: boolean;
                                         authorUsername?: string;
                                     }
): Promise<Page<EducationalMaterialListItemDto>> => {
    const response = await axiosInstance.get<Page<EducationalMaterialListItemDto>>('/educational-materials', { params });
    return response.data;
};

export const fetchMaterialById = async (id: number | string): Promise<EducationalMaterialResponseDto> => {
    const response = await axiosInstance.get<EducationalMaterialResponseDto>(`/educational-materials/${id}`);
    return response.data;
};

export const createMaterial = async (material: EducationalMaterialRequestDto): Promise<EducationalMaterialResponseDto> => {
    const response = await axiosInstance.post<EducationalMaterialResponseDto>('/educational-materials', material);
    return response.data;
};

export const updateMaterial = async (id: number | string, material: EducationalMaterialRequestDto): Promise<EducationalMaterialResponseDto> => {
    const response = await axiosInstance.put<EducationalMaterialResponseDto>(`/educational-materials/${id}`, material);
    return response.data;
};

export const deleteMaterial = async (id: number | string): Promise<void> => {
    await axiosInstance.delete(`/educational-materials/${id}`);
};

export const submitTest = async (materialId: number | string, submission: TestSubmissionRequestDto): Promise<TestResultDto> => {
    const response = await axiosInstance.post<TestResultDto>(`/educational-materials/${materialId}/test/submit`, submission);
    return response.data;
};


export const registerUser = async (userData: RegistrationRequestDto): Promise<any> => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials: LoginRequestDto): Promise<TokenResponseDto> => {
    const response = await axiosInstance.post<TokenResponseDto>('/auth/login', credentials);
    return response.data;
};

export const refreshToken = async (tokenData: TokenRefreshRequestDto): Promise<TokenResponseDto> => {
    const response = await axiosInstance.post<TokenResponseDto>('/auth/refresh', tokenData);
    return response.data;
};

export const logoutUser = async (tokenData?: TokenRefreshRequestDto): Promise<any> => {
    const response = await axiosInstance.post('/auth/logout', tokenData);
    return response.data;
};

export const logoutUserEverywhere = async (): Promise<any> => {
    const response = await axiosInstance.post('/auth/logout-everywhere');
    return response.data;
};