document.addEventListener('DOMContentLoaded', () => {
    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const addTaskBtn = document.getElementById('add-task-btn');
    const columns = document.querySelectorAll('.tasks-container');

    // Modal de Edição/Criação
    const taskModal = document.getElementById('task-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const taskForm = document.getElementById('task-form');
    const modalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskDeadlineInput = document.getElementById('task-deadline');
    const taskStatusInput = document.getElementById('task-status');
    const taskProgressInput = document.getElementById('task-progress');
    const progressValueSpan = document.getElementById('progress-value');

    // Modal de Detalhes
    const detailsModal = document.getElementById('details-modal');
    const detailsCloseBtn = document.getElementById('details-close-btn');
    const detailsTitle = document.getElementById('details-title');
    const detailsDescription = document.getElementById('details-description');
    const detailsDeadline = document.getElementById('details-deadline');
    const detailsProgressBar = document.getElementById('details-progress-bar');
    const detailsProgressText = document.getElementById('details-progress-text');


    // --- ESTADO DA APLICAÇÃO ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // --- FUNÇÕES ---

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        columns.forEach(column => column.innerHTML = '');

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = `task-card status-${task.status}`;
            taskCard.draggable = true;
            taskCard.dataset.id = task.id;

            const deadlineInfo = getDeadlineInfo(task.deadline);

            taskCard.innerHTML = `
                <h3>${task.name}</h3>
                <p>${task.description || 'Sem descrição.'}</p>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${task.progress}%;"></div>
                </div>
                <div class="task-footer">
                    <span class="task-deadline">
                        <i class="fas fa-clock"></i> ${deadlineInfo.text}
                    </span>
                    <div class="task-actions">
                        <button class="edit-btn" title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" title="Apagar"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
            document.querySelector(`.tasks-container[data-status="${task.status}"]`).appendChild(taskCard);
        });

        addEventListenersToCards();
    };

    const getDeadlineInfo = (deadlineString) => {
        if (!deadlineString) return { text: 'Sem prazo' };
        
        const deadline = new Date(deadlineString + 'T23:59:59');
        const today = new Date();
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `Atrasado ${Math.abs(diffDays)} dia(s)` };
        if (diffDays === 0) return { text: 'Termina hoje!' };
        if (diffDays <= 3) return { text: `Faltam ${diffDays} dia(s)` };
        return { text: `Faltam ${diffDays} dia(s)` };
    };
    
    const addEventListenersToCards = () => {
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);

            // Abre detalhes ao clicar no card
            card.addEventListener('click', (e) => {
                openDetailsModal(card.dataset.id);
            });

            const editBtn = card.querySelector('.edit-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            
            // Impede que o clique nos botões propague para o card
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openModal(card.dataset.id);
            });
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(card.dataset.id);
            });
        });
    };

    // --- LÓGICA DO MODAL DE EDIÇÃO/CRIAÇÃO ---

    const openModal = (taskId = null) => {
        taskForm.reset();
        if (taskId) {
            const task = tasks.find(t => t.id === taskId);
            modalTitle.textContent = 'Editar Projeto';
            taskIdInput.value = task.id;
            taskNameInput.value = task.name;
            taskDescriptionInput.value = task.description;
            taskDeadlineInput.value = task.deadline;
            taskStatusInput.value = task.status;
            taskProgressInput.value = task.progress;
            progressValueSpan.textContent = `${task.progress}%`;
        } else {
            modalTitle.textContent = 'Adicionar Novo Projeto';
            taskIdInput.value = '';
            taskProgressInput.value = 0;
            progressValueSpan.textContent = '0%';
            taskStatusInput.value = 'ideas'; // Padrão para novas tarefas
        }
        taskModal.classList.add('show');
    };

    const closeModal = () => {
        taskModal.classList.remove('show');
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const id = taskIdInput.value;
        const taskData = {
            name: taskNameInput.value.trim(),
            description: taskDescriptionInput.value.trim(),
            deadline: taskDeadlineInput.value,
            status: taskStatusInput.value,
            progress: parseInt(taskProgressInput.value, 10),
        };

        if (id) {
            const taskIndex = tasks.findIndex(t => t.id === id);
            tasks[taskIndex] = { ...tasks[taskIndex], ...taskData };
        } else {
            tasks.push({
                id: Date.now().toString(),
                ...taskData
            });
        }

        saveTasks();
        renderTasks();
        closeModal();
    };

    const deleteTask = (taskId) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    };
    
    // --- LÓGICA DO MODAL DE DETALHES ---

    const openDetailsModal = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        detailsTitle.textContent = task.name;
        detailsDescription.textContent = task.description || "Este projeto não possui uma descrição detalhada.";
        detailsDeadline.innerHTML = `<i class="fas fa-calendar-alt"></i> Prazo: ${task.deadline ? new Date(task.deadline + 'T23:59:59').toLocaleDateString('pt-BR') : 'Não definido'}`;
        detailsProgressBar.style.width = `${task.progress}%`;
        detailsProgressText.textContent = `${task.progress}% concluído`;
        detailsModal.classList.add('show');
    };
    
    const closeDetailsModal = () => {
        detailsModal.classList.remove('show');
    };

    // --- LÓGICA DE DRAG AND DROP ---
    let draggedItemId = null;

    function handleDragStart() {
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
            if (task && task.status !== newStatus) {
                task.status = newStatus;
                saveTasks();
                renderTasks();
            }
        });
    });

    // --- EVENT LISTENERS INICIAIS ---
    addTaskBtn.addEventListener('click', () => openModal());
    taskProgressInput.addEventListener('input', (e) => {
        progressValueSpan.textContent = `${e.target.value}%`;
    });
    
    // Listeners para fechar modais
    modalCloseBtn.addEventListener('click', closeModal);
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) closeModal();
    });
    detailsCloseBtn.addEventListener('click', closeDetailsModal);
    detailsModal.addEventListener('click', (e) => {
        if (e.target === detailsModal) closeDetailsModal();
    });

    taskForm.addEventListener('submit', handleFormSubmit);

    // --- INICIALIZAÇÃO ---
    renderTasks();
});
