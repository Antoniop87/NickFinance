import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const Painel: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [valorAdicionar, setValorAdicionar] = useState<string>('');
  const [valorSubtrair, setValorSubtrair] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [transacoes, setTransacoes] = useState<string[]>([]);

  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${userId}`);
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
          const response = await axios.get(`http://localhost:3000/saldo?userId=${userId}`);
          setSaldo(response.data.saldo);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchSaldo();
  }, [userId]);

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:3000/transacoes/${userId}`);
          console.log(response.data); 
          setTransacoes(response.data.map((transacao: any) => transacao.descricao));
        }
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchTransacoes();
  }, [userId]);
  
  

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'adicionar') {
      setValorAdicionar(e.target.value);
    } else if (e.target.name === 'subtrair') {
      setValorSubtrair(e.target.value);
    } else if (e.target.name === 'descricao') {
      setDescricao(e.target.value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (user && user.id) {
        const response = await axios.put(
          `http://localhost:3000/saldo/${userId}`,
          {
            saldo: parseFloat(valorAdicionar),
            descricao: descricao,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setSaldo(parseFloat(response.data.saldo));
        setValorAdicionar('');
        setDescricao('');
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRetirada = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (user && user.id) {
        const response = await axios.put(
          `http://localhost:3000/saldo/${userId}`,
          {
            saldo: -parseFloat(valorSubtrair),
            descricao: descricao,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setSaldo(parseFloat(response.data.saldo));
        setValorSubtrair('');
        setDescricao('');
      }
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Painel</h1>
      {user && <p>Olá, {user.nome}!</p>}
      <p>Saldo: R$ {saldo.toFixed(2)}</p>

      <div>
        <h2>Transações</h2>
        <ul>
          {transacoes.map((transacao, index) => (
            <li key={index}>{transacao}</li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          name="adicionar"
          value={valorAdicionar}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="descricao"
          value={descricao}
          onChange={handleInputChange}
          placeholder="Descrição da transação"
        />
        <button type="submit">Adicionar</button>
      </form>

      <form onSubmit={handleRetirada}>
        <input
          type="number"
          step="0.01"
          name="subtrair"
          value={valorSubtrair}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="descricao"
          value={descricao}
          onChange={handleInputChange}
          placeholder="Descrição da transação"
        />
        <button type="submit">Retirar</button>
      </form>
    </div>
  );
};

export default Painel;
