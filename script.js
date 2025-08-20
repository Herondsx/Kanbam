// --- Simulação de digitação ---
const prompts = {
    1: 'Com base na planilha de "Open Issues" em anexo, identifique os 3 itens mais críticos (considerando prioridade e prazo) e gere um rascunho de e-mail em português para a equipe, cobrando ação.',
    2: 'Preciso criar uma apresentação para la Ata de Design Review do projeto "Linha de Montagem Final". Use o template padrão da Comau para estruturar os slides. Para o slide de "Arquitetura da Solução", gere uma imagem conceitual de uma célula robótica com esteiras e um robô de 6 eixos.',
    3: 'Faça uma pesquisa comparativa. Primeiro, compare o software "Process Simulate v23" com a nova versão "v24", destacando 3 melhorias principais. Segundo, liste 3 ferramentas concorrentes para programação offline de robôs (OLP), e crie uma tabela comparando um ponto forte e um ponto fraco de cada uma.'
};

function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function runSimulation(id) {
    const promptEl = document.getElementById(`prompt${id}`);
    const responseEl = document.getElementById(`response${id}`);
    
    responseEl.style.display = 'none';
    typeWriter(promptEl, prompts[id], 20);

    setTimeout(() => {
        responseEl.style.display = 'block';
    }, prompts[id].length * 20 + 500);
}

// --- Animação de Fundo Interativa com Three.js ---
let scene, camera, renderer, points;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function init() {
    const container = document.getElementById('interactive-bg');
    if (!container) return; // Garante que o container existe
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 1, 10000);
    camera.position.z = 1000;

    const particleCount = 1500;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() * 2 - 1) * 2000;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 2 });
    points = new THREE.Points(particles, material);
    scene.add(points);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x0652AB, 1);
    container.appendChild(renderer.domElement);

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    const container = document.getElementById('interactive-bg');
    if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    }
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    const time = Date.now() * 0.00005;
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    points.rotation.x = time * 0.25;
    points.rotation.y = time * 0.5;

    renderer.render(scene, camera);
}

init();
animate();
