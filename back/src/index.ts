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
const BASE_URL = process.env.BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : `http://localhost:${PORT}`;

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
    favorites?: string[];
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
    ratings?: {
        userId: string;
        rating: number;
        comment?: string;
        createdAt: Date;
    }[];
    averageRating?: number;
    ratingCount?: number;
    // Promoções
    promotionActive?: boolean;
    promotionLabel?: string;
    promotionExpiresAt?: string;
    originalPrice?: string;
}

interface Report {
    _id?: ObjectId;
    adId: ObjectId;
    adTitle: string;
    reporterId: ObjectId;
    reporterName: string;
    reporterEmail: string;
    reason: string;
    description?: string;
    status: 'pending' | 'in_review' | 'resolved';
    createdAt: Date;
    updatedAt: Date;
    adminNotes?: string;
}

// Cache global de conexão MongoDB para serverless (Vercel)
let cachedClient: MongoClient | null = null;
let cachedDb: ReturnType<MongoClient['db']> | null = null;
let usersCollection: Collection<User>;
let anunciosCollection: Collection<Anuncio>;
let reportsCollection: Collection<Report>;

// Função helper para obter variáveis de ambiente com mensagem de erro clara
const getEnvVar = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente ${name} não foi definida. Configure no painel do Vercel (Settings > Environment Variables).`);
    }
    return value;
};

// Inicialização do banco de dados otimizada para serverless
const connectToDatabase = async () => {
    try {
        // Reutilizar conexão existente se disponível (cache para serverless)
        if (cachedClient && cachedDb) {
            return { 
                client: cachedClient, 
                db: cachedDb, 
                usersCollection, 
                anunciosCollection,
                reportsCollection
            };
        }

        const MONGODB_URI = getEnvVar('MONGO_URI');
        const DB_NAME = getEnvVar('DB_NAME');

        const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 0,
            maxIdleTimeMS: 30000,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        await client.connect();
        const db = client.db(DB_NAME);
        usersCollection = db.collection<User>('users');
        anunciosCollection = db.collection<Anuncio>('anuncios');
        reportsCollection = db.collection<Report>('reports');

        // Cache das conexões
        cachedClient = client;
        cachedDb = db;

        return { 
            client, 
            db, 
            usersCollection, 
            anunciosCollection,
            reportsCollection
        };
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        throw error;
    }
};

// Middleware para conectar ao banco antes de cada request (serverless-friendly)
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectToDatabase();
        next();
    } catch (error: any) {
        console.error('Erro no middleware de conexão:', error);
        res.status(500).json({ 
            error: error.message || 'Erro de conexão com o banco de dados',
            hint: 'Verifique se as variáveis de ambiente MONGODB_URI e DB_NAME estão configuradas no Vercel.'
        });
    }
});

app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});


app.post('/api/register', async (req: Request, res: Response) => {
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

app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
        const user = await usersCollection.findOne({ email });
        if (!user) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        const isPasswordCorrect = await bcrypt.compare(senha, user.senha);
        if (!isPasswordCorrect) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
        
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
        }
        
        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
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

app.patch('/api/profile', authMiddleware, async (req: Request, res: Response) => {
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

app.post('/api/ads', authMiddleware, async (req: Request, res: Response) => {
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

app.get('/api/ads', async (req: Request, res: Response) => {
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

app.get('/api/ads/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const pipeline = [
            { $match: { _id: new ObjectId(id) } },
            { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'authorDetails' } },
            { $unwind: '$authorDetails' },
            { $project: { 'authorDetails.senha': 0, 'authorDetails.createdAt': 0, 'authorId': 0 } }
        ];

        const ad = await anunciosCollection.aggregate(pipeline).toArray();
        
        if (ad.length === 0) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        res.status(200).json(ad[0]);
    } catch (error) {
        console.error('Erro ao buscar anúncio:', error);
        res.status(500).json({ error: 'Erro ao buscar anúncio.' });
    }
});

app.get('/api/my-ads', authMiddleware, async (req: Request, res: Response) => {
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

app.put('/api/ads/:id', authMiddleware, async (req: Request, res: Response) => {
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

app.delete('/api/ads/:id', authMiddleware, async (req: Request, res: Response) => {
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

app.get('/api/admin/users',
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

app.delete('/api/admin/users/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
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


app.patch('/api/admin/users/:id', authMiddleware, adminAuthMiddleware, async (req, res) => {
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

// Rotas de Favoritos
app.get('/api/user/favorites', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const favorites = user.favorites || [];
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar favoritos.' });
    }
});

app.post('/api/user/favorites/:adId', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { adId } = req.params;

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        // Verificar se o anúncio existe
        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        // Adicionar aos favoritos (sem duplicatas)
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { favorites: adId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Anúncio adicionado aos favoritos.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar favorito.' });
    }
});

app.delete('/api/user/favorites/:adId', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { adId } = req.params;

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { favorites: adId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        res.json({ message: 'Anúncio removido dos favoritos.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover favorito.' });
    }
});

// Rotas de Avaliações
app.post('/api/ads/:adId/ratings', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { adId } = req.params;
        const { rating, comment } = req.body;

        // Validações
        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5.' });
        }

        // Verificar se o anúncio existe
        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        // Não permitir avaliar próprio anúncio
        if (ad.authorId.toString() === userId) {
            return res.status(400).json({ error: 'Você não pode avaliar seu próprio anúncio.' });
        }

        const newRating = {
            userId,
            rating: Number(rating),
            comment: comment || '',
            createdAt: new Date()
        };

        // Remover avaliação anterior do mesmo usuário e adicionar nova
        await anunciosCollection.updateOne(
            { _id: new ObjectId(adId) },
            { $pull: { ratings: { userId } } }
        );

        const result = await anunciosCollection.updateOne(
            { _id: new ObjectId(adId) },
            { $push: { ratings: newRating } }
        );

        // Recalcular média e contagem de avaliações
        const updatedAd = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (updatedAd && updatedAd.ratings) {
            const totalRatings = updatedAd.ratings.length;
            const sumRatings = updatedAd.ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

            await anunciosCollection.updateOne(
                { _id: new ObjectId(adId) },
                { 
                    $set: { 
                        averageRating: Math.round(averageRating * 10) / 10,
                        ratingCount: totalRatings
                    }
                }
            );
        }

        res.json({ message: 'Avaliação adicionada com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao adicionar avaliação.' });
    }
});

app.get('/api/ads/:adId/ratings', async (req, res) => {
    try {
        const { adId } = req.params;

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        const ratings = ad.ratings || [];
        const averageRating = ad.averageRating || 0;
        const ratingCount = ad.ratingCount || 0;

        res.json({
            ratings,
            averageRating,
            ratingCount
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
});

app.get('/api/user/ratings', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Buscar todas as avaliações feitas pelo usuário
        const adsWithUserRatings = await anunciosCollection.find({
            'ratings.userId': userId
        }).toArray();

        const userRatings = adsWithUserRatings.map(ad => {
            const userRating = ad.ratings?.find(r => r.userId === userId);
            return {
                adId: ad._id,
                adTitle: ad.title,
                rating: userRating?.rating,
                comment: userRating?.comment,
                createdAt: userRating?.createdAt
            };
        });

        res.json(userRatings);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar suas avaliações.' });
    }
});

app.delete('/api/ads/:adId/ratings', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { adId } = req.params;

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const result = await anunciosCollection.updateOne(
            { _id: new ObjectId(adId) },
            { $pull: { ratings: { userId } } }
        );

        // Recalcular média e contagem de avaliações
        const updatedAd = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (updatedAd && updatedAd.ratings) {
            const totalRatings = updatedAd.ratings.length;
            const sumRatings = updatedAd.ratings.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

            await anunciosCollection.updateOne(
                { _id: new ObjectId(adId) },
                { 
                    $set: { 
                        averageRating: Math.round(averageRating * 10) / 10,
                        ratingCount: totalRatings
                    }
                }
            );
        }

        res.json({ message: 'Avaliação removida com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao remover avaliação.' });
    }
});

// Rotas de Denúncias
app.post('/api/ads/:adId/report', authMiddleware, async (req: any, res: Response) => {
    try {
        const reporterId = req.user.id;
        const { adId } = req.params;
        const { reason, description } = req.body;

        if (!reason || typeof reason !== 'string') {
            return res.status(400).json({ error: 'Motivo da denúncia é obrigatório.' });
        }

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        const reporter = await usersCollection.findOne({ _id: new ObjectId(reporterId) });
        if (!reporter) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const existingReport = await reportsCollection.findOne({
            adId: new ObjectId(adId),
            reporterId: new ObjectId(reporterId),
            status: { $in: ['pending', 'in_review'] }
        });

        if (existingReport) {
            return res.status(409).json({ error: 'Você já enviou uma denúncia em aberto para este anúncio.' });
        }

        const newReport: Report = {
            adId: new ObjectId(adId),
            adTitle: ad.title,
            reporterId: new ObjectId(reporterId),
            reporterName: reporter.nome,
            reporterEmail: reporter.email,
            reason,
            description: description || '',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await reportsCollection.insertOne(newReport);
        res.status(201).json({ message: 'Denúncia enviada com sucesso.', reportId: result.insertedId });
    } catch (error) {
        console.error('Erro ao registrar denúncia:', error);
        res.status(500).json({ error: 'Erro ao registrar denúncia.' });
    }
});

app.get('/api/admin/reports', authMiddleware, adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const reports = await reportsCollection
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        res.status(200).json(reports);
    } catch (error) {
        console.error('Erro ao buscar denúncias:', error);
        res.status(500).json({ error: 'Erro ao buscar denúncias.' });
    }
});

app.patch('/api/admin/reports/:reportId', authMiddleware, adminAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;
        const { status, adminNotes } = req.body as { status?: Report['status']; adminNotes?: string };

        if (!ObjectId.isValid(reportId)) {
            return res.status(400).json({ error: 'ID da denúncia inválido.' });
        }

        const updateFields: Partial<Report> = { updatedAt: new Date() };
        if (status) {
            if (!['pending', 'in_review', 'resolved'].includes(status)) {
                return res.status(400).json({ error: 'Status inválido.' });
            }
            updateFields.status = status;
        }
        if (typeof adminNotes === 'string') {
            updateFields.adminNotes = adminNotes;
        }

        const result = await reportsCollection.updateOne(
            { _id: new ObjectId(reportId) },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Denúncia não encontrada.' });
        }

        const updatedReport = await reportsCollection.findOne({ _id: new ObjectId(reportId) });
        res.status(200).json({ message: 'Denúncia atualizada com sucesso.', report: updatedReport });
    } catch (error) {
        console.error('Erro ao atualizar denúncia:', error);
        res.status(500).json({ error: 'Erro ao atualizar denúncia.' });
    }
});

// Rotas de Promoções de Anúncios (usuário dono do anúncio ou admin)
app.post('/api/ads/:adId/promotion', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { adId } = req.params;
        const { label, expiresAt } = req.body as { label?: string; expiresAt?: string };

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        // Permitir apenas para o dono do anúncio ou administradores
        if (ad.authorId.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Você não pode promover este anúncio.' });
        }

        const updateFields: Partial<Anuncio> = {
            promotionActive: true,
            promotionLabel: label && label.trim() !== '' ? label.trim() : 'Em promoção',
        };

        if (expiresAt) {
            const expiresDate = new Date(expiresAt);
            if (isNaN(expiresDate.getTime())) {
                return res.status(400).json({ error: 'Data de expiração inválida.' });
            }
            updateFields.promotionExpiresAt = expiresDate.toISOString();
        }

        // Se ainda não há preço original salvo, guarda o atual
        if (!ad.originalPrice) {
            updateFields.originalPrice = ad.price;
        }

        await anunciosCollection.updateOne(
            { _id: new ObjectId(adId) },
            { $set: updateFields }
        );

        const updatedAd = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        res.status(200).json(updatedAd);
    } catch (error) {
        console.error('Erro ao ativar promoção:', error);
        res.status(500).json({ error: 'Erro ao ativar promoção.' });
    }
});

app.delete('/api/ads/:adId/promotion', authMiddleware, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { adId } = req.params;

        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        if (ad.authorId.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Você não pode remover a promoção deste anúncio.' });
        }

        const updateFields: Partial<Anuncio> = {
            promotionActive: false,
            promotionLabel: undefined,
            promotionExpiresAt: undefined,
        };

        await anunciosCollection.updateOne(
            { _id: new ObjectId(adId) },
            { $set: updateFields }
        );

        const updatedAd = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        res.status(200).json(updatedAd);
    } catch (error) {
        console.error('Erro ao remover promoção:', error);
        res.status(500).json({ error: 'Erro ao remover promoção.' });
    }
});

// Rotas de Compartilhamento
app.get('/api/share/generate-link/:adId', async (req: Request, res: Response) => {
    try {
        const { adId } = req.params;
        
        if (!ObjectId.isValid(adId)) {
            return res.status(400).json({ error: 'ID de anúncio inválido.' });
        }

        const ad = await anunciosCollection.findOne({ _id: new ObjectId(adId) });
        if (!ad) {
            return res.status(404).json({ error: 'Anúncio não encontrado.' });
        }

        // Criar slug do título
        const slug = ad.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');

        const shareUrl = `${BASE_URL}/share/ad/${slug}-${adId}`;
        
        res.json({ 
            shareUrl,
            adTitle: ad.title,
            adPrice: ad.price 
        });
    } catch (error) {
        console.error('Erro ao gerar link de compartilhamento:', error);
        res.status(500).json({ error: 'Erro ao gerar link de compartilhamento.' });
    }
});

app.get('/share/ad/:slug', async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const adId = slug.split('-').pop(); // Pega o ID do final do slug
        
        if (!adId || !ObjectId.isValid(adId)) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Link Inválido - TecShop</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Link Inválido</h1>
                    <p>O link que você acessou não é válido.</p>
                    <a href="/">Voltar ao TecShop</a>
                </body>
                </html>
            `);
        }

        const pipeline = [
            { $match: { _id: new ObjectId(adId) } },
            { $lookup: { from: 'users', localField: 'authorId', foreignField: '_id', as: 'authorDetails' } },
            { $unwind: '$authorDetails' },
            { $project: { 'authorDetails.senha': 0, 'authorDetails.createdAt': 0, 'authorId': 0 } }
        ];

        const adResult = await anunciosCollection.aggregate(pipeline).toArray();
        
        if (adResult.length === 0) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Anúncio Não Encontrado - TecShop</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                        .error { color: #dc2626; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Anúncio Não Encontrado</h1>
                    <p>O anúncio que você está procurando não existe ou foi removido.</p>
                    <a href="/">Voltar ao TecShop</a>
                </body>
                </html>
            `);
        }

        const ad = adResult[0];
        const categoryImages: Record<string, string> = {
            'Comida': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
            'Serviço': 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
            'Livros/Materiais': 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
        };
        
        const imageUrl = ad.imageUrl && ad.imageUrl.trim() !== '' 
            ? ad.imageUrl 
            : (categoryImages[ad.category] || 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80');

        const formattedDate = new Date(ad.availableUntil).toLocaleDateString('pt-BR');
        const formattedTime = new Date(ad.availableUntil).toLocaleTimeString('pt-BR', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        // Retorna uma página HTML completa com meta tags para compartilhamento
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${ad.title} - TecShop</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="description" content="${ad.description}">
                
                <!-- Open Graph / Facebook -->
                <meta property="og:type" content="product">
                <meta property="og:url" content="${BASE_URL}/share/ad/${slug}">
                <meta property="og:title" content="${ad.title} - TecShop">
                <meta property="og:description" content="${ad.description}">
                <meta property="og:image" content="${imageUrl}">
                
                <!-- Twitter -->
                <meta property="twitter:card" content="summary_large_image">
                <meta property="twitter:url" content="${BASE_URL}/share/ad/${slug}">
                <meta property="twitter:title" content="${ad.title} - TecShop">
                <meta property="twitter:description" content="${ad.description}">
                <meta property="twitter:image" content="${imageUrl}">
                
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9fafb;
                    }
                    .container {
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    .image {
                        width: 100%;
                        height: 250px;
                        object-fit: cover;
                    }
                    .content {
                        padding: 24px;
                    }
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0 0 8px 0;
                        color: #18181b;
                    }
                    .price {
                        font-size: 20px;
                        font-weight: bold;
                        color: #ffa800;
                        margin-bottom: 16px;
                    }
                    .description {
                        margin-bottom: 16px;
                        color: #6b7280;
                    }
                    .info {
                        display: flex;
                        align-items: center;
                        margin-bottom: 8px;
                        color: #6b7280;
                        font-size: 14px;
                    }
                    .seller {
                        background: #f9fafb;
                        padding: 16px;
                        border-radius: 8px;
                        margin-top: 16px;
                    }
                    .seller-title {
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: #18181b;
                    }
                    .app-button {
                        display: inline-block;
                        background: #3b82f6;
                        color: white;
                        text-decoration: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        margin-top: 20px;
                        text-align: center;
                    }
                    .app-button:hover {
                        background: #2563eb;
                    }
                    @media (max-width: 480px) {
                        body { padding: 10px; }
                        .content { padding: 16px; }
                        .title { font-size: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img src="${imageUrl}" alt="${ad.title}" class="image">
                    <div class="content">
                        <h1 class="title">${ad.title}</h1>
                        <div class="price">${ad.price}</div>
                        <p class="description">${ad.description}</p>
                        
                        <div class="info">
                            📍 ${ad.location}
                        </div>
                        <div class="info">
                            🕒 Disponível até ${formattedDate} às ${formattedTime}
                        </div>
                        <div class="info">
                            📂 ${ad.category}
                        </div>
                        
                        <div class="seller">
                            <div class="seller-title">Vendedor</div>
                            <div><strong>${ad.authorDetails.nome}</strong></div>
                            <div>${ad.authorDetails.curso}</div>
                            <div>📧 ${ad.authorDetails.email}</div>
                            <div>📱 ${ad.authorDetails.contato}</div>
                        </div>
                        
                        <a href="tecshop://ad/${adId}" class="app-button">Abrir no App TecShop</a>
                    </div>
                </div>
                
                <script>
                    // Tentar abrir no app automaticamente
                    setTimeout(() => {
                        window.location = 'tecshop://ad/${adId}';
                    }, 2000);
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Erro ao exibir anúncio compartilhado:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erro - TecShop</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    .error { color: #dc2626; }
                </style>
            </head>
            <body>
                <h1 class="error">Erro Interno</h1>
                <p>Ocorreu um erro ao carregar o anúncio.</p>
                <a href="/">Voltar ao TecShop</a>
            </body>
            </html>
        `);
    }
});

// Iniciar servidor apenas para desenvolvimento local
// No Vercel, o app é exportado como serverless function
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const startServer = async () => {
        try {
            await connectToDatabase();
            app.listen(Number(PORT), '0.0.0.0', () => {
                console.log(`🚀 Servidor rodando na porta ${PORT}`);
                console.log(`🌐 URL base configurada: ${BASE_URL}`);
                console.log(`📱 Para acesso externo, use: ngrok http ${PORT}`);
            });
        } catch (error) {
            console.error('❌ Erro ao iniciar servidor:', error);
            process.exit(1);
        }
    };
    startServer();
}

// Exportar app para Vercel (serverless)
export default app;