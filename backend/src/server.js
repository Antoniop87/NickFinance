"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
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
    }
    catch (error) {
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
        }
        else {
            res.status(401).json({ error: 'Credenciais inválidas.' });
        }
    }
    catch (error) {
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
    }
    catch (error) {
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
        }
        else {
            res.status(404).json({ error: 'Usuário não encontrado.' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter usuário.' });
    }
});
app.get('/saldo/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const conta = await prisma.conta.findUnique({
            where: { userId: parseInt(userId) },
        });
        if (conta) {
            res.json({ saldo: conta.saldo });
        }
        else {
            res.json({ saldo: 0 });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter saldo.' });
    }
});
app.put('/contas/:contaId/saldo', async (req, res) => {
    const { contaId } = req.params;
    const { saldo } = req.body;
    try {
        const updatedConta = await prisma.conta.update({
            where: { id: parseInt(contaId) },
            data: { saldo: parseFloat(saldo) },
        });
        res.json({ saldo: updatedConta.saldo });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar saldo.' });
    }
});
app.post('/contas/:contaId/saldo', async (req, res) => {
    const { contaId } = req.params;
    const { valor } = req.body;
    try {
        const conta = await prisma.conta.findUnique({
            where: { id: parseInt(contaId) },
        });
        if (!conta) {
            return res.status(404).json({ error: 'Conta não encontrada' });
        }
        const novoSaldo = conta.saldo + parseFloat(valor);
        await prisma.conta.update({
            where: { id: parseInt(contaId) },
            data: { saldo: novoSaldo },
        });
        return res.status(200).json({ saldo: novoSaldo });
    }
    catch (error) {
        console.error('Ocorreu um erro ao adicionar saldo:', error);
        return res.status(500).json({ error: 'Erro ao adicionar saldo' });
    }
});
const port = 3000;
app.listen(port, () => {
    console.log(`Servidor iniciado na porta ${port}`);
});
