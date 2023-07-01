import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

interface LoginData {
  email: string;
  senha: string;
}

const Login: React.FC = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    senha: ''
  });

  const navigate = useNavigate();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/login', loginData);
      const userId = response.data.id;
      console.log(response.data);
      console.log('login realizado');

      // Redirecionar para a página de Painel após o login bem-sucedido
      navigate(`/Painel/${userId}`);
    } catch (error) {
      console.log(error);
      setErrorMessage('Credenciais inválidas!');
    }
  };

  return (
    <div className="bg-blue-500 h-screen flex flex-col">
      <div className="flex flex-col justify-center items-center flex-grow">
        <h1 className='text-white text-4xl font-semibold'>Login</h1>
        <div className="flex flex-col items-center justify-center bg-white w-96 m-2 h-80 rounded-sm">
          <form onSubmit={handleSubmit} className='flex flex-col'>
            <label className="mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleChange}
              className="mb-4 p-2 bg-gray-200 w-80"
            />
            <label className="mb-2">Senha</label>
            <input
              type="password"
              name="senha"
              placeholder="Senha"
              value={loginData.senha}
              onChange={handleChange}
              className="mb-4 p-2 bg-gray-200 w-80"
            />
            <button type="submit" className="mt-4 bg-blue-500 p-2 text-white hover:bg-blue-400 rounded-sm">Entrar</button>
          </form>
          {errorMessage && <p className='mt-6 text-red-500 font-semibold'>{errorMessage}</p>}
        </div>
        <h2 className='m-4 text-lg'>Não possui conta? Crie uma clicando <Link className='inline text-white font-semibold' to={'/Register'}>aqui</Link> </h2>
      </div>
    </div>
  );
};

export default Login;
