import {
  pgTable,
  serial,
  varchar,
  text,
  date,
  timestamp,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================
// USUÁRIOS DO SISTEMA
// ============================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  cpf: varchar("cpf", { length: 11 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'admin' | 'servidor'
  serverId: uuid("server_id").references(() => servers.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLogin: timestamp("last_login", { withTimezone: true }),
});

// ============================================
// SERVIDORES
// ============================================
export const servers = pgTable("servers", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 11 }).notNull().unique(),
  rgcin: varchar("rgcin", { length: 20 }),
  di: varchar("di", { length: 20 }),
  dtnasc: date("dtnasc"),
  sexo: varchar("sexo", { length: 10 }),
  tel: varchar("tel", { length: 20 }),
  email: varchar("email", { length: 255 }),
  cargo: varchar("cargo", { length: 100 }).notNull(),
  categoria: varchar("categoria", { length: 50 }),
  faixa: varchar("faixa", { length: 50 }),
  nivel: varchar("nivel", { length: 10 }),
  jornada: varchar("jornada", { length: 50 }),
  lotacao: varchar("lotacao", { length: 255 }),
  situacao: varchar("situacao", { length: 50 }).notNull().default("ATIVO"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ATS - ADICIONAL DE TEMPO DE SERVIÇO
// ============================================
export const ats = pgTable("ats", {
  id: uuid("id").primaryKey().defaultRandom(),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 50 }).notNull(), // '1º ATS', '2º ATS', etc.
  vigencia: date("vigencia").notNull(),
  doe: date("doe"),
  ato: varchar("ato", { length: 255 }),
  ultimo: boolean("ultimo").notNull().default(false),
  proximaPrevisao: date("proxima_previsao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// SEXTA-PARTE
// ============================================
export const sextaParte = pgTable("sexta_parte", {
  id: uuid("id").primaryKey().defaultRandom(),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  vigencia: date("vigencia").notNull(),
  doe: date("doe"),
  ato: varchar("ato", { length: 255 }),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// EVOLUÇÃO FUNCIONAL
// ============================================
export const evolucaoFuncional = pgTable("evolucao_funcional", {
  id: uuid("id").primaryKey().defaultRandom(),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 50 }).notNull(), // '1ª Evolução', '2ª Evolução', etc.
  nivelAnterior: varchar("nivel_anterior", { length: 10 }).notNull(),
  nivelAtual: varchar("nivel_atual", { length: 10 }).notNull(),
  vigencia: date("vigencia").notNull(),
  doe: date("doe"),
  ato: varchar("ato", { length: 255 }),
  ultimo: boolean("ultimo").notNull().default(false),
  proximaPrevisao: date("proxima_previsao"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// CERTIDÕES DE LICENÇA-PRÊMIO
// ============================================
export const certidoes = pgTable("certidoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  numero: varchar("numero", { length: 50 }).notNull(),
  ano: integer("ano").notNull(),
  dataInicial: date("data_inicial").notNull(),
  dataFinal: date("data_final").notNull(),
  doe: date("doe"),
  ato: varchar("ato", { length: 255 }),
  saldoInicial: integer("saldo_inicial").notNull().default(90),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// FRUIÇÃO DE LICENÇA-PRÊMIO
// ============================================
export const fruicoes = pgTable("fruicoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  certiaoId: uuid("certido_id")
    .notNull()
    .references(() => certidoes.id, { onDelete: "cascade" }),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  dias: integer("dias").notNull(),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  dataAutorizacao: date("data_autorizacao").notNull(),
  saldoAnterior: integer("saldo_anterior").notNull(),
  saldoAtual: integer("saldo_atual").notNull(),
  cancelada: boolean("cancelada").notNull().default(false),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// PECÚNIA DE LICENÇA-PRÊMIO
// ============================================
export const pecunias = pgTable("pecunias", {
  id: uuid("id").primaryKey().defaultRandom(),
  certiaoId: uuid("certido_id")
    .notNull()
    .references(() => certidoes.id, { onDelete: "cascade" }),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  dias: integer("dias").notNull().default(30),
  ano: integer("ano").notNull(),
  dataAutorizacao: date("data_autorizacao"),
  identificador: varchar("identificador", { length: 255 }),
  saldoAnterior: integer("saldo_anterior").notNull(),
  saldoAtual: integer("saldo_atual").notNull(),
  cancelada: boolean("cancelada").notNull().default(false),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// SOLICITAÇÕES DOS SERVIDORES
// ============================================
export const solicitacoes = pgTable("solicitacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  serverId: uuid("server_id")
    .notNull()
    .references(() => servers.id, { onDelete: "cascade" }),
  tipo: varchar("tipo", { length: 50 }).notNull(), // 'dúvida', 'correção', 'contestação'
  modulo: varchar("modulo", { length: 50 }).notNull(),
  descricao: text("descricao").notNull(),
  situacao: varchar("situacao", { length: 50 }).notNull().default("recebida"),
  resposta: text("resposta"),
  respondidoPor: uuid("respondido_por").references(() => users.id),
  respondidoEm: timestamp("respondido_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// AUDITORIA
// ============================================
export const auditoria = pgTable("auditoria", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  serverId: uuid("server_id").references(() => servers.id),
  acao: varchar("acao", { length: 50 }).notNull(),
  modulo: varchar("modulo", { length: 50 }).notNull(),
  registroId: uuid("registro_id"),
  detalhes: text("detalhes"),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// RELACIONAMENTOS
// ============================================
export const serversRelations = relations(servers, ({ one, many }) => ({
  user: one(users, {
    fields: [servers.id],
    references: [users.serverId],
  }),
  ats: many(ats),
  sextaParte: many(sextaParte),
  evolucaoFuncional: many(evolucaoFuncional),
  certidoes: many(certidoes),
  fruicoes: many(fruicoes),
  pecunias: many(pecunias),
  solicitacoes: many(solicitacoes),
}));

export const certidoesRelations = relations(certidoes, ({ one, many }) => ({
  server: one(servers, {
    fields: [certidoes.serverId],
    references: [servers.id],
  }),
  fruicoes: many(fruicoes),
  pecunias: many(pecunias),
}));

export const fruicoesRelations = relations(fruicoes, ({ one }) => ({
  certiao: one(certidoes, {
    fields: [fruicoes.certiaoId],
    references: [certidoes.id],
  }),
  server: one(servers, {
    fields: [fruicoes.serverId],
    references: [servers.id],
  }),
}));

export const pecuniasRelations = relations(pecunias, ({ one }) => ({
  certiao: one(certidoes, {
    fields: [pecunias.certiaoId],
    references: [certidoes.id],
  }),
  server: one(servers, {
    fields: [pecunias.serverId],
    references: [servers.id],
  }),
}));
