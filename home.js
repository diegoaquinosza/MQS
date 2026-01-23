document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DO DOM ---
    const form = document.getElementById('selection-form');
    const warmDiv = document.getElementById('warm-welcome');
    
    // Elementos do Warm Start
    const savedCourse = document.getElementById('saved-course');
    const savedDetails = document.getElementById('saved-details');
    const quickBtn = document.getElementById('btn-quick-access');
    const resetBtn = document.getElementById('btn-reset-app');
    
    // NOVOS Elementos da Dica
    const tipTextElement = document.getElementById('warm-tip-text');
    // const tipIconElement = document.getElementById('warm-tip-icon'); // Ícone é fixo por enquanto
    
    // Elementos do Formulário
    const courseInput = document.getElementById('course-input');
    const shiftBtns = document.querySelectorAll('.segment-btn');
    const periodBtns = document.querySelectorAll('.chip-btn');
    const submitBtn = document.getElementById('btn-ver-horarios');
    const feedbackMsg = document.getElementById('form-feedback');

    let userSelection = { course: '', shift: 'matutino', period: '2' };

    const ALLOWED_COURSES = [
        "Sistemas para Internet",
        "sistemas para internet", 
        "Sistemas Para Internet"
    ];

    // ============================================================
    // LÓGICA DE START
    // ============================================================
    const savedData = localStorage.getItem('mqs_user_data');

    if (savedData) {
        const data = JSON.parse(savedData);
        form.classList.add('hidden');
        warmDiv.classList.remove('hidden');
        
        savedCourse.textContent = data.course;
        const shiftFormatted = data.shift.charAt(0).toUpperCase() + data.shift.slice(1);
        savedDetails.textContent = `${data.period}º Período • ${shiftFormatted}`;

    } else {
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');
    }

    // ============================================================
    // INTERAÇÃO
    // ============================================================
    quickBtn.addEventListener('click', () => window.location.href = 'grade.html');

    resetBtn.addEventListener('click', () => {
        localStorage.removeItem('mqs_user_data');
        warmDiv.classList.add('hidden');
        form.classList.remove('hidden');
        courseInput.value = ''; 
        feedbackMsg.classList.add('hidden');
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
    // VALIDAÇÃO
    // ============================================================
    submitBtn.addEventListener('click', () => {
        const courseValue = courseInput.value.trim();
        if (!courseValue) { showError("Por favor, digite o nome do curso!"); return; }

        const isSistemas = ALLOWED_COURSES.includes(courseValue);
        if (!isSistemas) { showError(`O curso "${courseValue}" estará disponível em breve!`); return; }

        if (isSistemas) {
            const isMatutino = userSelection.shift === 'matutino';
            const isSegundoPeriodo = userSelection.period === '2';
            if (!isMatutino || !isSegundoPeriodo) {
                const turnoEscolhido = userSelection.shift.charAt(0).toUpperCase() + userSelection.shift.slice(1);
                showError(`Grade de ${userSelection.period}º ${turnoEscolhido} não cadastrada. Apenas 2º Matutino disponível.`);
                return;
            }
        }

        userSelection.course = courseValue;
        localStorage.setItem('mqs_user_data', JSON.stringify(userSelection));
        window.location.href = 'grade.html';
    });

    function updateVisuals(nodeList, value) {
        nodeList.forEach(btn => {
            if (btn.getAttribute('data-value') === value) {
                btn.classList.add('active');
            } else { btn.classList.remove('active'); }
        });
    }

    function showError(message) {
        feedbackMsg.innerHTML = `<span class="material-symbols-rounded">error</span> ${message}`;
        feedbackMsg.classList.remove('hidden');
        courseInput.style.borderColor = '#C62828';
        form.classList.add('shake-anim');
        setTimeout(() => form.classList.remove('shake-anim'), 500);
    }

    // ============================================================
    // DICA DO DIA (Fluxo B: .then/.catch com JSON Local) [cite: 6]
    // ============================================================
    if (savedData) {
        // Substituindo API externa por arquivo local para garantir funcionamento offline
        fetch('tip_of_day.json')
            .then(response => {
                if (!response.ok) throw new Error('Erro ao ler dicas');
                return response.json();
            })
            .then(data => {
                // Sorteia uma dica aleatória do array
                const randomTip = data.tips[Math.floor(Math.random() * data.tips.length)];
                tipTextElement.textContent = `"${randomTip}"`;
            })
            .catch(err => {
                console.warn('Fallback de dica ativado:', err);
                tipTextElement.textContent = "Mantenha o foco e beba água!";
            });
    }
});