import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface LoginData {
    email: string,
    senha: string,
}

const Login: React.FC = () => {

    const [loginData, setLoginData] = useState<LoginData>({
        email: '',
        senha: ''
    })

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        })
    }

    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:3000/login', loginData)
            console.log(response.data);
            console.log("login realizado")
        } catch (error) {
            console.log(error);
            setErrorMessage('Credenciais invalidas!')
        }
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={loginData.email}
                    onChange={handleChange}
                />
                <br />
                <input
                    type="password"
                    name="senha"
                    placeholder="Senha"
                    value={loginData.senha}
                    onChange={handleChange}
                />
                <br />
                <button type="submit">Entrar</button>
            </form>

            {errorMessage && <p>{errorMessage}</p>}
        </div>
    );
}

export default Login;