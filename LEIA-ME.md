# Agenda de Doces (PWA)

Arquivos do projeto:
- `index.html` – estrutura das telas
- `style.css` – visual (cores ficam no começo, em `:root`)
- `app.js` – toda a lógica (dados, agenda, conflitos, formulário)
- `manifest.json` – nome, cores e ícones do app instalado
- `sw.js` – service worker (faz o app abrir sem internet)
- `icons/` – ícones 192 e 512 px

## 1. Testar no seu computador
PWA precisa ser servido por um servidor (não funciona abrindo o arquivo direto). Com Python:

    cd pasta-do-projeto
    python -m http.server 8000

Abra http://localhost:8000. No Chrome, F12 > aba Application mostra o manifest e o service worker.

## 2. Publicar de graça (GitHub Pages)
1. Crie um repositório no GitHub (ex.: `agenda-de-doces`) e envie os arquivos:

       git init
       git add .
       git commit -m "primeira versão"
       git branch -M main
       git remote add origin https://github.com/SEU-USUARIO/agenda-de-doces.git
       git push -u origin main

2. No repositório: Settings > Pages > em "Branch" escolha `main` e `/ (root)` > Save.
3. Em alguns minutos o app estará em `https://SEU-USUARIO.github.io/agenda-de-doces/` (HTTPS já incluso).

Alternativas igualmente gratuitas: Netlify ou Cloudflare Pages (arrastar a pasta).

## 3. Instalar no celular
- **Android (Chrome):** abra o link > menu ⋮ > "Instalar app" ou "Adicionar à tela inicial".
- **iPhone (Safari):** abra o link > botão Compartilhar > "Adicionar à Tela de Início".

## 4. Atualizar o app depois de mudar o código
O service worker guarda os arquivos no celular. Sempre que alterar algum arquivo,
troque `VERSION = 'v1'` para `'v2'` (e assim por diante) em `sw.js`. Na próxima vez que o app abrir
com internet, ele baixa a versão nova (pode precisar fechar e abrir o app uma vez).

## 5. Importante saber
- Os dados ficam no `localStorage` do aparelho. Se limpar os dados do navegador ou trocar de celular, eles somem.
  Até o Supabase entrar, evite apagar os dados do site.
- A fonte (Fraunces/DM Sans) vem do Google Fonts na primeira abertura e fica guardada para uso offline.

## Próximos passos sugeridos
1. Usar com pedidos reais por 2 a 3 semanas e anotar o que falta.
2. Adicionar botão "exportar backup" (baixar os dados em JSON).
3. Migrar os dados para o Supabase (tabelas `clientes`, `pedidos`, `compromissos`).
4. Empacotar com Capacitor, se quiser publicar nas lojas ou usar notificações nativas.
