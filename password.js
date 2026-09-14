/* Sem rede, métricas ou armazenamento. Não registrar o resultado em logs. */
(() => {
  'use strict';
  const sets = { upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower:'abcdefghijklmnopqrstuvwxyz', numbers:'0123456789', symbols:'!@#$%^&*()-_=+[]{}:;,.?' };
  const output=document.getElementById('passwordOutput'), status=document.getElementById('passwordStatus'), strength=document.getElementById('passwordStrength'), copy=document.getElementById('copyPassword');
  const clear=()=>{output.value='';copy.disabled=true;strength.textContent='Gere uma senha para ver a estimativa.';status.textContent='';};
  // Rejeição elimina o viés do resto da divisão; nenhuma alternativa com Math.random.
  function index(size){const a=new Uint32Array(1),limit=4294967296-(4294967296%size);do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%size;}
  document.getElementById('generatePassword').addEventListener('click',()=>{
    clear();
    const length=Number(document.getElementById('passwordLength').value);
    if(!Number.isInteger(length)||length<8||length>128){status.textContent='Escolha de 8 a 128 caracteres inteiros.';return;}
    const groups=Object.entries(sets).filter(([id])=>document.getElementById(id).checked).map(([,chars])=>document.getElementById('avoidSimilar').checked?chars.replace(/[Il1O0o|]/g,''):chars);
    if(!groups.length){status.textContent='Selecione pelo menos um tipo de caractere.';return;}
    if(!globalThis.crypto?.getRandomValues){status.textContent='Geração segura indisponível. Use um navegador atualizado.';return;}
    try{
      const alphabet=groups.join('');let password;
      // Amostra uniforme entre as senhas que contêm todos os tipos selecionados.
      do{password=Array.from({length},()=>alphabet[index(alphabet.length)]).join('');}while(!groups.every(g=>[...password].some(c=>g.includes(c))));
      output.value=password;copy.disabled=false;
      // Estimativa simples e conservadora; não é auditoria nem tempo de quebra.
      const bits=length*Math.log2(alphabet.length)-groups.length;
      strength.textContent='Força estimada: '+(bits>=80?'forte':bits>=55?'moderada':'baixa')+'. Avaliação aproximada de comprimento e variedade; não garante segurança.';
      status.textContent='Senha gerada somente neste navegador.';
    }catch{clear();status.textContent='Não foi possível gerar com segurança. Tente em um navegador atualizado.';}
  });
  copy.addEventListener('click',async()=>{if(!output.value)return;try{await navigator.clipboard.writeText(output.value);status.textContent='Senha copiada. A área de transferência é controlada pelo seu dispositivo.';}catch{output.focus();output.select();status.textContent='Cópia automática indisponível. Selecione e copie manualmente.';}});
  document.querySelectorAll('#passwordOptions input').forEach(el=>el.addEventListener('input',clear));
  document.getElementById('clearPassword').addEventListener('click',clear);
  // Evita reexibir o resultado ao restaurar uma página do histórico.
  window.addEventListener('pagehide',clear);window.addEventListener('pageshow',clear);
})();
