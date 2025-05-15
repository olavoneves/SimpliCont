const formulario = document.getElementById('formulario')

formulario.addEventListener('submit', async function name(evento) {
    evento.preventDefault();

    const cpfOuCnpj = document.getElementById('user').value
    const senha = document.getElementById('password').value
    let valido = true;

    document.querySelector('.erro').textContent = '';

    if (!validarCpfOuCnpj(cpfOuCnpj) || !validarSenha(senha)) {
        document.getElementById('erro').style.display = 'block'
        
        document.getElementById('erro').textContent = 'CPF/CNPJ ou Senha incorretos'
        valido = false;
    }

    if (!valido) return
    
    try {
        const resposta = await enviarParaBackend({ cpfOuCnpj, senha });
        
        if (resposta.success) {
            if (cpfOuCnpj.replace(/\D/g, '').length === 11) {
                window.location.href = '../cpf/holerites.html';
            } else {
                window.location.href = '../cnpj/dashboard.html';
            }
        } else {
            alert(resposta.message || 'Credenciais inválidas');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor');
    }
    })

function validarCpfOuCnpj(valor) {
    const numeros = valor.replace(/\D/g, '')

    if (numeros.length === 11) {
        return validarCPF(numeros)
    } else if (numeros.length === 14) {
        return validarCNPJ(numeros)
    }

    return false;
}

function validarCPF(cpf) {
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (11 - i)
    }

    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

function validarCNPJ(cnpj) {
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

function validarSenha(senha) {
    const regex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/
    return regex.test(senha)
}

async function enviarParaBackend(dados) {
    try {
        const response = await fetch('https://localhost:8081/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        error.message = `Falha na comunicação com o servidor: ${error.message}`;
        throw error;
    }
}
