# 🚀 Deploy na Vercel - Instruções

## ⚠️ PROBLEMA IDENTIFICADO

O erro "This page couldn't load" ocorre porque as **variáveis de ambiente não estão configuradas na Vercel**.

## 🔧 SOLUÇÃO

### 1. Configurar Variáveis de Ambiente na Vercel

Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres.rcolvoivlpcjffghzzmi:JoCa1506Sijklm@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

JWT_SECRET=gerar-um-secret-seguro-para-producao
```

### 2. Deploy Novamente

Após adicionar as variáveis de ambiente:
1. Vá para: https://vercel.com/dashboard → Seu Projeto → Deployments
2. Clique em "Redeploy" no último deployment
3. Ou faça um novo commit no GitHub

### 3. Verificar Tabelas no Supabase

Certifique-se de que todas as tabelas foram criadas no Supabase:
- users
- servers
- ats
- sexta_parte
- evolucao_funcional
- certidoes
- fruicoes
- pecunias
- solicitacoes
- auditoria

Se alguma tabela faltar, execute o script SQL no Supabase SQL Editor.

## 📝 VARIÁVEIS DE AMBIENTE NECESSÁRIAS

| Variável | Valor | Descrição |
|----------|-------|-----------|
| `DATABASE_URL` | URL do Supabase | Conexão com banco de dados |
| `JWT_SECRET` | String segura | Secret para tokens JWT |

## 🔒 SEGURANÇA

⚠️ **IMPORTANTE**: Na produção, gere um JWT_SECRET seguro:

```bash
# Gerar um secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use o valor gerado como JWT_SECRET na Vercel.

## ✅ CHECKLIST DE DEPLOY

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Tabelas criadas no Supabase
- [ ] Deploy realizado após configuração
- [ ] Testar login administrativo
- [ ] Testar login de servidor
- [ ] Testar todas as páginas

## 🆘 TROUBLESHOOTING

### Erro: "This page couldn't load"
- Verifique se DATABASE_URL está configurada
- Verifique se as tabelas existem no banco
- Verifique logs de erro na Vercel

### Erro: "Token inválido"
- Verifique se JWT_SECRET está configurado
- Limpe cache do navegador

### Erro: "Tabela não existe"
- Execute o script SQL no Supabase
- Verifique nomes das tabelas
