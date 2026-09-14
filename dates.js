/* Calendar dates only: no requests, storage or telemetry. */
(() => {
  'use strict';
  const start=document.getElementById('dateStart'),end=document.getElementById('dateEnd'),inclusive=document.getElementById('dateInclusive'),result=document.getElementById('dateResult'),copy=document.getElementById('copyDays');
  let text='';
  function clear(){text='';result.textContent='Preencha as duas datas para calcular.';copy.disabled=true;}
  function parse(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return NaN;const [y,m,d]=value.split('-').map(Number),n=Date.UTC(y,m-1,d),x=new Date(n);return y>=1900&&y<=2100&&x.getUTCFullYear()===y&&x.getUTCMonth()===m-1&&x.getUTCDate()===d?n:NaN;}
  document.getElementById('calculateDays').addEventListener('click',()=>{clear();const a=parse(start.value),b=parse(end.value);if(!Number.isFinite(a)||!Number.isFinite(b)){result.textContent='Informe duas datas válidas entre 1900 e 2100.';return;}if(b<a){result.textContent='A data final deve ser igual ou posterior à inicial.';return;}const days=Math.round((b-a)/86400000)+(inclusive.checked?1:0);text=days+' dia(s) corrido(s)'+(inclusive.checked?', contando as duas datas.':', sem contar a data inicial.');result.textContent=text;copy.disabled=false;});
  [start,end,inclusive].forEach(e=>e.addEventListener('input',clear));
  document.getElementById('clearDays').addEventListener('click',()=>{start.value='';end.value='';inclusive.checked=false;clear();});
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);result.textContent=text+' Copiado!';}catch{result.textContent=text+' Cópia indisponível: selecione o resultado para copiar manualmente.';}});
})();
