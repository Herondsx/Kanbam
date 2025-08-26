// --- DOCUMENTAÇÃO DO SCRIPT ---
// Este script gerencia um quadro Kanban interativo.
// Funcionalidades:
// 1. Adicionar, editar e excluir projetos (tarefas).
// 2. Mover tarefas entre colunas (A Fazer, Em Andamento, Concluído) com drag-and-drop.
// 3. Salvar o estado do quadro no Local Storage do navegador para persistência de dados.
// 4. Calcular e exibir o status do prazo (normal, aviso, perigo).

document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const addTaskBtn = document.getElementById('add-task-btn');
    const modal = document.getElementById('task-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const columns = document.querySelectorAll('.tasks-container');

    // --- ESTADO DA APLICAÇÃO ---
    // Carrega as tarefas do Local Storage ou inicia um array vazio.
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- FUNÇÕES ---

    /**
     * Salva o array de tarefas no Local Storage.
     * Converte o array de objetos para uma string JSON.
     */
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    /**
     * Renderiza todas as tarefas no quadro Kanban.
     * Limpa as colunas e recria os cartões de tarefa a partir do array 'tasks'.
     */
    const renderTasks = () => {
        // Limpa todas as colunas antes de renderizar
        columns.forEach(column => column.innerHTML = '');

        // Cria e insere o cartão para cada tarefa
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.draggable = true;
            taskCard.dataset.id = task.id;

            const deadlineInfo = getDeadlineInfo(task.deadline);
            taskCard.classList.add(deadlineInfo.class);

            taskCard.innerHTML = `
                <h3>${task.name}</h3>
                <p>${task.description}</p>
                <div class="task-footer">
                    <span class="task-deadline">
                        <i class="fas fa-clock ${deadlineInfo.class}"></i> ${deadlineInfo.text}
                    </span>
                    <div class="task-actions">
                        <button class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;

            // Adiciona o cartão à coluna correta
            document.querySelector(`.tasks-container[data-status="${task.status}"]`).appendChild(taskCard);
        });

        // Adiciona os event listeners novamente após renderizar
        addEventListenersToCards();
    };

    /**
     * Calcula a diferença de dias para o prazo e retorna uma classe e texto.
     * @param {string} deadlineString - A data do prazo no formato 'YYYY-MM-DD'.
     * @returns {object} - Um objeto com a classe CSS e o texto para o prazo.
     */
    const getDeadlineInfo = (deadlineString) => {
        if (!deadlineString) return { class: 'deadline-normal', text: 'Sem prazo' };
        
        const deadline = new Date(deadlineString + 'T23:59:59'); // Considera o fim do dia
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { class: 'deadline-danger', text: `Atrasado ${Math.abs(diffDays)} dia(s)` };
        }
        if (diffDays === 0) {
            return { class: 'deadline-danger', text: 'Termina hoje!' };
        }
        if (diffDays <= 3) {
            return { class: 'deadline-warning', text: `Faltam ${diffDays} dia(s)` };
        }
        return { class: 'deadline-normal', text: `Faltam ${diffDays} dia(s)` };
    };
    
    /**
     * Adiciona os event listeners para os botões de editar/excluir e para o drag-and-drop.
     */
    const addEventListenersToCards = () => {
        const taskCards = document.querySelectorAll('.task-card');
        taskCards.forEach(card => {
            // Drag and Drop
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);

            // Botões
            card.querySelector('.edit-btn').addEventListener('click', () => openModal(card.dataset.id));
            card.querySelector('.delete-btn').addEventListener('click', () => deleteTask(card.dataset.id));
        });
    };

    /**
     * Abre o modal, seja para criar uma nova tarefa ou editar uma existente.
     * @param {string|null} taskId - O ID da tarefa a ser editada, ou null para criar uma nova.
     */
    const openModal = (taskId = null) => {
        taskForm.reset();
        if (taskId) {
            const task = tasks.find(t => t.id === taskId);
            modalTitle.textContent = 'Editar Projeto';
            taskIdInput.value = task.id;
            taskNameInput.value = task.name;
            taskDescriptionInput.value = task.description;
            taskDeadlineInput.value = task.deadline;
        } else {
            modalTitle.textContent = 'Adicionar Novo Projeto';
            taskIdInput.value = '';
        }
        modal.classList.add('show');
    };

    /**
     * Fecha o modal.
     */
    const closeModal = () => {
        modal.classList.remove('show');
    };

    /**
     * Lida com o envio do formulário do modal (criar/editar tarefa).
     * @param {Event} e - O evento de submit do formulário.
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const taskData = {
            name: taskNameInput.value,
            description: taskDescriptionInput.value,
            deadline: taskDeadlineInput.value,
        };

        if (id) {
            // Editar tarefa existente
            const taskIndex = tasks.findIndex(t => t.id === id);
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        } else {
            // Criar nova tarefa
            tasks.push({
                id: Date.now().toString(),
                status: 'todo', // Novas tarefas sempre começam em "A Fazer"
                ...taskData
            });
        }

        saveTasks();
        renderTasks();
        closeModal();
    };

    /**
     * Exclui uma tarefa.
     * @param {string} taskId - O ID da tarefa a ser excluída.
     */
    const deleteTask = (taskId) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    };

    // --- LÓGICA DE DRAG AND DROP ---
    let draggedItemId = null;

    function handleDragStart(e) {
        draggedItemId = this.dataset.id;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedItemId = null;
    }

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });
        column.addEventListener('dragleave', () => {
            column.classList.remove('drag-over');
        });
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            const newStatus = column.dataset.status;
            const task = tasks.find(t => t.id === draggedItemId);
            if (task) {
                task.status = newStatus;
                saveTasks();
                renderTasks();
            }
        });
    });

    // --- EVENT LISTENERS INICIAIS ---
    addTaskBtn.addEventListener('click', () => openModal());
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(); // Fecha se clicar fora do conteúdo
    });
    taskForm.addEventListener('submit', handleFormSubmit);

    // --- INICIALIZAÇÃO ---
    renderTasks();
});
