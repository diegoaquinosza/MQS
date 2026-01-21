# 📍 MQS - Mano, Qual é a Sala?!

> **Disciplina:** Introdução à Programação Web (Projeto Integrador)
> **Status:** 🚀 Finalizado (MVP)
> **Deploy:** [Insira o Link do Vercel/Netlify aqui se houver]

## 1. O Projeto
O **MQS** é uma Aplicação Web *Mobile-First* (SPA) desenvolvida para reduzir a ansiedade acadêmica. O objetivo é eliminar a fricção que estudantes enfrentam para encontrar sua sala e grade horária, substituindo sistemas de login complexos por uma interface de "acesso instantâneo".

### 📸 Screenshots
| Tela Inicial (Onboarding) | Grade Horária (Card) |
|:---:|:---:|
| <img src="./assets/print_home.png" width="300" alt="Tela Inicial"> | <img src="./assets/print_grade.png" width="300" alt="Visualização da Grade"> |
*(Adicione seus prints na pasta assets e ajuste os nomes acima)*

---

## 2. Diferenciais Técnicos & UX
* **Persistência de Contexto:** O sistema utiliza `localStorage` para lembrar o curso e turno do aluno. Ao reabrir o app, ele pula a configuração e vai direto ao que importa ("Warm Start").
* **Design "Anti-Ansiedade":** Interface baseada no *Material Design 3*, utilizando cores frias (Teal/Ice Blue) e feedbacks visuais claros para reduzir a carga cognitiva.
* **Arquitetura Vanilla:** Desenvolvido sem frameworks (React/Vue), garantindo leveza e domínio total do JavaScript ES6+.

---

## 3. Checklist de Conformidade (Rubrica)
Conforme solicitado nas instruções do projeto:

- [x] **Estruturas Básicas:** Uso de `const`/`let`, condicionais e laços.
- [x] **Arrays e Objetos:** Manipulação de estrutura JSON complexa.
- [x] **Métodos de Array:** Aplicação de `.find()` (busca), `.filter()` (validação) e `.map()` (renderização).
- [x] **DOM Dinâmico:** Injeção de HTML via JavaScript (sem *page reload*).
- [x] **Assincronicidade (Fluxo 1):** Uso de `async/await` com `try/catch` para carregar o banco de dados (`db.json`).
- [x] **Assincronicidade (Fluxo 2):** Uso de `.then/.catch` para carregar dicas aleatórias (`tip_of_day.json`).
- [x] **Web Storage:** Persistência de preferências do usuário.
- [x] **API HTML5 Extra:** Funcionalidade de Screenshot com **Canvas API** (via `html2canvas`) e **Web Share API**.

---

## 4. Estrutura de Arquivos

* `index.html`: Tela de Onboarding.
* `grade.html`: Tela de Visualização da Grade.
* `styles.css`: Estilos globais e componentes.
* `home.css`: Estilos específicos da home page.
* `app.js`: Lógica da grade (Async/Await, Renderização).
* `home.js`: Lógica da home (LocalStorage, Validação).
* `db.json`: Banco de dados simulado.
* `tip_of_day.json`: Arquivo auxiliar (segundo fluxo assíncrono).

---

## 5. Limitações e Decisões Técnicas
* **Dados Estáticos:** Como é uma aplicação *Client-Side*, os dados são lidos de um JSON local. Alterações na grade não são salvas em um servidor real.
* **Segurança:** A API `navigator.share` funciona apenas em contextos seguros (HTTPS) ou `localhost`.
* **CORS:** Para o funcionamento correto dos arquivos JSON locais, a aplicação deve ser rodada via servidor HTTP (ex: Live Server), e não diretamente pelo sistema de arquivos.

---

## 6. Como Executar

1.  Baixe este repositório ou descompacte o arquivo ZIP.
2.  Não é necessário `npm install` (Projeto Vanilla).
3.  Abra o arquivo `index.html` em seu navegador preferido.
    * *Dica:* Utilize o "Modo Responsivo" (F12) do navegador para testar a experiência mobile.
    * *Nota:* Para testar o `fetch` do JSON localmente sem erros de CORS, recomenda-se usar uma extensão como "Live Server" ou rodar `npx http-server`.

---

## 7. Declaração de Integridade Acadêmica
Declaro que este código foi desenvolvido majoritariamente por mim, com apoio de ferramentas de IA (Google Gemini) para:
1.  Geração de massa de dados fictícia (`db.json`).
2.  Refinamento de CSS para compatibilidade Cross-Browser.
3.  Revisão de lógica para otimização de laços e condicionais.
Todas as decisões arquiteturais (BEM, escolha de bibliotecas, UX Flow) foram tomadas e validadas manualmente pelo aluno.

---
**Desenvolvido por:** Diego Aquino Souza - IFTO