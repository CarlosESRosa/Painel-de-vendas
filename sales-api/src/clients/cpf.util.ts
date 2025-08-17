export function onlyDigits(v: string) {
    return v.replace(/\D/g, '');
}

// valida dígitos verificadores do CPF
export function isValidCpf(cpfRaw: string) {
    const cpf = onlyDigits(cpfRaw);
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
    let d1 = 11 - (sum % 11);
    if (d1 > 9) d1 = 0;
    if (d1 !== parseInt(cpf[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
    let d2 = 11 - (sum % 11);
    if (d2 > 9) d2 = 0;
    return d2 === parseInt(cpf[10]);
}
