/**
 * Controlador principal da Home.
 * Gerencia a inicialização da aplicação, alternância entre estados (Warm Start/Formulário),
 * validação de entradas e interações de UI.
 */
document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // SELEÇÃO DE ELEMENTOS DO DOM
    // ============================================================
    
    // Containers Principais
    const form = document.getElementById('selection-form');
    const warmDiv = document.getElementById('warm-welcome');

    // Componentes do Warm Start (Estado Logado)
    const savedCourse = document.getElementById('saved-course');
    const savedDetails = document.getElementById('saved-details');
    const quickBtn = document.getElementById('btn-quick-access');
    const resetBtn = document.getElementById('btn-reset-app');
    const tipTextElement = document.getElementById('warm-tip-text');

    // Componentes do Formulário (Novo Acesso)
    const courseInput = document.getElementById('course-input');
    const shiftBtns = document.querySelectorAll('.choice-chip');
    const periodBtns = document.querySelectorAll('.chip-btn');
    const submitBtn = document.getElementById('btn-ver-horarios');
    const feedbackMsg = document.getElementById('form-feedback');

    // Componentes de Navegação (Scroll Horizontal)
    const scrollContainer = document.getElementById('period-selector');
    const btnLeft = document.getElementById('btn-scroll-left');
    const btnRight = document.getElementById('btn-scroll-right');

    /**
     * Gerencia a visibilidade das setas de navegação horizontal.
     * Calcula se o conteúdo excede a largura do container e oculta setas nos limites.
     */
    const updateMiniArrows = () => {
        if (!scrollContainer || !btnLeft || !btnRight) return;
        
        const scrollWidth = scrollContainer.scrollWidth;
        const clientWidth = scrollContainer.offsetWidth;
        const scrollLeft = scrollContainer.scrollLeft;

        // Verifica se há conteúdo suficiente para rolar
        const isScrollable = scrollWidth > (clientWidth + 10);

        if (!isScrollable) {
            btnLeft.classList.add('hidden');
            btnRight.classList.add('hidden');
        } else {
            // Controle da seta esquerda (início)
            if (scrollLeft <= 5) btnLeft.classList.add('hidden');
            else btnLeft.classList.remove('hidden');

            // Controle da seta direita (fim)
            if (scrollLeft >= (scrollWidth - clientWidth - 5)) btnRight.classList.add('hidden');
            else btnRight.classList.remove('hidden');
        }
    };

    // Estado local da seleção do usuário
    let userSelection = { course: '', shift: null, period: null };

    const ALLOWED_COURSES = [
        "Sistemas para Internet",
        "sistemas para internet",
        "Sistemas Para Internet"
    ];

    // ============================================================
    // LÓGICA DE INICIALIZAÇÃO E ESTADO
    // ============================================================
    const savedData = localStorage.getItem('mqs_user_data');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verifica se a ação é uma nova busca explícita via URL
    const forceNewSearch = urlParams.get('action') === 'search';

    // Decide entre exibir o Warm Start ou o Formulário Limpo
    if (savedData && !forceNewSearch) {
        const data = JSON.parse(savedData);
        form.classList.add('hidden');
        warmDiv.classList.remove('hidden');

        savedCourse.textContent = data.course;
        const shiftFormatted = data.shift.charAt(0).toUpperCase() + data.shift.slice(1);
        savedDetails.textContent = `${data.period}º Período • ${shiftFormatted}`;

    } else {
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');

        // Limpa a URL para evitar loop de estado ao recarregar a página
        if (forceNewSearch) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // ============================================================
    // INTERAÇÕES DE USUÁRIO
    // ============================================================
    
    quickBtn.addEventListener('click', () => window.location.href = 'grade.html');

    resetBtn.addEventListener('click', () => {
        // Limpeza total do estado e persistência
        localStorage.removeItem('mqs_user_data');
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');

        courseInput.value = '';
        userSelection = { course: '', shift: null, period: null };
        feedbackMsg.classList.add('hidden');

        shiftBtns.forEach(btn => btn.classList.remove('active'));
        periodBtns.forEach(btn => btn.classList.remove('active'));
        
        setTimeout(updateMiniArrows, 50);
    });

    shiftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.shift = btn.getAttribute('data-value');
            updateVisuals(shiftBtns, userSelection.shift);
        });
    });

    periodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userSelection.period = btn.getAttribute('data-value');
            updateVisuals(periodBtns, userSelection.period);
        });
    });

    // ============================================================
    // VALIDAÇÃO E SUBMISSÃO
    // ============================================================
    submitBtn.addEventListener('click', () => {
        const courseValue = courseInput.value.trim();
        
        // Validações básicas de preenchimento
        if (!courseValue) { showError("Por favor, digite o nome do curso!"); return; }

        if (!userSelection.shift || !userSelection.period) {
            showError("Por favor, selecione o turno e o período.");
            return;
        }

        // Validação de Curso Permitido (Hardcoded MVP)
        const isSistemas = ALLOWED_COURSES.includes(courseValue);
        if (!isSistemas) { showError(`O curso "${courseValue}" estará disponível em breve!`); return; }

        // Validação de Grade Específica (Regra de Negócio Temporária)
        if (isSistemas) {
            const periodo = parseInt(userSelection.period);

            // 1. Trava de Período (Sistemas só vai até o 6º)
            if (periodo > 6) {
                showError(`O curso de Sistemas só vai até o 6º período!`);
                return;
            }
        }

        // Persistência e Redirecionamento
        userSelection.course = courseValue;
        localStorage.setItem('mqs_user_data', JSON.stringify(userSelection));
        window.location.href = 'grade.html';
    });

    /**
     * Atualiza o estado visual (classe 'active') de um grupo de botões.
     * @param {NodeList} nodeList - Lista de elementos DOM a serem iterados.
     * @param {string} value - O valor selecionado atualmente.
     */
    function updateVisuals(nodeList, value) {
        nodeList.forEach(btn => {
            if (btn.getAttribute('data-value') === value) {
                btn.classList.add('active');
            } else { btn.classList.remove('active'); }
        });
    }

    /**
     * Exibe feedback visual de erro e aplica animação de "shake".
     * @param {string} message - Mensagem a ser exibida.
     */
    function showError(message) {
        feedbackMsg.innerHTML = `<span class="material-symbols-rounded">error</span> ${message}`;
        feedbackMsg.classList.remove('hidden');
        courseInput.style.borderColor = '#C62828';
        form.classList.add('shake-anim');
        setTimeout(() => form.classList.remove('shake-anim'), 500);
    }

    // ============================================================
    // FUNCIONALIDADE: DICA DO DIA
    // ============================================================
    if (savedData) {
        // Fetch em arquivo local para garantir funcionamento offline/PWA
        fetch('tip_of_day.json')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao ler dicas');
                return response.json();
            })
            .then(data => {
                const randomTip = data.tips[Math.floor(Math.random() * data.tips.length)];
                tipTextElement.textContent = `"${randomTip}"`;
            })
            .catch(err => {
                console.warn('Fallback de dica ativado:', err);
                tipTextElement.textContent = "Mantenha o foco e beba água!";
            });
    }

    // ============================================================
    // LISTENERS DE NAVEGAÇÃO E UX
    // ============================================================
    if (scrollContainer && btnLeft && btnRight) {
        btnLeft.addEventListener('click', () => scrollContainer.scrollBy({ left: -200, behavior: 'smooth' }));
        btnRight.addEventListener('click', () => scrollContainer.scrollBy({ left: 200, behavior: 'smooth' }));

        scrollContainer.addEventListener('scroll', updateMiniArrows);
        window.addEventListener('resize', updateMiniArrows);

        // Verificações em múltiplos momentos para garantir renderização correta
        updateMiniArrows();
        setTimeout(updateMiniArrows, 100);
        setTimeout(updateMiniArrows, 500);
        window.addEventListener('load', updateMiniArrows);
    }

    /**
     * Fix para UX Mobile: Retorna o scroll ao topo quando o teclado virtual fecha.
     * Evita que o layout fique "quebrado" ou deslocado em dispositivos iOS/Android.
     */
    const allInputs = document.querySelectorAll('input');

    allInputs.forEach(input => {
        input.addEventListener('blur', () => {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 200);
        });
    });
});