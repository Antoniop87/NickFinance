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
            saldo: saldo || 0
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
      res.status(200).json({ message: 'Login bem-sucedido!', id: user.id });
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

app.get('/me/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter usuário.' });
  }
});

app.get('/saldo', async (req, res) => {
  const { userId } = req.query;

  try {
    const conta = await prisma.conta.findUnique({
      where: { userId: parseInt(userId as string) },
    });

    if (conta) {
      res.json({ saldo: conta.saldo });
    } else {
      res.json({ saldo: 0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter saldo.' });
  }
});

app.put('/saldo/:userId', async (req, res) => {
  const { userId } = req.params;
  const { saldo } = req.body;

  try {
    const existingConta = await prisma.conta.findFirst({
      where: { userId: parseInt(userId) },
    });

    if (!existingConta) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const updatedSaldo = existingConta.saldo + parseInt(saldo);

    const updatedConta = await prisma.conta.update({
      where: { userId: parseInt(userId) },
      data: { saldo: updatedSaldo },
    });

    res.json(updatedConta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar saldo.' });
  }
});

app.put('/saldo/:userId', async (req, res) => {
  const { userId } = req.params;
  const { saldo } = req.body;

  try {
    const existingConta = await prisma.conta.findFirst({
      where: { userId: parseInt(userId) },
    });

    if (!existingConta) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const updatedSaldo = existingConta.saldo - parseInt(saldo);

    if (updatedSaldo < 0) {
      return res.status(400).json({ error: 'Saldo insuficiente para a retirada.' });
    }

    const updatedConta = await prisma.conta.update({
      where: { userId: parseInt(userId) },
      data: { saldo: updatedSaldo },
    });

    res.json(updatedConta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar saldo.' });
  }
});

app.put('/saldo/:userId', async (req, res) => {
  const { userId } = req.params;
  const { saldo, descricao } = req.body;

  try {
    const existingConta = await prisma.conta.findFirst({
      where: { userId: parseInt(userId) },
    });

    if (!existingConta) {
      return res.status(404).json({ error: 'Conta não encontrada.' });
    }

    const updatedSaldo = existingConta.saldo + parseInt(saldo);

    const updatedConta = await prisma.conta.update({
      where: { userId: parseInt(userId) },
      data: { saldo: updatedSaldo },
    });

    const transacao = await prisma.transacao.create({
      data: {
        descricao: descricao,
        valor: parseFloat(saldo),
        userId: parseInt(userId),
        contaId: existingConta.id,
      },
    });

    res.json(updatedConta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar saldo.' });
  }
});


app.get('/transacoes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const transacao = await prisma.transacao.findUnique({
      where: { id: parseInt(id) },
    });

    if (transacao) {
      res.json({ descricao: transacao.descricao });
    } else {
      res.status(404).json({ error: 'Transação não encontrada.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter transação.' });
  }
});




app.get('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
