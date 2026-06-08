/**
 * Aplicação CNAB 240 - Lógica Principal
 * Versão Final: Com Persistência de Dados (Auto-Save)
 */
console.log('🔄 Carregando app.js...');

// Estado da aplicação
let boletos = [];
let builderCNAB = null;
let arquivosSelecionados = [];

// Lista de campos que queremos salvar automaticamente
const CAMPOS_EMPRESA = ['nomeEmpresa', 'cnpj', 'agencia', 'conta', 'dv'];

/**
 * Utilitário: Transforma o nome do arquivo em um ID válido
 */
function gerarSeuNumeroDoArquivo(nomeArquivo, indicePagina = null) {
    if (!nomeArquivo) return "DOC_SEM_NOME";
    let nome = nomeArquivo.replace(/\.[^/.]+$/, "");
    if (indicePagina !== null && indicePagina > 0) {
        nome += `_${indicePagina}`;
    }
    nome = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    nome = nome.replace(/[^a-zA-Z0-9]/g, "_");
    return nome.toUpperCase().substring(0, 20);
}

/**
 * === PERSISTÊNCIA DE DADOS (LOCAL STORAGE) ===
 */

// Salva os dados da empresa no navegador
function salvarConfiguracaoEmpresa() {
    CAMPOS_EMPRESA.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            localStorage.setItem(`remessa_${id}`, input.value);
        }
    });
    console.log('💾 Dados da empresa salvos automaticamente.');
}

// Carrega os dados salvos quando a página abre
function carregarConfiguracaoEmpresa() {
    let dadosEncontrados = false;
    CAMPOS_EMPRESA.forEach(id => {
        const valorSalvo = localStorage.getItem(`remessa_${id}`);
        const input = document.getElementById(id);
        if (input && valorSalvo) {
            input.value = valorSalvo;
            dadosEncontrados = true;
        }
    });
    if (dadosEncontrados) console.log('📂 Dados da empresa carregados do cache.');
}

/**
 * Processamento de Boletos (PDF/Imagem)
 */
window.processarBoletos = async function() {
    console.log('🔍 processarBoletos chamado');
    const fileInput = document.getElementById('uploadBoletos');
    arquivosSelecionados = Array.from(fileInput.files);

    if (arquivosSelecionados.length === 0) {
        alert('❌ Selecione pelo menos um arquivo!');
        return;
    }

    const statusDiv = document.getElementById('processadorStatus');
    const mensagemDiv = document.getElementById('processadorMensagem');
    const progressoBar = document.getElementById('progressoBar');
    statusDiv.style.display = 'block';

    try {
        let totalUnidades = await contarUnidadesDeProcessamento(arquivosSelecionados);
        let unidadesProcessadas = 0;

        let houveErro = false;

        for (const file of arquivosSelecionados) {
            const onUnidadeProcessada = () => {
                unidadesProcessadas++;
                progressoBar.style.width = `${(unidadesProcessadas / totalUnidades) * 100}%`;
            };

            try {
                if (file.type === 'application/pdf') {
                    await processarPDF(file, mensagemDiv, onUnidadeProcessada);
                } else {
                    mensagemDiv.textContent = `Processando imagem ${file.name}...`;
                    await processarImagem(file);
                    onUnidadeProcessada();
                }
            } catch (error) {
                console.error(`Erro ao processar ${file.name}:`, error);
                mensagemDiv.textContent = `Erro em ${file.name}: ${error.message}`;
                houveErro = true;
                break; // Para o processamento em caso de erro
            }
        }

        if (!houveErro) {
            progressoBar.style.width = '100%';
            mensagemDiv.textContent = `✅ ${boletos.length} boleto(s) processado(s)!`;
        }
        
        atualizarListaBoletos();
        fileInput.value = ''; 

        setTimeout(() => { statusDiv.style.display = 'none'; }, houveErro ? 8000 : 3000);

    } catch (error) {
        alert(`❌ Erro geral:\n${error.message}`);
        console.error(error);
        statusDiv.style.display = 'none';
    }
};

async function contarUnidadesDeProcessamento(files) {
    let total = 0;
    for (const file of files) {
        if (file.type === 'application/pdf') {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                total += pdf.numPages;
            } catch (e) { total += 1; }
        } else {
            total++;
        }
    }
    return total;
}

async function processarImagem(file) {
    try {
        const base64 = await upscaleImage(file);
        const dadosJSON = await processarBoletoComGemini(base64);
        
        if (dadosJSON) {
            const dadosFormatados = formatarDadosBoleto(dadosJSON, file.name);
            if (dadosFormatados) {
                boletos.push(dadosFormatados);
            }
        }
    } catch (e) { 
        console.warn(`⚠️ Erro na imagem ${file.name}:`, e); 
        throw e;
    }
}

async function processarPDF(file, mensagemDiv, onPageProcessed) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            mensagemDiv.textContent = `Lendo ${file.name} - pág ${pageNum}/${pdf.numPages}...`;
            
            try {
                const page = await pdf.getPage(pageNum);
                const scale = 2.0;
                const viewport = page.getViewport({ scale });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport }).promise;

                const base64 = canvas.toDataURL('image/png').split(',')[1];
                const dadosJSON = await processarBoletoComGemini(base64);

                if (dadosJSON) {
                    const dadosFormatados = formatarDadosBoleto(dadosJSON, file.name, pageNum);
                    if (dadosFormatados) {
                        boletos.push(dadosFormatados);
                    }
                }
            } catch (innerError) { 
                console.warn(`Falha pag ${pageNum}`, innerError); 
                throw innerError;
            }
            
            onPageProcessed();
            atualizarListaBoletos();
        }
    } catch (e) { throw e; }
}

function upscaleImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let scale = 1.5;
            if(img.width > 2000) scale = 1.0; 
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/png').split(',')[1]);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

async function processarBoletoComGemini(base64Data) {
    let response;
    try {
        const apiKey = localStorage.getItem('GOOGLE_VISION_API_KEY') || null;
        response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Data, apiKey: apiKey }),
        });
    } catch (networkError) {
        throw new Error('Erro de rede ao conectar com o backend.');
    }

    if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        try {
            const errData = await response.json();
            if (errData.details) {
                errorMessage = `API Gemini Erro: ${errData.details}`;
            } else if (errData.error) {
                errorMessage = errData.error;
            }
        } catch(e) {}
        throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.success && result.texto) {
        // Expressão regular aprimorada para lidar com markdown e quebras de linha
        let jsonStr = result.texto.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            try {
                return JSON.parse(jsonStr.substring(firstBrace, lastBrace + 1));
            } catch (jsonErr) {
                console.error("Conteúdo retornado:", jsonStr);
                throw new Error(`JSON inválido retornado pela IA: ${jsonErr.message}`);
            }
        }
    }
    throw new Error('Falha ao processar dados da IA (Sem JSON válido na resposta)');
}

function formatarDadosBoleto(dadosJSON, nomeOriginalArquivo, numeroPagina = null) {
    let linha = dadosJSON.linha_digitavel || dadosJSON.codigo_barras || dadosJSON.linhaDigitavel;
    if (!linha) return null; 

    const linhaLimpa = linha.replace(/\D/g, '');
    let valorNum = 0.0;
    const valorRecebido = dadosJSON.valor;

    if (typeof valorRecebido === 'number') {
        valorNum = valorRecebido;
    } else if (typeof valorRecebido === 'string') {
        let limpo = valorRecebido.replace(/[^\d.,-]/g, '');
        if (limpo.includes(',') && limpo.includes('.')) {
            limpo = limpo.replace(/\./g, '').replace(',', '.');
        } else if (limpo.includes(',')) {
            limpo = limpo.replace(',', '.');
        } 
        valorNum = parseFloat(limpo);
    }
    const valorFinal = !isNaN(valorNum) ? valorNum.toFixed(2) : '0.00';
    
    let vencimento = dadosJSON.vencimento;
    if (!vencimento || vencimento.length < 8) {
        vencimento = new Date().toISOString().split('T')[0];
    }

    const seuNumeroGerado = gerarSeuNumeroDoArquivo(nomeOriginalArquivo, numeroPagina);

    return {
        linhaDigitavel: linhaLimpa,
        valor: valorFinal,
        vencimento: vencimento,
        seuNumero: seuNumeroGerado,
        sacado: {
            nome: dadosJSON.beneficiario || 'BENEFICIÁRIO NÃO IDENTIFICADO',
            cpf_cnpj: '', 
            endereco: '', cep: '', cidade: '', uf: '', telefone: ''
        }
    };
}

function atualizarListaBoletos() {
    const container = document.getElementById('listaBoletos');
    const totalPagamentosEl = document.getElementById('totalPagamentos');
    const valorTotalEl = document.getElementById('valorTotal');

    if (boletos.length === 0) {
        container.innerHTML = '<p class="vazio">Nenhum boleto adicionado ainda</p>';
        totalPagamentosEl.textContent = '0';
        valorTotalEl.textContent = '0.00';
        return;
    }

    let html = '<table class="tabela"><thead><tr><th>#</th><th>ID (Arquivo)</th><th>Linha Digitável</th><th>Valor</th><th>Vencimento</th><th>Beneficiário</th><th>Ação</th></tr></thead><tbody>';
    let valorTotal = 0;

    boletos.forEach((boleto, idx) => {
        let linhaVisivel = boleto.linhaDigitavel.length > 20 ? 
            boleto.linhaDigitavel.substring(0, 5) + '...' + boleto.linhaDigitavel.slice(-5) : boleto.linhaDigitavel;

        let vencData = boleto.vencimento;
        try {
            const parts = boleto.vencimento.split('-');
            if(parts.length === 3) vencData = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } catch(e) {}

        valorTotal += parseFloat(boleto.valor);

        html += `<tr>
            <td>${idx + 1}</td>
            <td style="font-size: 0.85em; color: #555;">${boleto.seuNumero}</td>
            <td title="${boleto.linhaDigitavel}">${linhaVisivel}</td>
            <td>R$ ${boleto.valor}</td>
            <td>${vencData}</td>
            <td>${boleto.sacado.nome}</td>
            <td><button class="btn-remove" data-index="${idx}">🗑️</button></td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
    totalPagamentosEl.textContent = boletos.length;
    valorTotalEl.textContent = valorTotal.toFixed(2);

    container.querySelectorAll('.btn-remove').forEach(button => {
        button.addEventListener('click', (e) => window.removerBoleto(parseInt(e.currentTarget.dataset.index)));
    });
}

window.removerBoleto = function(index) {
    if (confirm(`Remover boleto de R$ ${boletos[index].valor}?`)) {
        boletos.splice(index, 1);
        atualizarListaBoletos();
    }
};

window.gerarCNAB = function() {
    salvarConfiguracaoEmpresa(); // Garante que salva ao gerar também

    const nomeEmpresa = document.getElementById('nomeEmpresa').value.trim();
    const cnpj = document.getElementById('cnpj').value.trim();
    const agencia = document.getElementById('agencia').value.trim();
    const conta = document.getElementById('conta').value.trim();
    const dv = document.getElementById('dv').value.trim();

    if (!nomeEmpresa || !cnpj || !agencia || !conta || !dv) {
        alert('❌ Preencha todos os dados da empresa!');
        return;
    }
    if (boletos.length === 0) {
        alert('❌ Adicione pelo menos um boleto!');
        return;
    }

    try {
        builderCNAB = new window.Cnab240InterBuilder({
            nome: nomeEmpresa, cnpj: cnpj, agencia: agencia, conta_bancaria: conta, dv: dv
        });

        boletos.forEach(boleto => builderCNAB.addBoletoPayment(boleto));

        const arquivo = builderCNAB.build();
        document.getElementById('cnabOutput').value = arquivo;
        document.getElementById('qtdLinhas').textContent = arquivo.split('\n').length;
        document.getElementById('resultadoSection').style.display = 'block';
        document.getElementById('resultadoSection').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        alert(`❌ Erro ao gerar CNAB: ${error.message}`);
    }
};

window.limparTudo = function() {
    // Pergunta inteligente para não apagar a configuração sem querer
    if (boletos.length > 0 && confirm('Deseja limpar APENAS a lista de boletos?\n\n(Clique em CANCELAR para limpar TUDO, inclusive os dados da empresa salvos)')) {
        boletos = [];
        document.getElementById('resultadoSection').style.display = 'none';
        document.getElementById('cnabOutput').value = '';
        atualizarListaBoletos();
    } else if (confirm('Tem certeza? Isso vai apagar os BOLETOS e os DADOS DA EMPRESA salvos.')) {
        // Limpeza completa
        boletos = [];
        document.getElementById('empresaForm').reset();
        document.getElementById('resultadoSection').style.display = 'none';
        document.getElementById('cnabOutput').value = '';
        
        // Apaga do LocalStorage
        CAMPOS_EMPRESA.forEach(id => localStorage.removeItem(`remessa_${id}`));
        
        atualizarListaBoletos();
    }
};

window.copiarCNAB = function() {
    const textarea = document.getElementById('cnabOutput');
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => alert('✅ Copiado!')).catch(() => alert('Erro ao copiar'));
};

window.baixarCNAB = function() {
    const arquivo = document.getElementById('cnabOutput').value;
    const blob = new Blob([arquivo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `remessa_${new Date().toISOString().slice(0,10)}.rem`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Função de inicialização principal
function inicializarApp() {
    console.log('✅ Aplicação carregada!');

    // 1. Carrega dados salvos (se houver)
    carregarConfiguracaoEmpresa();

    // 2. Adiciona "Auto-Save" nos campos de input da empresa
    CAMPOS_EMPRESA.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', salvarConfiguracaoEmpresa);
        }
    });

    // 3. Botões
    document.getElementById('btnProcessarBoletos').addEventListener('click', window.processarBoletos);
    document.getElementById('btnGerarCNAB').addEventListener('click', window.gerarCNAB);
    document.getElementById('btnLimparTudo').addEventListener('click', window.limparTudo);
    document.getElementById('btnCopiarCNAB').addEventListener('click', window.copiarCNAB);
    document.getElementById('btnBaixarCNAB').addEventListener('click', window.baixarCNAB);
    
    atualizarListaBoletos();
}

// Inicialização segura: Garante que o DOM esteja pronto
if (document.readyState === 'loading') {
    // Ainda carregando, aguarda o evento
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    // O DOM já está pronto, executa imediatamente
    inicializarApp();
}