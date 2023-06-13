import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/users', async (req, res) => {
  const { nome, email, senha, saldo } = req.body;

  try {
    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha,
        contas: {
          create: {
            saldo: saldo || 0 // Define o saldo como o valor fornecido ou 0 caso não seja especificado
          }
        }
      },
      include: {
        contas: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (user && user.senha === senha) {
      res.status(200).json({ message: 'Login bem-sucedido!' });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
  
    try {
      const updatedUser = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          nome,
          email,
          senha,
        },
      });
  
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
  });
  

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
