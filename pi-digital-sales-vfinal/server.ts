import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Prevent Vercel from caching API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

const INITIAL_INITIATIVES = [
  {
    id: '1',
    title: 'Otimização de Funil de Checkout',
    team: 'CRO',
    category: 'Graduação',
    actionType: 'Otimização',
    conversionMachine: 'E-Commerce',
    touchpoint: 'Checkout',
    averageAudience: 150000,
    primaryIndicator: 'Inscrito > Aprovado/Pago',
    dependencies: ['Martech', 'Canais'],
    incrementalEnrollment: 1500,
    month: 'Abril',
    confidence: 'Alta',
    description: 'Redução de fricção no pagamento via PIX.',
    status: 'Em Execução',
    updates: [
      {
        id: 'u1',
        date: '2026-04-10',
        sentiment: 'No Prazo',
        comment: 'Mapeamento das telas concluído. Iniciando setup no Optimizely.'
      }
    ]
  },
  {
    id: '2',
    title: 'Campanha de Remarketing Q2',
    team: 'Performance',
    category: 'Pós',
    actionType: 'Otimização',
    conversionMachine: 'Todos',
    touchpoint: 'Landing Page',
    averageAudience: 80000,
    primaryIndicator: 'Sessão > Inscrito',
    dependencies: ['CRM', 'Mídia'],
    incrementalEnrollment: 850,
    month: 'Maio',
    confidence: 'Média',
    description: 'Foco em leads inativos dos últimos 6 meses.',
    status: 'Planejado',
    updates: []
  },
  {
    id: '3',
    title: 'SEO para Landing Pages de Cursos',
    team: 'Canais Digitais',
    category: 'Graduação',
    actionType: 'Estruturante',
    conversionMachine: 'E-Commerce',
    touchpoint: 'Página de Produto',
    averageAudience: 200000,
    primaryIndicator: 'Sessão > Inscrito',
    dependencies: ['SEO/Inbound'],
    incrementalEnrollment: 1200,
    month: 'Junho',
    confidence: 'Baixa',
    description: 'Melhoria de ranking orgânico para termos de alta conversão.',
    status: 'Planejado',
    updates: []
  },
  {
    id: '4',
    title: 'Dashboard de Atribuição Avançada',
    team: 'Data Insights',
    category: 'Graduação',
    actionType: 'Estruturante',
    conversionMachine: 'App',
    touchpoint: 'Outros',
    averageAudience: 0,
    primaryIndicator: 'Aprovado > Matriculado',
    dependencies: ['DataInsights', 'Martech'],
    incrementalEnrollment: 450,
    month: 'Abril',
    confidence: 'Alta',
    description: 'Melhoria na visibilidade de canais assistidos.',
    status: 'Concluído',
    updates: [
      {
        id: 'u2',
        date: '2026-04-05',
        sentiment: 'No Prazo',
        comment: 'Dados integrados com sucesso no BigQuery.'
      },
      {
        id: 'u3',
        date: '2026-04-20',
        sentiment: 'No Prazo',
        comment: 'Dashboard publicado e validado com os stakeholders.'
      }
    ]
  },
  {
    id: '5',
    title: 'Personalização de Home por Perfil',
    team: 'CRO',
    category: 'Pós',
    actionType: 'Otimização',
    conversionMachine: 'Chatbot',
    touchpoint: 'Home',
    averageAudience: 50000,
    primaryIndicator: 'Sessão > Inscrito',
    dependencies: ['Martech'],
    incrementalEnrollment: 600,
    month: 'Maio',
    confidence: 'Média',
    description: 'Exibição de banners dinâmicos baseados no histórico de navegação.',
    status: 'Atrasado',
    updates: [
      {
        id: 'u4',
        date: '2026-05-02',
        sentiment: 'Atrasado',
        comment: 'Atraso na liberação das tags pelo time de engenharia.'
      }
    ]
  }
];

// Initialize Google Sheets
let doc: GoogleSpreadsheet | null = null;

async function initGoogleSheets() {
  if (doc) return doc;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!email || !privateKey || !sheetId) {
    console.warn("Google Sheets credentials not fully configured.");
    return null;
  }

  try {
    const serviceAccountAuth = new JWT({
      email: email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
    await doc.loadInfo();
    console.log(`Connected to Google Sheet: ${doc.title}`);

    // Ensure sheets exist
    let initiativesSheet = doc.sheetsByTitle['Iniciativas'];
    if (!initiativesSheet) {
      initiativesSheet = await doc.addSheet({ title: 'Iniciativas', headerValues: ['id', 'title', 'team', 'category', 'actionType', 'conversionMachine', 'touchpoint', 'averageAudience', 'primaryIndicator', 'dependencies', 'incrementalEnrollment', 'month', 'confidence', 'description', 'status'] });
    }

    let updatesSheet = doc.sheetsByTitle['Atualizacoes'];
    if (!updatesSheet) {
      updatesSheet = await doc.addSheet({ title: 'Atualizacoes', headerValues: ['id', 'initiativeId', 'date', 'sentiment', 'comment'] });
    }

    return doc;
  } catch (error) {
    console.error("Error connecting to Google Sheets:", error);
    return null;
  }
}

// API Routes
app.get("/api/initiatives", async (req, res) => {
  try {
    const document = await initGoogleSheets();
    if (!document) {
      return res.status(503).json({ error: "Google Sheets not configured or unavailable" });
    }

    const initiativesSheet = document.sheetsByTitle['Iniciativas'];
    const updatesSheet = document.sheetsByTitle['Atualizacoes'];

    const initiativeRows = await initiativesSheet.getRows();
    const updateRows = await updatesSheet.getRows();

    // Seed data if empty
    if (initiativeRows.length === 0) {
      console.log("Sheet is empty. Seeding initial data...");
      for (const init of INITIAL_INITIATIVES) {
        await initiativesSheet.addRow({
          id: init.id,
          title: init.title,
          team: init.team,
          category: init.category,
          actionType: init.actionType,
          conversionMachine: init.conversionMachine,
          touchpoint: init.touchpoint,
          averageAudience: init.averageAudience,
          primaryIndicator: init.primaryIndicator,
          dependencies: init.dependencies.join(','),
          incrementalEnrollment: init.incrementalEnrollment,
          month: init.month,
          confidence: init.confidence,
          description: init.description,
          status: init.status,
        });

        for (const update of init.updates) {
          await updatesSheet.addRow({
            id: update.id,
            initiativeId: init.id,
            date: update.date,
            sentiment: update.sentiment,
            comment: update.comment,
          });
        }
      }
      // Re-fetch rows after seeding
      const newInitiativeRows = await initiativesSheet.getRows();
      const newUpdateRows = await updatesSheet.getRows();
      
      const updates = newUpdateRows.map(row => ({
        id: row.get('id'),
        initiativeId: row.get('initiativeId'),
        date: row.get('date'),
        sentiment: row.get('sentiment'),
        comment: row.get('comment'),
      }));

      const initiatives = newInitiativeRows.map(row => {
        const id = row.get('id');
        return {
          id,
          title: row.get('title'),
          team: row.get('team'),
          category: row.get('category'),
          actionType: row.get('actionType'),
          conversionMachine: row.get('conversionMachine'),
          touchpoint: row.get('touchpoint'),
          averageAudience: Number(row.get('averageAudience') || 0),
          primaryIndicator: row.get('primaryIndicator'),
          dependencies: row.get('dependencies') ? row.get('dependencies').split(',') : [],
          incrementalEnrollment: Number(row.get('incrementalEnrollment') || 0),
          month: row.get('month'),
          confidence: row.get('confidence'),
          description: row.get('description'),
          status: row.get('status'),
          updates: updates.filter(u => u.initiativeId === id).map(({ initiativeId, ...rest }) => rest),
        };
      });

      return res.json(initiatives);
    }

    const updates = updateRows.map(row => ({
      id: row.get('id'),
      initiativeId: row.get('initiativeId'),
      date: row.get('date'),
      sentiment: row.get('sentiment'),
      comment: row.get('comment'),
    }));

    const initiatives = initiativeRows.map(row => {
      const id = row.get('id');
      return {
        id,
        title: row.get('title'),
        team: row.get('team'),
        category: row.get('category'),
        actionType: row.get('actionType'),
        conversionMachine: row.get('conversionMachine'),
        touchpoint: row.get('touchpoint'),
        averageAudience: Number(row.get('averageAudience') || 0),
        primaryIndicator: row.get('primaryIndicator'),
        dependencies: row.get('dependencies') ? row.get('dependencies').split(',') : [],
        incrementalEnrollment: Number(row.get('incrementalEnrollment') || 0),
        month: row.get('month'),
        confidence: row.get('confidence'),
        description: row.get('description'),
        status: row.get('status'),
        updates: updates.filter(u => u.initiativeId === id).map(({ initiativeId, ...rest }) => rest),
      };
    });

    res.json(initiatives);
  } catch (error) {
    console.error("Error fetching initiatives:", error);
    res.status(500).json({ error: "Failed to fetch initiatives" });
  }
});

app.post("/api/initiatives", async (req, res) => {
  try {
    const document = await initGoogleSheets();
    if (!document) {
      return res.status(503).json({ error: "Google Sheets not configured or unavailable" });
    }

    const initiativesSheet = document.sheetsByTitle['Iniciativas'];
    const newInitiative = req.body;

    await initiativesSheet.addRow({
      id: newInitiative.id,
      title: newInitiative.title,
      team: newInitiative.team,
      category: newInitiative.category,
      actionType: newInitiative.actionType,
      conversionMachine: newInitiative.conversionMachine,
      touchpoint: newInitiative.touchpoint,
      averageAudience: newInitiative.averageAudience,
      primaryIndicator: newInitiative.primaryIndicator,
      dependencies: newInitiative.dependencies.join(','),
      incrementalEnrollment: newInitiative.incrementalEnrollment,
      month: newInitiative.month,
      confidence: newInitiative.confidence,
      description: newInitiative.description,
      status: newInitiative.status,
    });

    res.status(201).json(newInitiative);
  } catch (error) {
    console.error("Error creating initiative:", error);
    res.status(500).json({ error: "Failed to create initiative" });
  }
});

app.post("/api/initiatives/:id/updates", async (req, res) => {
  try {
    const document = await initGoogleSheets();
    if (!document) {
      return res.status(503).json({ error: "Google Sheets not configured or unavailable" });
    }

    const updatesSheet = document.sheetsByTitle['Atualizacoes'];
    const initiativeId = req.params.id;
    const update = req.body;

    await updatesSheet.addRow({
      id: update.id,
      initiativeId: initiativeId,
      date: update.date,
      sentiment: update.sentiment,
      comment: update.comment,
    });

    res.status(201).json(update);
  } catch (error) {
    console.error("Error adding update:", error);
    res.status(500).json({ error: "Failed to add update" });
  }
});


if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  async function startServer() {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  startServer();
} else {
  app.use(express.static('dist'));
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

export default app;
