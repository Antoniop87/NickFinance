import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosError } from 'axios';

interface UserData {
  nome: string;
  email: string;
  senha: string;
}

const Register: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    nome: '',
    email: '',
    senha: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post<UserData>('http://localhost:3000/users', userData);
      setSuccessMessage('Registro realizado com sucesso!');
      setErrorMessage('');
      console.log(response.data);
    } catch (error) {
        setErrorMessage('Email já cadastrado!');
    }
  };

  return (
    <div>
      <h1>Registro de Usuário</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={userData.nome}
          onChange={handleChange}
        />
        <br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={userData.email}
          onChange={handleChange}
        />
        <br />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          value={userData.senha}
          onChange={handleChange}
        />
        <br />
        <button type="submit">Registrar</button>
      </form>

      {errorMessage && <p>{errorMessage}</p>}
      {successMessage && <p>{successMessage}</p>}
    </div>
  );
};

export default Register;
