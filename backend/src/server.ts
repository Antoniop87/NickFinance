import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.transacao.deleteMany({
      where: { userId: parseInt(id) },
    });

    await prisma.conta.delete({
      where: { userId: parseInt(id) },
    });

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Usuário e suas transações relacionadas foram excluídos com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao excluir usuário e suas transações relacionadas.' });
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

    let operacaoDescricao = '';
    if (parseFloat(saldo) > 0) {
      operacaoDescricao = 'Adição de saldo';
    } else if (parseFloat(saldo) < 0) {
      operacaoDescricao = 'Retirada de saldo';
    }

    const descricaoTransacao = `${operacaoDescricao} - ${Math.abs(parseFloat(saldo))}`;

    const transacao = await prisma.transacao.create({
      data: {
        descricao: descricaoTransacao,
        valor: parseFloat(saldo),
        userId: parseInt(userId),
        contaId: existingConta.id,
      },
    });

    res.json({ saldo: updatedConta.saldo, descricaoTransacao });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar saldo.' });
  }
});

app.get('/transacoes/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const transacoes = await prisma.transacao.findMany({
      where: { userId: userId },
    });

    res.json(transacoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter transações.' });
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
