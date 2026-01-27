/**
 * Configuração da API Google Vision
 */

// A única função que precisa ser acessível por outros módulos
window.getGoogleVisionApiKey = function() {
    const apiKey = localStorage.getItem('GOOGLE_VISION_API_KEY');
    if (!apiKey) {
        alert('❌ Chave da API não configurada! Clique em ⚙️ Configurar API');
        return null;
    }
    return apiKey;
};

// O restante da lógica é encapsulado e executado quando o DOM está pronto.
document.addEventListener('DOMContentLoaded', () => {

    const modal = document.getElementById('modalAPI');

    function abrirConfigAPI() {
        const apiKey = localStorage.getItem('GOOGLE_VISION_API_KEY') || '';
        document.getElementById('googleApiKey').value = apiKey;
        modal.style.display = 'block';
    }

    function fecharConfigAPI() {
        modal.style.display = 'none';
    }

    function salvarConfigAPI() {
        const apiKey = document.getElementById('googleApiKey').value.trim();
        if (!apiKey) {
            alert('❌ Insira uma chave de API!');
            return;
        }
        localStorage.setItem('GOOGLE_VISION_API_KEY', apiKey);
        alert('✅ Chave salva com sucesso!');
        fecharConfigAPI();
    }

    function toggleMostrarSenha() {
        const input = document.getElementById('googleApiKey');
        const checkbox = document.getElementById('checkMostrarSenha');
        input.type = checkbox.checked ? 'text' : 'password';
    }

    // --- Event Listeners ---
    document.getElementById('btnAbrirConfig').addEventListener('click', abrirConfigAPI);
    document.getElementById('btnFecharConfig').addEventListener('click', fecharConfigAPI);
    document.getElementById('btnCancelarConfig').addEventListener('click', fecharConfigAPI);
    document.getElementById('btnSalvarConfig').addEventListener('click', salvarConfigAPI);
    document.getElementById('checkMostrarSenha').addEventListener('change', toggleMostrarSenha);

    // Fecha modal ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Verifica se API está configurada ao carregar
    const apiKey = localStorage.getItem('GOOGLE_VISION_API_KEY');
    if (apiKey) {
        console.log('✅ API Google Vision configurada');
    } else {
        console.warn('⚠️ API Google Vision não configurada');
    }
});