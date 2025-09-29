import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { MongoClient, ObjectId, Collection } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { authMiddleware, adminAuthMiddleware } from './middleware/auth.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI || !DB_NAME || !JWT_SECRET) {
    throw new Error('Variáveis de ambiente essenciais não foram definidas no arquivo .env');
}


interface User {
    _id?: ObjectId;
    nome: string;
    curso: string;
    periodo: string;
    contato: string;
    sala?: string;
    email: string;
    senha: string;
    createdAt: Date;
    role: 'user' | 'admin';
    status?: 'active' | 'inactive';
}

interface Anuncio {
    _id?: ObjectId;
    title: string;
    category: string;
    description: string;
    price: string;
    location: string;
    availableUntil: string;
    authorId: ObjectId;
    createdAt: Date;
    status: 'active' | 'sold' | 'expired';
}

const client = new MongoClient(MONGO_URI);
let usersCollection: Collection<User>;
let anunciosCollection: Collection<Anuncio>;

const startServer = async () => {
    try {
        await client.connect();
        console.log('✅ Conectado ao MongoDB com sucesso!');
        const db = client.db(DB_NAME);
        usersCollection = db.collection<User>('users');
        anunciosCollection = db.collection<Anuncio>('anuncios');
        app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
};


app.post('/register', async (req: Request, res: Response) => {
    try {
        const { nome, curso, periodo, contato, sala, email, senha } = req.body;
        if (!nome || !curso || !periodo || !contato || !email || !senha) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        if (!email.toLowerCase().endsWith('@fatec.sp.gov.br')) {
            return res.status(400).json({ error: 'Cadastro permitido apenas com e-mail institucional da FATEC.' });
        }
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }
        const senhaHash = await bcrypt.hash(senha, 10);
        const newUser: User = { nome, curso, periodo, contato, sala, email, senha: senhaHash, createdAt: new Date(), role: 'user', status: 'active' };
        await usersCollection.insertOne(newUser);
        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro no registro:', error)
        res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
    }
});

app.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
        if (!isPasswordCorrect) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: '8h' });
        res.status(200).json({
            message: 'Login bem-sucedido!',
            token,
            user: {
                id: user._id,
                email: user.email,
                nome: user.nome,
                curso: user.curso,
                periodo: user.periodo,
                contato: user.contato,
                sala: user.sala,
                role: user.role
            },
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro no login.' });
    }
});

app.patch('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
        const { nome, curso, periodo, contato, sala } = req.body;
        const camposParaAtualizar: Partial<User> = {};
        if (nome) camposParaAtualizar.nome = nome;
        if (curso) camposParaAtualizar.curso = curso;
        if (periodo) camposParaAtualizar.periodo = periodo;
        if (contato) camposParaAtualizar.contato = contato;
        if (sala) camposParaAtualizar.sala = sala;
        if (Object.keys(camposParaAtualizar).length === 0) return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
        const resultado = await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: camposParaAtualizar });
        if (resultado.matchedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        const usuarioAtualizado = await usersCollection.findOne({ _id: new ObjectId(userId) });
        if (!usuarioAtualizado) return res.status(404).json({ error: 'Usuário não encontrado.' });
        const userResponse = {
            id: usuarioAtualizado._id,
            email: usuarioAtualizado.email,
            nome: usuarioAtualizado.nome,
            curso: usuarioAtualizado.curso,
            periodo: usuarioAtualizado.periodo,
            contato: usuarioAtualizado.contato,
            sala: usuarioAtualizado.sala,
            role: usuarioAtualizado.role
        };
        res.status(200).json({ message: 'Perfil atualizado com sucesso!', user: userResponse });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

app.post('/ads', authMiddleware, async (req: Request, res: Response) => {
    try {
        const authorId = req.user?.id;
        if (!authorId) return res.status(401).json({ error: 'Usuário não autenticado.' });
        const { title, category, description, price, location, date } = req.body;
        if (!title || !category || !description || !price || !location || !date) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
        }
        const newAd: Anuncio = { title, category, description, price, location, availableUntil: date, authorId: new ObjectId(authorId), createdAt: new Date(), status: 'active' };
        const result = await anunciosCollection.insertOne(newAd);
        res.status(201).json({ message: 'Anúncio publicado com sucesso!', ad: { id: result.insertedId, ...newAd } });
    } catch (error) {
        console.error('Erro ao publicar anúncio:', error);
        res.status(500).json({ error: 'Erro ao publicar anúncio.' });
    }
});

app.get('/ads', async (req: Request, res: Response) => {
    try {

        const { search } = req.query;
        const filter: any = {};
        if (search) {
            filter['$or'] = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const pipeline = [
            { $match: filter },
            { $sort: { createdAt: -1 } },
            { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'authorDetails' } },
            { $unwind: '$authorDetails' },
            { $project: { 'authorDetails.senha': 0, 'authorDetails.createdAt': 0, 'authorId': 0 } }
        ];

        const ads = await anunciosCollection.aggregate(pipeline).toArray();
        res.status(200).json(ads);
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        res.status(500).json({ error: 'Erro ao buscar anúncios.' });
    }
});

app.get('/my-ads', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: 'Usuário não autenticado.' });
        const userAds = await anunciosCollection.find({ authorId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
        res.status(200).json(userAds);
    } catch (error) {
        console.error('Erro ao buscar meus anúncios:', error);
        res.status(500).json({ error: 'Erro ao buscar meus anúncios.' });
    }
});

app.put('/ads/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID do anúncio inválido.' });
        const adToUpdate = await anunciosCollection.findOne({ _id: new ObjectId(id) });
        if (!adToUpdate) return res.status(404).json({ error: 'Anúncio não encontrado.' });
        

        if (adToUpdate.authorId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para editar este anúncio.' });
        }

        const { title, description, price, date, location } = req.body;
        const camposParaAtualizar: Partial<Anuncio> = {};
        if (title) camposParaAtualizar.title = title;
        if (description) camposParaAtualizar.description = description;
        if (price) camposParaAtualizar.price = price;
        if (date) camposParaAtualizar.availableUntil = date;
        if (location) camposParaAtualizar.location = location;
        if (Object.keys(camposParaAtualizar).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
        }
        await anunciosCollection.updateOne({ _id: new ObjectId(id) }, { $set: camposParaAtualizar });
        const adAtualizado = await anunciosCollection.findOne({ _id: new ObjectId(id) });
        res.status(200).json(adAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar anúncio:', error);
        res.status(500).json({ error: 'Erro ao atualizar anúncio.' });
    }
});

app.delete('/ads/:id', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID do anúncio inválido.' });
        const adToDelete = await anunciosCollection.findOne({ _id: new ObjectId(id) });
        if (!adToDelete) return res.status(404).json({ error: 'Anúncio não encontrado.' });

        if (adToDelete.authorId.toString() !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para excluir este anúncio.' });
        }

        await anunciosCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ message: 'Anúncio excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir anúncio:', error);
        res.status(500).json({ error: 'Erro ao excluir anúncio.' });
    }
});

app.get('/admin/users',
    authMiddleware,
    adminAuthMiddleware,
    async (req: Request, res: Response) => {
        try {
            const users = await usersCollection.find({}, { projection: { senha: 0 } }).toArray();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar todos os usuários.' });
        }
    }
);

app.delete('/admin/users/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID de usuário inválido.' });

        const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });
        
        res.status(200).json({ message: 'Usuário deletado com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});


app.patch('/admin/users/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'ID de usuário inválido.' });

        const { nome, curso, periodo, contato, sala, role, status } = req.body;
        const camposParaAtualizar: Partial<User> = {};
        if (nome) camposParaAtualizar.nome = nome;
        if (curso) camposParaAtualizar.curso = curso;
        if (periodo) camposParaAtualizar.periodo = periodo;
        if (contato) camposParaAtualizar.contato = contato;
        if (sala) camposParaAtualizar.sala = sala;
        if (role) camposParaAtualizar.role = role;
        if (status) camposParaAtualizar.status = status;

        if (Object.keys(camposParaAtualizar).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo fornecido para atualização.' });
        }

        const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: camposParaAtualizar });
        if (result.matchedCount === 0) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const usuarioAtualizado = await usersCollection.findOne({ _id: new ObjectId(id) }, { projection: { senha: 0 } });
        res.status(200).json({ message: 'Usuário atualizado com sucesso!', user: usuarioAtualizado });

    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário.' });
    }
});

startServer();