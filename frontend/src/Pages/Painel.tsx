import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Painel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [valor, setValor] = useState<string>('0');
  const { userId } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/me/${userId}`);
        setUser(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, [userId]);

  useEffect(() => {
    const fetchSaldo = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:3000/saldo/${userId}`);
          setSaldo(response.data.saldo);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSaldo();
  }, [userId]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValor(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      if (user && user.contas.length > 0) {
        const contaId = user.contas[0].id;
        const response = await axios.post(
          `http://localhost:3000/contas/${contaId}/adicionar-saldo`,
          { valor: parseFloat(valor) }
        );
        setSaldo(response.data.saldo);
        setValor('0');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      <h1>Painel</h1>
      {user && <p>Olá, {user.nome}!</p>}
      <p>Saldo: R$ {saldo.toFixed(2)}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          value={valor}
          onChange={handleInputChange}
        />
        <button type="submit">Adicionar saldo</button>
      </form>
    </div>
  );
};

export default Painel;
