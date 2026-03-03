/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Plus, TrendingUp, Users, Target, BarChart3, 
  Filter, Calendar, ChevronRight, LayoutDashboard, 
  PlusCircle, GraduationCap, BookOpen, Search,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Sparkles, Loader2, Check, HelpCircle, Calculator, CalendarDays, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type Team = 'Canais Digitais' | 'Performance' | 'CRO' | 'Data Insights';
type Category = 'Graduação' | 'Pós';
type Month = 'Abril' | 'Maio' | 'Junho';
type Confidence = 'Alta' | 'Média' | 'Baixa';
type ActionType = 'Estruturante' | 'Otimização';
type ConversionMachine = 'Todos' | 'E-Commerce' | 'App' | 'Chatbot';
type Touchpoint = 'Home' | 'Página de Produto' | 'Vitrine de Cursos' | 'Vitrine Avançada' | 'Landing Page' | 'Checkout' | 'Webflow' | 'Outros';
type PrimaryIndicator = 'Sessão > Inscrito' | 'Inscrito > Aprovado/Pago' | 'Aprovado > Matriculado';
type Dependency = 'Canais' | 'CRO' | 'DataInsights' | 'Performance' | 'Mídia' | 'Hubcriativo' | 'SEO/Inbound' | 'Martech' | 'CRM' | 'Social' | 'Ingresso';
type Sentiment = 'No Prazo' | 'Em Risco' | 'Atrasado';

interface InitiativeUpdate {
  id: string;
  date: string;
  sentiment: Sentiment;
  comment: string;
}

interface Initiative {
  id: string;
  title: string;
  team: Team;
  category: Category;
  actionType: ActionType;
  conversionMachine: ConversionMachine;
  touchpoint: Touchpoint;
  averageAudience: number;
  primaryIndicator: PrimaryIndicator;
  dependencies: Dependency[];
  incrementalEnrollment: number;
  month: Month;
  confidence: Confidence;
  description: string;
  status: 'Planejado' | 'Em Execução' | 'Concluído';
  updates: InitiativeUpdate[];
}

// --- Mock Data ---
const INITIAL_INITIATIVES: Initiative[] = [
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
    averageAudience: 300000,
    primaryIndicator: 'Inscrito > Aprovado/Pago',
    dependencies: ['Martech', 'Social'],
    incrementalEnrollment: 950,
    month: 'Maio',
    confidence: 'Média',
    description: 'Exibição dinâmica de cursos baseada em navegação prévia.',
    status: 'Planejado',
    updates: [
      {
        id: 'u4',
        date: '2026-04-15',
        sentiment: 'Em Risco',
        comment: 'Atraso na liberação da API de histórico de navegação.'
      }
    ]
  }
];

const TEAMS: Team[] = ['Canais Digitais', 'Performance', 'CRO', 'Data Insights'];
const CATEGORIES: Category[] = ['Graduação', 'Pós'];
const MONTHS: Month[] = ['Abril', 'Maio', 'Junho'];
const CONFIDENCE_LEVELS: Confidence[] = ['Alta', 'Média', 'Baixa'];
const ACTION_TYPES: ActionType[] = ['Estruturante', 'Otimização'];
const CONVERSION_MACHINES: ConversionMachine[] = ['Todos', 'E-Commerce', 'App', 'Chatbot'];
const PRIMARY_INDICATORS: PrimaryIndicator[] = ['Sessão > Inscrito', 'Inscrito > Aprovado/Pago', 'Aprovado > Matriculado'];
const DEPENDENCIES: Dependency[] = ['Canais', 'CRO', 'DataInsights', 'Performance', 'Mídia', 'Hubcriativo', 'SEO/Inbound', 'Martech', 'CRM', 'Social', 'Ingresso'];

const TOUCHPOINTS: Touchpoint[] = ['Home', 'Página de Produto', 'Vitrine de Cursos', 'Vitrine Avançada', 'Landing Page', 'Checkout', 'Webflow', 'Outros'];

// --- Components ---

const FilterBar = ({
  filterTeam, setFilterTeam,
  filterCategory, setFilterCategory,
  filterMonth, setFilterMonth,
  filterConfidence, setFilterConfidence,
  filterHasDependency, setFilterHasDependency
}: {
  filterTeam: Team | 'Todos'; setFilterTeam: (t: Team | 'Todos') => void;
  filterCategory: Category | 'Todos'; setFilterCategory: (c: Category | 'Todos') => void;
  filterMonth: Month | 'Todos'; setFilterMonth: (m: Month | 'Todos') => void;
  filterConfidence: Confidence | 'Todos'; setFilterConfidence: (c: Confidence | 'Todos') => void;
  filterHasDependency: 'Sim' | 'Não' | 'Todos'; setFilterHasDependency: (d: 'Sim' | 'Não' | 'Todos') => void;
}) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <h3 className="font-bold text-xl text-slate-800">Filtros de Visualização</h3>
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => setFilterTeam('Todos')}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
            filterTeam === 'Todos' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
          )}
        >
          Todos
        </button>
        {TEAMS.map(t => (
          <button 
            key={t}
            onClick={() => setFilterTeam(t)}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
              filterTeam === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            )}
          >
            {t.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>

    {/* Advanced Filters */}
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtros:</span>
      </div>
      
      <select 
        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        value={filterCategory}
        onChange={(e) => setFilterCategory(e.target.value as any)}
      >
        <option value="Todos">Todas Categorias</option>
        <option value="Graduação">Graduação</option>
        <option value="Pós">Pós</option>
      </select>

      <select 
        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value as any)}
      >
        <option value="Todos">Todos os Meses</option>
        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <select 
        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        value={filterConfidence}
        onChange={(e) => setFilterConfidence(e.target.value as any)}
      >
        <option value="Todos">Todas Confianças</option>
        {CONFIDENCE_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <select 
        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        value={filterHasDependency}
        onChange={(e) => setFilterHasDependency(e.target.value as any)}
      >
        <option value="Todos">Dependência (Todas)</option>
        <option value="Sim">Com Dependência</option>
        <option value="Não">Sem Dependência</option>
      </select>

      {(filterTeam !== 'Todos' || filterCategory !== 'Todos' || filterMonth !== 'Todos' || filterConfidence !== 'Todos' || filterHasDependency !== 'Todos') && (
        <button 
          onClick={() => {
            setFilterTeam('Todos');
            setFilterCategory('Todos');
            setFilterMonth('Todos');
            setFilterConfidence('Todos');
            setFilterHasDependency('Todos');
          }}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 ml-auto"
        >
          Limpar Filtros
        </button>
      )}
    </div>
  </div>
);

const UpdateView = ({ 
  initiatives, 
  filteredInitiatives,
  onAddUpdate,
  filterTeam, setFilterTeam,
  filterCategory, setFilterCategory,
  filterMonth, setFilterMonth,
  filterConfidence, setFilterConfidence,
  filterHasDependency, setFilterHasDependency
}: { 
  initiatives: Initiative[];
  filteredInitiatives: Initiative[];
  onAddUpdate: (id: string, update: Omit<InitiativeUpdate, 'id'>) => void;
  filterTeam: Team | 'Todos'; setFilterTeam: (t: Team | 'Todos') => void;
  filterCategory: Category | 'Todos'; setFilterCategory: (c: Category | 'Todos') => void;
  filterMonth: Month | 'Todos'; setFilterMonth: (m: Month | 'Todos') => void;
  filterConfidence: Confidence | 'Todos'; setFilterConfidence: (c: Confidence | 'Todos') => void;
  filterHasDependency: 'Sim' | 'Não' | 'Todos'; setFilterHasDependency: (d: 'Sim' | 'Não' | 'Todos') => void;
}) => {
  const [selectedInitiativeId, setSelectedInitiativeId] = useState<string | null>(null);
  const [newUpdate, setNewUpdate] = useState<Partial<InitiativeUpdate>>({
    date: new Date().toISOString().split('T')[0],
    sentiment: 'No Prazo',
    comment: ''
  });

  const latestSentiments = initiatives.reduce((acc, curr) => {
    const lastUpdate = curr.updates[curr.updates.length - 1];
    const status = lastUpdate ? lastUpdate.sentiment : 'Sem Atualização';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'No Prazo', value: latestSentiments['No Prazo'] || 0, fill: '#10b981' },
    { name: 'Em Risco', value: latestSentiments['Em Risco'] || 0, fill: '#f59e0b' },
    { name: 'Atrasado', value: latestSentiments['Atrasado'] || 0, fill: '#f43f5e' },
    { name: 'Sem Atualização', value: latestSentiments['Sem Atualização'] || 0, fill: '#cbd5e1' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
          <Activity className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Atualização de Progresso</h2>
          <p className="text-slate-500">Acompanhamento mensal do sentimento e evolução das iniciativas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1">
          <h3 className="font-bold text-slate-800 mb-6">Visão Geral de Sentimento</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-card p-6 lg:col-span-2">
           <h3 className="font-bold text-slate-800 mb-6">Resumo do Quarter</h3>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total</p>
               <p className="text-2xl font-black text-slate-800">{initiatives.length}</p>
             </div>
             <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <p className="text-xs font-bold text-emerald-600 uppercase mb-1">No Prazo</p>
               <p className="text-2xl font-black text-emerald-700">{latestSentiments['No Prazo'] || 0}</p>
             </div>
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
               <p className="text-xs font-bold text-amber-600 uppercase mb-1">Em Risco</p>
               <p className="text-2xl font-black text-amber-700">{latestSentiments['Em Risco'] || 0}</p>
             </div>
             <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
               <p className="text-xs font-bold text-rose-600 uppercase mb-1">Atrasado</p>
               <p className="text-2xl font-black text-rose-700">{latestSentiments['Atrasado'] || 0}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <FilterBar 
          filterTeam={filterTeam} setFilterTeam={setFilterTeam}
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterMonth={filterMonth} setFilterMonth={setFilterMonth}
          filterConfidence={filterConfidence} setFilterConfidence={setFilterConfidence}
          filterHasDependency={filterHasDependency} setFilterHasDependency={setFilterHasDependency}
        />
        
        <h3 className="font-bold text-xl text-slate-800 pt-4">Atualizações por Iniciativa</h3>
        {filteredInitiatives.map(initiative => (
          <div key={initiative.id} className="glass-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                    {initiative.team}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md",
                    initiative.status === 'Concluído' ? "bg-emerald-100 text-emerald-700" :
                    initiative.status === 'Em Execução' ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  )}>
                    {initiative.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-800">{initiative.title}</h4>
              </div>
              
              {initiative.updates.length < 3 && selectedInitiativeId !== initiative.id && (
                <button 
                  onClick={() => {
                    setSelectedInitiativeId(initiative.id);
                    setNewUpdate({ date: new Date().toISOString().split('T')[0], sentiment: 'No Prazo', comment: '' });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-sm rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Atualização ({initiative.updates.length}/3)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map(index => {
                const update = initiative.updates[index];
                if (update) {
                  return (
                    <div key={update.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 relative overflow-hidden">
                      <div className={cn(
                        "absolute top-0 left-0 w-1 h-full",
                        update.sentiment === 'No Prazo' ? "bg-emerald-500" :
                        update.sentiment === 'Em Risco' ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      <div className="flex items-center justify-between mb-2 pl-2">
                        <span className="text-xs font-bold text-slate-500">{new Date(update.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                          update.sentiment === 'No Prazo' ? "bg-emerald-100 text-emerald-700" :
                          update.sentiment === 'Em Risco' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {update.sentiment}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 pl-2">{update.comment}</p>
                    </div>
                  );
                } else if (selectedInitiativeId === initiative.id && index === initiative.updates.length) {
                  return (
                    <div key="new-update" className="p-4 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Data</label>
                          <input 
                            type="date" 
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newUpdate.date}
                            onChange={e => setNewUpdate({...newUpdate, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sentimento</label>
                          <select 
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            value={newUpdate.sentiment}
                            onChange={e => setNewUpdate({...newUpdate, sentiment: e.target.value as Sentiment})}
                          >
                            <option value="No Prazo">No Prazo</option>
                            <option value="Em Risco">Em Risco</option>
                            <option value="Atrasado">Atrasado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Comentário</label>
                          <textarea 
                            rows={2}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Evolução do mês..."
                            value={newUpdate.comment}
                            onChange={e => setNewUpdate({...newUpdate, comment: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={() => setSelectedInitiativeId(null)}
                            className="flex-1 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => {
                              if (newUpdate.date && newUpdate.sentiment && newUpdate.comment) {
                                onAddUpdate(initiative.id, newUpdate as Omit<InitiativeUpdate, 'id'>);
                                setSelectedInitiativeId(null);
                              }
                            }}
                            disabled={!newUpdate.date || !newUpdate.comment}
                            className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div key={`empty-${index}`} className="p-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[120px]">
                      <span className="text-xs font-medium text-slate-400">Atualização {index + 1} pendente</span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanView = ({ initiatives, onSelectInitiative }: { initiatives: Initiative[], onSelectInitiative: (i: Initiative) => void }) => {
  const [groupBy, setGroupBy] = useState<'team' | 'category' | 'conversionMachine'>('team');

  const groupLabels = {
    team: 'Squad',
    category: 'Categoria',
    conversionMachine: 'Máquina de Conversão'
  };

  const groupValues = useMemo(() => {
    const values = new Set<string>();
    initiatives.forEach(i => values.add(i[groupBy]));
    return Array.from(values).sort();
  }, [initiatives, groupBy]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Plano de Execução</h2>
            <p className="text-slate-500">Timeline das iniciativas programadas para o quarter.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase px-2">Agrupar por:</span>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="team">Squad</option>
            <option value="category">Categoria</option>
            <option value="conversionMachine">Máquina de Conversão</option>
          </select>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 border-b border-slate-200 bg-slate-50/50 w-1/4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{groupLabels[groupBy]}</span>
                </th>
                {MONTHS.map(month => (
                  <th key={month} className="p-4 border-b border-slate-200 bg-slate-50/50 w-1/4">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{month}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupValues.map(group => (
                <tr key={group} className="border-b border-slate-100 last:border-0">
                  <td className="p-4 align-top bg-white border-r border-slate-50">
                    <span className="font-bold text-slate-800">{group}</span>
                  </td>
                  {MONTHS.map(month => {
                    const cellInitiatives = initiatives.filter(i => i[groupBy] === group && i.month === month);
                    return (
                      <td key={`${group}-${month}`} className="p-4 align-top border-r border-slate-50 last:border-0 bg-slate-50/30">
                        <div className="space-y-3">
                          {cellInitiatives.map(initiative => (
                            <div 
                              key={initiative.id}
                              onClick={() => onSelectInitiative(initiative)}
                              className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                  initiative.actionType === 'Estruturante' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                                )}>
                                  {initiative.actionType}
                                </span>
                                <span className={cn(
                                  "w-2 h-2 rounded-full",
                                  initiative.status === 'Concluído' ? "bg-emerald-500" :
                                  initiative.status === 'Em Execução' ? "bg-amber-500" :
                                  "bg-slate-300"
                                )} title={initiative.status} />
                              </div>
                              <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors mb-2">
                                {initiative.title}
                              </p>
                              <div className="flex items-center justify-between text-[10px] font-medium text-slate-500">
                                <span>+{initiative.incrementalEnrollment} mat.</span>
                                <span className={cn(
                                  initiative.confidence === 'Alta' ? "text-emerald-600" :
                                  initiative.confidence === 'Média' ? "text-amber-600" :
                                  "text-rose-600"
                                )}>{initiative.confidence}</span>
                              </div>
                            </div>
                          ))}
                          {cellInitiatives.length === 0 && (
                            <div className="h-full min-h-[60px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                              <span className="text-xs text-slate-400 font-medium">Sem iniciativas</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: { 
  title: string; 
  value: string; 
  icon: any; 
  trend?: { val: string; positive: boolean };
  color: string;
}) => (
  <div className="glass-card p-6 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className={cn("p-2 rounded-lg", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center text-xs font-medium",
          trend.positive ? "text-emerald-600" : "text-rose-600"
        )}>
          {trend.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend.val}
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
  </div>
);

// --- Simulator Component ---
const SimulatorView = () => {
  const [category, setCategory] = useState<'Graduação' | 'Pós'>('Graduação');
  const [channel, setChannel] = useState<'E-Commerce' | 'App' | 'Chatbot'>('E-Commerce');
  const [indicator, setIndicator] = useState<string>('Sessão > Inscrito');
  const [inputVolume, setInputVolume] = useState<number>(100000);
  const [multiplier, setMultiplier] = useState<number>(1.05);

  const rates = {
    'Graduação': {
      sessao_inscrito: 0.0086,
      inscrito_aprovado: 0.65,
      aprovado_matriculado: 0.45
    },
    'Pós': {
      sessao_inscrito: 0.0193,
      inscrito_pago: 0.40,
      pago_matriculado: 0.90
    }
  };

  const calculateResult = () => {
    const currentRates = rates[category];
    let increment = 0;
    let steps = [];

    if (indicator === 'Sessão > Inscrito') {
      const baseRate = currentRates.sessao_inscrito;
      const newRate = baseRate * multiplier;
      const incInscritos = inputVolume * (newRate - baseRate);
      
      if (category === 'Graduação') {
        increment = incInscritos * currentRates.inscrito_aprovado * currentRates.aprovado_matriculado;
        steps = [
          { label: 'Novos Inscritos', value: incInscritos.toFixed(0) },
          { label: 'Novos Aprovados', value: (incInscritos * currentRates.inscrito_aprovado).toFixed(0) },
          { label: 'Novas Matrículas', value: increment.toFixed(0) }
        ];
      } else {
        increment = incInscritos * currentRates.inscrito_pago * currentRates.pago_matriculado;
        steps = [
          { label: 'Novos Inscritos', value: incInscritos.toFixed(0) },
          { label: 'Novos Pagos', value: (incInscritos * currentRates.inscrito_pago).toFixed(0) },
          { label: 'Novas Matrículas', value: increment.toFixed(0) }
        ];
      }
    } else if (indicator === 'Inscrito > Aprovado/Pago') {
      const baseRate = category === 'Graduação' ? currentRates.inscrito_aprovado : currentRates.inscrito_pago;
      const newRate = baseRate * multiplier;
      const incIntermediate = inputVolume * (newRate - baseRate);
      
      if (category === 'Graduação') {
        increment = incIntermediate * currentRates.aprovado_matriculado;
        steps = [
          { label: 'Novos Aprovados', value: incIntermediate.toFixed(0) },
          { label: 'Novas Matrículas', value: increment.toFixed(0) }
        ];
      } else {
        increment = incIntermediate * currentRates.pago_matriculado;
        steps = [
          { label: 'Novos Pagos', value: incIntermediate.toFixed(0) },
          { label: 'Novas Matrículas', value: increment.toFixed(0) }
        ];
      }
    } else {
      const baseRate = category === 'Graduação' ? currentRates.aprovado_matriculado : currentRates.pago_matriculado;
      const newRate = baseRate * multiplier;
      increment = inputVolume * (newRate - baseRate);
      steps = [
        { label: 'Novas Matrículas', value: increment.toFixed(0) }
      ];
    }

    return { increment, steps };
  };

  const result = calculateResult();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Simulador de Incremento</h2>
            <p className="text-slate-500">Calcule o impacto estimado em matrículas baseado em premissas de conversão.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inputs */}
          <div className="lg:col-span-1 space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Premissas</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Categoria</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Graduação', 'Pós'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat as any)}
                      className={cn(
                        "py-2 text-sm font-bold rounded-xl border transition-all",
                        category === cat ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Canal de Conversão</label>
                <select 
                  value={channel}
                  onChange={(e) => {
                    const newChannel = e.target.value as any;
                    setChannel(newChannel);
                    if (newChannel !== 'E-Commerce' && indicator === 'Sessão > Inscrito') {
                      setIndicator('Inscrito > Aprovado/Pago');
                    }
                  }}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="App">App</option>
                  <option value="Chatbot">Chatbot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Indicador Primário</label>
                <select 
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {channel === 'E-Commerce' && <option value="Sessão > Inscrito">Sessão &gt; Inscrito</option>}
                  <option value="Inscrito > Aprovado/Pago">Inscrito &gt; Aprovado/Pago</option>
                  <option value="Aprovado/Pago > Matriculado">Aprovado/Pago &gt; Matriculado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                  {indicator === 'Sessão > Inscrito' ? 'Volume de Sessões' : 'Volume de Inscritos'}
                </label>
                <input 
                  type="number"
                  value={inputVolume}
                  onChange={(e) => setInputVolume(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Incremento na Taxa Primária</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1.02, 1.05, 1.07, 1.10].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMultiplier(m)}
                      className={cn(
                        "py-2 text-sm font-bold rounded-xl border transition-all",
                        multiplier === m ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                      )}
                    >
                      {((m - 1) * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-indigo-600 rounded-[32px] p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="relative z-10">
                <p className="text-indigo-100 text-sm font-bold uppercase tracking-widest mb-2">Incremento Estimado</p>
                <h3 className="text-6xl font-black mb-1">+{result.increment.toFixed(0)}</h3>
                <p className="text-indigo-100 text-sm">Matrículas adicionais no quarter</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.steps.map((step, idx) => (
                <div key={idx} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{step.label}</p>
                  <p className="text-2xl font-black text-slate-800">+{step.value}</p>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                Premissas de Conversão (Baseline)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn("p-4 rounded-2xl transition-all", indicator === 'Sessão > Inscrito' ? "bg-white shadow-sm border border-indigo-100" : "")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sessão &gt; Inscrito</p>
                  <p className="text-sm font-bold text-slate-700">
                    {(rates[category].sessao_inscrito * 100).toFixed(2)}%
                    {indicator === 'Sessão > Inscrito' && (
                      <span className="ml-2 text-indigo-600">
                        &rarr; {(rates[category].sessao_inscrito * multiplier * 100).toFixed(2)}%
                      </span>
                    )}
                  </p>
                </div>
                <div className={cn("p-4 rounded-2xl transition-all", indicator === 'Inscrito > Aprovado/Pago' ? "bg-white shadow-sm border border-indigo-100" : "")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inscrito &gt; {category === 'Graduação' ? 'Aprovado' : 'Pago'}</p>
                  <p className="text-sm font-bold text-slate-700">
                    {((category === 'Graduação' ? rates[category].inscrito_aprovado : rates[category].inscrito_pago) * 100).toFixed(0)}%
                    {indicator === 'Inscrito > Aprovado/Pago' && (
                      <span className="ml-2 text-indigo-600">
                        &rarr; {((category === 'Graduação' ? rates[category].inscrito_aprovado : rates[category].inscrito_pago) * multiplier * 100).toFixed(1)}%
                      </span>
                    )}
                  </p>
                </div>
                <div className={cn("p-4 rounded-2xl transition-all", indicator === 'Aprovado/Pago > Matriculado' ? "bg-white shadow-sm border border-indigo-100" : "")}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{category === 'Graduação' ? 'Aprovado' : 'Pago'} &gt; Matriculado</p>
                  <p className="text-sm font-bold text-slate-700">
                    {((category === 'Graduação' ? rates[category].aprovado_matriculado : rates[category].pago_matriculado) * 100).toFixed(0)}%
                    {indicator === 'Aprovado/Pago > Matriculado' && (
                      <span className="ml-2 text-indigo-600">
                        &rarr; {((category === 'Graduação' ? rates[category].aprovado_matriculado : rates[category].pago_matriculado) * multiplier * 100).toFixed(1)}%
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tutorial' | 'simulator' | 'plano' | 'checkpoint'>('dashboard');
  const [initiatives, setInitiatives] = useState<Initiative[]>(INITIAL_INITIATIVES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInitiatives = async () => {
      try {
        const response = await fetch('/api/initiatives');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setInitiatives(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch initiatives from API, using mock data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitiatives();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [filterTeam, setFilterTeam] = useState<Team | 'Todos'>('Todos');
  const [filterCategory, setFilterCategory] = useState<Category | 'Todos'>('Todos');
  const [filterMonth, setFilterMonth] = useState<Month | 'Todos'>('Todos');
  const [filterConfidence, setFilterConfidence] = useState<Confidence | 'Todos'>('Todos');
  const [filterHasDependency, setFilterHasDependency] = useState<'Sim' | 'Não' | 'Todos'>('Todos');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Form State
  const [newInitiative, setNewInitiative] = useState<Partial<Initiative>>({
    team: 'Canais Digitais',
    category: 'Graduação',
    month: 'Abril',
    status: 'Planejado',
    confidence: 'Alta',
    actionType: 'Otimização',
    conversionMachine: 'Todos',
    touchpoint: 'Home',
    averageAudience: 0,
    primaryIndicator: 'Sessão > Inscrito',
    dependencies: [],
    incrementalEnrollment: 0,
    updates: []
  });

  const generateAIDescription = async () => {
    if (!newInitiative.title) return;
    
    setIsGeneratingDescription(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Escreva uma descrição curta e profissional (máximo 150 caracteres) para uma iniciativa de crescimento chamada: "${newInitiative.title}". O texto deve ser direto e focado em resultados de negócio.`,
      });
      
      if (response.text) {
        setNewInitiative(prev => ({ ...prev, description: response.text?.trim() }));
      }
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter(item => {
      const teamMatch = filterTeam === 'Todos' || item.team === filterTeam;
      const categoryMatch = filterCategory === 'Todos' || item.category === filterCategory;
      const monthMatch = filterMonth === 'Todos' || item.month === filterMonth;
      const confidenceMatch = filterConfidence === 'Todos' || item.confidence === filterConfidence;
      const dependencyMatch = filterHasDependency === 'Todos' || 
        (filterHasDependency === 'Sim' ? item.dependencies.length > 0 : item.dependencies.length === 0);
      
      return teamMatch && categoryMatch && monthMatch && confidenceMatch && dependencyMatch;
    });
  }, [initiatives, filterTeam, filterCategory, filterMonth, filterConfidence, filterHasDependency]);

  const totalEnrollment = initiatives.reduce((acc, curr) => acc + curr.incrementalEnrollment, 0);
  
  const chartDataByMonth = MONTHS.map(month => ({
    name: month,
    gain: initiatives.filter(i => i.month === month).reduce((acc, curr) => acc + curr.incrementalEnrollment, 0)
  }));

  const chartDataByTeam = TEAMS.map(team => ({
    name: team,
    value: initiatives.filter(i => i.team === team).reduce((acc, curr) => acc + curr.incrementalEnrollment, 0)
  }));

  const handleAddUpdate = async (initiativeId: string, update: Omit<InitiativeUpdate, 'id'>) => {
    const newUpdate = { ...update, id: Math.random().toString(36).substr(2, 9) };
    
    // Optimistic update
    setInitiatives(prev => prev.map(i => {
      if (i.id === initiativeId) {
        return {
          ...i,
          updates: [...i.updates, newUpdate].slice(0, 3)
        };
      }
      return i;
    }));

    try {
      await fetch(`/api/initiatives/${initiativeId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdate),
      });
    } catch (error) {
      console.error("Failed to save update to API", error);
    }
  };

  const handleAddInitiative = async (e: React.FormEvent) => {
    e.preventDefault();
    const initiative: Initiative = {
      ...newInitiative as Initiative,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    // Optimistic update
    setInitiatives([...initiatives, initiative]);
    setIsModalOpen(false);
    
    try {
      await fetch('/api/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initiative),
      });
    } catch (error) {
      console.error("Failed to save initiative to API", error);
    }

    setNewInitiative({
      team: 'Canais Digitais',
      category: 'Graduação',
      month: 'Abril',
      status: 'Planejado',
      confidence: 'Alta',
      actionType: 'Otimização',
      conversionMachine: 'Todos',
      touchpoint: 'Home',
      averageAudience: 0,
      primaryIndicator: 'Sessão > Inscrito',
      dependencies: [],
      incrementalEnrollment: 0,
      updates: []
    });
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight leading-tight">PI Digital Sales<br/><span className="text-xs text-slate-400 font-medium">(Ensino Superior)</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === 'dashboard' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('tutorial')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === 'tutorial' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <HelpCircle className="w-4 h-4" />
            Tutorial de Preenchimento
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === 'simulator' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Calculator className="w-4 h-4" />
            Simulador de Incremento
          </button>
          <button 
            onClick={() => setActiveTab('plano')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === 'plano' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            Plano
          </button>
          <button 
            onClick={() => setActiveTab('checkpoint')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-xl transition-all",
              activeTab === 'checkpoint' ? "text-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <Activity className="w-4 h-4" />
            Checkpoint
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Próximo Trimestre</p>
            <h4 className="text-sm font-bold mt-1">Q2 2026</h4>
            <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-1/3" />
            </div>
            <p className="text-[10px] mt-2 text-slate-400">Planejamento em 35%</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar iniciativas..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-indigo-200"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Iniciativa
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {activeTab === 'dashboard' ? (
            <React.Fragment>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Matrícula Incremental Total" 
              value={totalEnrollment.toLocaleString()} 
              icon={TrendingUp} 
              trend={{ val: "12%", positive: true }}
              color="bg-indigo-600"
            />
            <StatCard 
              title="Total Iniciativas" 
              value={initiatives.length.toString()} 
              icon={Target} 
              color="bg-emerald-600"
            />
            <StatCard 
              title="Foco Graduação" 
              value={initiatives.filter(i => i.category === 'Graduação').length.toString()} 
              icon={GraduationCap} 
              color="bg-amber-500"
            />
            <StatCard 
              title="Foco Pós" 
              value={initiatives.filter(i => i.category === 'Pós').length.toString()} 
              icon={BookOpen} 
              color="bg-rose-500"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800">Previsibilidade Mensal (Q2 2026)</h3>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  Matrícula Incremental
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(val) => val.toLocaleString()}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="gain" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-bold text-slate-800 mb-6">Distribuição por Squad</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartDataByTeam}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartDataByTeam.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Initiatives Grid */}
          <div className="space-y-6">
            <FilterBar 
              filterTeam={filterTeam} setFilterTeam={setFilterTeam}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              filterMonth={filterMonth} setFilterMonth={setFilterMonth}
              filterConfidence={filterConfidence} setFilterConfidence={setFilterConfidence}
              filterHasDependency={filterHasDependency} setFilterHasDependency={setFilterHasDependency}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredInitiatives.map((item) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedInitiative(item)}
                    className="glass-card p-6 cursor-pointer hover:shadow-xl hover:shadow-indigo-100/50 transition-all group border border-transparent hover:border-indigo-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md w-fit",
                          item.actionType === 'Estruturante' ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                        )}>
                          {item.actionType}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight px-2">
                          {item.conversionMachine} &bull; {item.touchpoint}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                        item.confidence === 'Alta' ? "bg-emerald-100 text-emerald-700" :
                        item.confidence === 'Média' ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {item.confidence}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {item.team}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.month}
                      </div>
                    </div>

                    <div className="mb-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Indicador Primário</p>
                      <p className="text-[11px] font-bold text-slate-700">{item.primaryIndicator}</p>
                    </div>

                    <div className="mb-4 flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audiência Média</p>
                        <p className="text-[11px] font-bold text-slate-700">{item.averageAudience.toLocaleString()} /mês</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matrícula Incremental</p>
                        <p className="text-xl font-black text-indigo-600">
                          {item.incrementalEnrollment.toLocaleString()}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredInitiatives.length === 0 && (
              <div className="p-12 text-center glass-card">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium">Nenhuma iniciativa encontrada com os filtros atuais.</p>
              </div>
            )}
            </div>
            </React.Fragment>
          ) : activeTab === 'simulator' ? (
            <SimulatorView />
          ) : activeTab === 'plano' ? (
            <PlanView initiatives={initiatives} onSelectInitiative={setSelectedInitiative} />
          ) : activeTab === 'checkpoint' ? (
            <UpdateView 
              initiatives={initiatives} 
              filteredInitiatives={filteredInitiatives}
              onAddUpdate={handleAddUpdate} 
              filterTeam={filterTeam} setFilterTeam={setFilterTeam}
              filterCategory={filterCategory} setFilterCategory={setFilterCategory}
              filterMonth={filterMonth} setFilterMonth={setFilterMonth}
              filterConfidence={filterConfidence} setFilterConfidence={setFilterConfidence}
              filterHasDependency={filterHasDependency} setFilterHasDependency={setFilterHasDependency}
            />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Guia de Preenchimento</h2>
                  <p className="text-slate-500">Entenda como lançar suas iniciativas corretamente para o Q2 2026.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Dicionário de Campos</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Título</p>
                      <p className="text-sm text-slate-600">Nome direto da ação. Ex: "Otimização de Checkout" ou "Campanha de Remarketing".</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Matrícula Incremental</p>
                      <p className="text-sm text-slate-600">Quantas matrículas a mais esperamos gerar com essa ação específica.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Tipo de Ação</p>
                      <p className="text-sm text-slate-600"><strong>Estruturante:</strong> Mudanças de base, novas ferramentas. <strong>Otimização:</strong> Melhoria do que já existe.</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Máquina de Conversão</p>
                      <p className="text-sm text-slate-600">Onde o usuário final converte (E-Commerce, App, Chatbot ou Todos).</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-1">Indicador Primário</p>
                      <p className="text-sm text-slate-600">Qual etapa do funil é o foco principal da melhoria.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2">Exemplos por Squad</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Canais Digitais</p>
                      <p className="text-sm font-bold text-slate-800 mb-1">SEO para Landing Pages</p>
                      <p className="text-xs text-slate-500 italic">Foco: Sessão &gt; Inscrito | Tipo: Estruturante</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Performance</p>
                      <p className="text-sm font-bold text-slate-800 mb-1">Remarketing de Abandono</p>
                      <p className="text-xs text-slate-500 italic">Foco: Inscrito &gt; Aprovado | Tipo: Otimização</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">CRO</p>
                      <p className="text-sm font-bold text-slate-800 mb-1">A/B Test no Checkout PIX</p>
                      <p className="text-xs text-slate-500 italic">Foco: Aprovado &gt; Matriculado | Tipo: Otimização</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Data Insights</p>
                      <p className="text-sm font-bold text-slate-800 mb-1">Modelo de Atribuição Q2</p>
                      <p className="text-xs text-slate-500 italic">Foco: Todos | Tipo: Estruturante</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-indigo-600 rounded-[24px] text-white flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold">Pronto para começar?</h4>
                  <p className="text-indigo-100 text-sm">Clique no botão "Nova Iniciativa" no topo da página.</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab('dashboard');
                    setIsModalOpen(true);
                  }}
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all"
                >
                  Criar Minha Primeira Iniciativa
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInitiative && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInitiative(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-md">
                      {selectedInitiative.actionType}
                    </span>
                    <span className={cn(
                      "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md",
                      selectedInitiative.status === 'Concluído' ? "bg-emerald-50 text-emerald-600" :
                      selectedInitiative.status === 'Em Execução' ? "bg-amber-50 text-amber-600" :
                      "bg-slate-50 text-slate-600"
                    )}>
                      {selectedInitiative.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">
                    {selectedInitiative.title}
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedInitiative(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus className="w-6 h-6 rotate-45 text-slate-400" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Squad</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.team}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Categoria</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mês</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.month}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Máquina de Conversão</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.conversionMachine}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ponto de Contato</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.touchpoint}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Indicador Primário</p>
                    <p className="text-sm font-bold text-indigo-600">{selectedInitiative.primaryIndicator}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confiança</p>
                    <p className={cn(
                      "text-sm font-bold",
                      selectedInitiative.confidence === 'Alta' ? "text-emerald-600" :
                      selectedInitiative.confidence === 'Média' ? "text-amber-600" :
                      "text-rose-600"
                    )}>{selectedInitiative.confidence}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Audiência Média</p>
                    <p className="text-sm font-bold text-slate-800">{selectedInitiative.averageAudience.toLocaleString()} /mês</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descrição da Iniciativa</p>
                  <p className="text-slate-600 leading-relaxed">
                    {selectedInitiative.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dependências Intratime</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedInitiative.dependencies.map(dep => (
                      <span key={dep} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200">
                        {dep}
                      </span>
                    ))}
                    {selectedInitiative.dependencies.length === 0 && (
                      <span className="text-sm text-slate-400 italic">Nenhuma dependência mapeada.</span>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Impacto Estimado</p>
                    <p className="text-3xl font-black text-indigo-600">
                      {selectedInitiative.incrementalEnrollment.toLocaleString()}
                      <span className="text-sm font-medium text-slate-400 ml-2">Matrículas</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedInitiative(null)}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Nova Iniciativa Q2</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              
              <form onSubmit={handleAddInitiative} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título da Iniciativa</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Ex: Otimização de SEO para Pós"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={newInitiative.title || ''}
                    onChange={e => setNewInitiative({...newInitiative, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Squad Responsável</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.team}
                      onChange={e => setNewInitiative({...newInitiative, team: e.target.value as Team})}
                    >
                      {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.category}
                      onChange={e => setNewInitiative({...newInitiative, category: e.target.value as Category})}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mês de Entrega</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.month}
                      onChange={e => setNewInitiative({...newInitiative, month: e.target.value as Month})}
                    >
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Matrícula Incremental</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                      value={newInitiative.incrementalEnrollment || ''}
                      onChange={e => setNewInitiative({...newInitiative, incrementalEnrollment: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Ação</label>
                    <div className="flex gap-2">
                      {ACTION_TYPES.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setNewInitiative({...newInitiative, actionType: type})}
                          className={cn(
                            "flex-1 py-2 text-xs font-bold rounded-xl border transition-all",
                            newInitiative.actionType === type 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
                              : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300"
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Máquina de Conversão</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.conversionMachine}
                      onChange={e => setNewInitiative({...newInitiative, conversionMachine: e.target.value as ConversionMachine})}
                    >
                      {CONVERSION_MACHINES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ponto de Contato</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.touchpoint}
                      onChange={e => setNewInitiative({...newInitiative, touchpoint: e.target.value as Touchpoint})}
                    >
                      {TOUCHPOINTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audiência Média (Mês)</label>
                    <input 
                      required
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
                      value={newInitiative.averageAudience || ''}
                      onChange={e => setNewInitiative({...newInitiative, averageAudience: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indicador Primário</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newInitiative.primaryIndicator}
                      onChange={e => setNewInitiative({...newInitiative, primaryIndicator: e.target.value as PrimaryIndicator})}
                    >
                      {PRIMARY_INDICATORS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dependências Intratime</label>
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-32 overflow-y-auto">
                      {DEPENDENCIES.map(d => {
                        const isSelected = newInitiative.dependencies?.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() => {
                              const current = newInitiative.dependencies || [];
                              const next = isSelected 
                                ? current.filter(item => item !== d)
                                : [...current, d];
                              setNewInitiative({...newInitiative, dependencies: next});
                            }}
                            className={cn(
                              "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all text-left",
                              isSelected 
                                ? "bg-indigo-600 text-white" 
                                : "bg-white text-slate-600 border border-slate-100 hover:border-indigo-200"
                            )}
                          >
                            <div className={cn(
                              "w-3 h-3 rounded flex items-center justify-center border",
                              isSelected ? "bg-white border-white" : "bg-slate-50 border-slate-200"
                            )}>
                              {isSelected && <Check className="w-2 h-2 text-indigo-600" />}
                            </div>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Curta</label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={!newInitiative.title || isGeneratingDescription}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {isGeneratingDescription ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      Gerar com IA
                    </button>
                  </div>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Descreva o impacto esperado..."
                    value={newInitiative.description || ''}
                    onChange={e => setNewInitiative({...newInitiative, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200"
                  >
                    Salvar Iniciativa
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

