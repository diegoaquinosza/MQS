# 📍 MQS - Mano, Qual é a Sala?!

> **Disciplina:** Introdução à Programação Web (Projeto Integrador)
> **Status:** 🚀 Finalizado (MVP)
> **Deploy:** [https://diegoaquinosza.github.io/MQS/]

## 1. O Projeto
O **MQS** é uma Aplicação Web *Mobile-First* desenvolvida com foco em **Eficiência de UX** e redução de carga cognitiva. O objetivo central é eliminar a "fricção tecnológica" que estudantes enfrentam para acessar sua grade horária, substituindo portais burocráticos por uma interface de acesso instantâneo.

**📉 O Problema:**
A desproporção entre esforço e resultado nos sistemas acadêmicos tradicionais. Para responder à simples pergunta *"Onde é a minha aula agora?"*, o aluno enfrenta barreiras desnecessárias: logins repetitivos, menus densos e interfaces não responsivas, o que gera atrasos e ansiedade.

**🟢 A Solução:**
Um facilitador logístico que atua como um "colega digital". Através de persistência de dados local, o MQS memoriza o contexto do aluno e entrega a informação da sala em segundos, sem burocracia.

### 📸 Screenshots
| Tela Inicial (Onboarding) | Grade Horária (Card) |
|:---:|:---:|
| <img src="./assets/print_home.png" width="300" alt="Tela Inicial"> | <img src="./assets/print_grade.png" width="300" alt="Visualização da Grade"> |

---

## 2. Diferenciais Técnicos & UX
O projeto não foca apenas em código, mas na experiência do usuário (UX):
* **Lei de Hick:** Redução de opções na tela inicial para acelerar a decisão.
* **Persistência de Contexto:** O sistema utiliza `localStorage` para lembrar o curso e turno do aluno. Ao reabrir o app, ele pula a configuração e vai direto ao que importa ("Warm Start").
* **Design "Anti-Ansiedade":** Interface baseada no *Material Design 3 Expressive*, utilizando cores frias (Teal/Ice Blue) e feedbacks visuais claros para reduzir a carga cognitiva.
* **Arquitetura Vanilla:** Desenvolvido sem frameworks (React/Vue), garantindo leveza e domínio total do JavaScript ES6+.

---

## 3. Funcionalidades Chave
1.  **Onboarding Inteligente:** Filtros de Curso/Turno/Período com UX otimizada (Scroll horizontal e Segmented Buttons).
2.  **Dashboard "Zen":** Visualização clara da aula atual com destaque visual, focada na redução de ansiedade.
3.  **Toggle View:** Alternância fluida entre visualização Vertical (Timeline mobile) e Horizontal (Grade completa).
4.  **Snap & Share:** Geração automática de uma imagem (PNG) da grade horária para compartilhamento via WhatsApp/Galeria.
5.  **Warm Start (Persistência):** O App memoriza o contexto do aluno via `localStorage`, carregando a grade instantaneamente em acessos futuros sem necessidade de reconfiguração.

---

## 4. Stack Tecnológico & Ferramentas
Este projeto foi construído seguindo a metodologia **"Vanilla First"**, garantindo performance e domínio da linguagem sem dependência de frameworks.

* **Core (O Código):** HTML5 Semântico, CSS3 (Variáveis, Flexbox, Grid, BEM) e JavaScript (ES6+).
* **Bibliotecas:** `html2canvas` (Integração pontual para funcionalidade de screenshot).
* **Design & Prototipação:**
    * **Figma:** Mockups de alta fidelidade e definição do Design System.
    * **Ferramentas de Ideação (AI):** Uso de Stitch/AI Studio para *brainstorming* de fluxos de usuário.
* **Ambiente de Desenvolvimento (IDE):** VS Code
* **Apoio Técnico (Pair Programming):** Google Gemini.
    * *Função:* Atuou na revisão de sintaxe, otimização de queries (ex: métodos de array) e explicação de conceitos avançados, simulando um ambiente de *Code Review* profissional.

---

## 5. Mapeamento Técnico (Conformidade com a Rubrica)

Este projeto foi construído com **JavaScript Vanilla (ES6+)**, HTML5 Semântico e CSS3 Moderno, atendendo rigorosamente aos requisitos:

### ✅ A. Estruturas e Lógica de Arrays
Uso intensivo de métodos de Array para manipulação de dados no arquivo `app.js`:
1.  **`.find()`**: Utilizado para localizar o Curso específico dentro do banco de dados gigante (`db.json`).
2.  **`.filter()`**: Utilizado para higienizar a grade, removendo dias que não possuem aulas cadastradas antes da renderização.
3.  **`.map()`**: Utilizado para transformar os dados brutos (JSON) em componentes visuais (HTML Cards) na tela.

### ✅ B. Assincronicidade (Dois Fluxos Distintos)
Conforme exigido, o projeto implementa duas estratégias de consumo de dados:
* **Fluxo 1 (`async/await` com `try/catch`):** Implementado no `app.js` (`fetchSchedule`) para buscar os dados críticos da grade (`db.json`). É robusto e trata erros de conexão.
* **Fluxo 2 (`.then/.catch`):** Implementado no `home.js`. Busca o arquivo `tip_of_day.json` para exibir uma frase motivacional aleatória. Se falhar, exibe uma frase padrão (fallback).

### ✅ C. Persistência de Dados
* **Web Storage:** O objeto `userContext` (Curso, Turno, Período) é salvo no `localStorage`. Isso permite que a aplicação mantenha o estado entre sessões, simulando a experiência de um aplicativo nativo.

### ✅ D. API HTML5 Extra
* **Web Share API + Canvas:** Implementação da funcionalidade "Compartilhar Grade". O app converte a grade HTML em uma imagem PNG (usando `html2canvas`) e invoca o compartilhamento nativo do celular (WhatsApp, Instagram, etc.).

---

## 6. Estrutura de Arquivos
A arquitetura segue o princípio de Separação de Preocupações (SoC):

* `index.html`: Interface de Onboarding (Formulário).
* `grade.html`: Interface de Visualização (Grade).
* `assets/`: Imagens e ícones.
* `css/`:
    * `styles.css`: Design System global e componentes da grade.
    * `home.css`: Estilização específica da Home.
* `js/`:
    * `app.js`: Motor da grade (Lógica complexa, Async/Await).
    * `home.js`: Controlador da Home (Validação, LocalStorage).
* `data/`:
    * `db.json`: Banco de dados relacional simulado (Cursos -> Turnos -> Períodos).
    * `tip_of_day.json`: Micro-serviço de dados para frases.

---

## 7. Decisões Técnicas e Limitações Conhecidas

* **Arquitetura de Dados (Mock):** O projeto adota uma arquitetura *Client-Side* pura. Para simular o consumo de uma API real sem a complexidade de um Back-End, utilizamos arquivos JSON locais (`db.json`) como fonte de dados.
    * *Implicação:* A aplicação opera em modo de "Somente Leitura" (Read-Only) para a grade. Alterações nos dados exigem edição direta no código-fonte.

* **Escopo de Persistência:** Para eliminar a barreira de login (fricção), optamos por não utilizar autenticação de usuário. A persistência de estado (Curso/Turno escolhidos) é gerenciada exclusivamente via `localStorage` no navegador do dispositivo.

* **Restrições de Segurança (CORS & HTTPS):**
    * **CORS:** O método `fetch` para arquivos locais é bloqueado por segurança em navegadores modernos se aberto via protocolo de arquivo (`file://`). A aplicação necessita de um servidor HTTP local (como o Live Server) para funcionar corretamente.
    * **Web Share API:** A funcionalidade de compartilhamento nativo depende de contextos seguros (HTTPS) ou `localhost`.

---

## 8. Como Executar
Devido às políticas de segurança dos navegadores (CORS) para requisições `fetch` locais:

1.  Baixe o código fonte.
2.  Não abra diretamente pelo arquivo (file://).
3.  Utilize um servidor local. Se tiver o VS Code instalado:
    * Instale a extensão **Live Server**.
    * Clique em "Go Live" no canto inferior direito.
4.  Ou via terminal (Node.js):
    ```bash
    npx http-server .

---

## 9. Declaração de Integridade Acadêmica e Autoria
Declaro que este código foi desenvolvido majoritariamente por mim. Ferramentas de Inteligência Artificial (Google Gemini) foram utilizadas de forma ética, atuando estritamente como **Tutor Digital e Apoio à Depuração** para:

1.  **Análise de Erros e Bugs:** Auxílio na identificação e correção de falhas de sintaxe ou lógica em trechos específicos do código.
2.  **Conceituação Técnica:** Explicação de novos conceitos e padrões de implementação (como o uso correto de `async/await` e manipulação do DOM) para aplicação no projeto.

**Autoria de Design e Dados:**
Ressalto que toda a **Identidade Visual (UI/UX)** foi desenhada manualmente pelo aluno (via Figma e outras ferramentas) e que a **Base de Dados (`db.json`)** foi construída com dados reais da grade horária do curso, sem geração automática.

Todas as decisões arquiteturais e a implementação final foram validadas pelo aluno, garantindo a originalidade do trabalho.

---
**Desenvolvido por:** Diego Aquino Souza