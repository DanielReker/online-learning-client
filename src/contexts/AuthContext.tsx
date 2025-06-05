import {createContext, useState, useContext, useEffect, type ReactNode} from 'react';
import {logoutUser, type TokenResponseDto} from '../api';
import { jwtDecode } from "jwt-decode";
import { type JwtPayload } from 'jwt-decode';

interface AuthUser {
    username: string;
    role: string;
}

interface DecodedToken extends JwtPayload {
}


interface AuthContextType {
    authUser: AuthUser | null;
    isLoading: boolean;
    login: (tokenResponse: TokenResponseDto) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decodedToken = jwtDecode<DecodedToken>(token);

                const storedUsername = localStorage.getItem('username');
                const storedRole = localStorage.getItem('userRole');

                if (storedUsername && storedRole && decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
                    setAuthUser({ username: storedUsername, role: storedRole });
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('username');
                    localStorage.removeItem('userRole');
                }
            } catch (error) {
                console.error("Error decoding token on initial load:", error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                localStorage.removeItem('userRole');
            }
        }
        setIsLoading(false);
    }, []);


    const login = (tokenResponse: TokenResponseDto) => {
        const user: AuthUser = {
            username: tokenResponse.username,
            role: tokenResponse.role,
        };
        setAuthUser(user);
        localStorage.setItem('accessToken', tokenResponse.accessToken);
        localStorage.setItem('refreshToken', tokenResponse.refreshToken);
        localStorage.setItem('username', user.username);
        localStorage.setItem('userRole', user.role);
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        setAuthUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        try {
            if (refreshToken) {
                await logoutUser({ refreshToken });
            }
        } catch (error) {
            console.error("Error during server logout: ", error);
        }
    };

    if (isLoading) {
        return <div>Loading application...</div>;
    }

    return (
        <AuthContext.Provider value={{ authUser, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};