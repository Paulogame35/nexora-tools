/* Local raster processing. No network, storage, analytics or file-name logging. */
(() => {
  'use strict';
  const mode=document.body.dataset.utility,input=document.getElementById('utilityFiles'),status=document.getElementById('utilityStatus'),result=document.getElementById('utilityResult'),run=document.getElementById('processUtility');
  let outputURL='',generation=0;
  function clear(){generation++;if(outputURL)URL.revokeObjectURL(outputURL);outputURL='';result.replaceChildren();status.textContent='';}
  async function read(file){if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw Error('Use JPG, PNG ou WebP de até 10 MB por arquivo.');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>12000000)throw Error('Cada imagem deve ter até 12 milhões de pixels. Redimensione o original antes.');return img;}finally{URL.revokeObjectURL(url);}}
  document.querySelectorAll('.utility-options input,.utility-options select').forEach(e=>e.addEventListener('input',clear));
  document.getElementById('clearUtility').addEventListener('click',()=>{clear();input.value='';});
  run.addEventListener('click',async()=>{
    clear();const token=generation,files=[...input.files];
    if(mode==='watermark'?files.length!==1:files.length<2||files.length>6){status.textContent=mode==='watermark'?'Escolha uma imagem.':'Escolha entre 2 e 6 imagens.';return;}
    const label=mode==='watermark'?document.getElementById('watermarkText').value.trim():'';
    if(mode==='watermark'&&(!label||label.length>80)){status.textContent='Digite uma marca de 1 a 80 caracteres.';return;}
    const width=mode==='join'?Number(document.getElementById('joinSize').value):0;
    if(mode==='join'&&(!Number.isInteger(width)||width<100||width>2400)){status.textContent='Use uma dimensão inteira de 100 a 2400 pixels.';return;}
    const alpha=mode==='watermark'?Number(document.getElementById('watermarkOpacity').value):1;
    const direction=mode==='join'?document.getElementById('joinDirection').value:'';
    const position=mode==='watermark'?document.getElementById('watermarkPosition').value:'';
    run.disabled=true;status.textContent='Processando no navegador…';
    const images=[];let canvas;
    try{
      let total=0;
      for(const f of files){const img=await read(f);if(token!==generation)return;total+=img.naturalWidth*img.naturalHeight;if(total>24000000)throw Error('O conjunto ultrapassa 24 milhões de pixels. Use menos imagens ou reduza as dimensões.');images.push(img);}
      canvas=document.createElement('canvas');
      if(mode==='watermark'){
        const img=images[0],scale=Math.min(1,2000/Math.max(img.naturalWidth,img.naturalHeight));canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);const padding=Math.max(2,Math.round(canvas.width*.025));let size=Math.max(10,Math.round(canvas.width*.045));ctx.font='600 '+size+'px system-ui';const fit=(canvas.width-padding*2)/Math.max(1,ctx.measureText(label).width);size=Math.min(size,Math.max(1,Math.floor(size*fit)));ctx.font='600 '+size+'px system-ui';ctx.globalAlpha=Math.max(.1,Math.min(1,alpha));ctx.textAlign='center';ctx.textBaseline=position==='center'?'middle':'bottom';const y=position==='center'?canvas.height/2:canvas.height-Math.max(1,Math.round(canvas.height*.025));ctx.strokeStyle='#000';ctx.lineWidth=Math.max(1,size/12);ctx.strokeText(label,canvas.width/2,y,canvas.width);ctx.fillStyle='#fff';ctx.fillText(label,canvas.width/2,y,canvas.width);
      }else{
        const vertical=direction==='vertical';const dims=images.map(img=>{const ratio=Math.min(1,width/(vertical?img.naturalWidth:img.naturalHeight));return {w:Math.max(1,Math.round(img.naturalWidth*ratio)),h:Math.max(1,Math.round(img.naturalHeight*ratio))};});
        const w=vertical?Math.max(...dims.map(d=>d.w)):dims.reduce((s,d)=>s+d.w,0),h=vertical?dims.reduce((s,d)=>s+d.h,0):Math.max(...dims.map(d=>d.h));
        if(w>8192||h>8192||w*h>8000000)throw Error('Resultado grande demais. Reduza a dimensão: limite de 8192 px por lado e 8 milhões de pixels.');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');let offset=0;images.forEach((img,i)=>{const d=dims[i];ctx.drawImage(img,vertical?Math.floor((w-d.w)/2):offset,vertical?offset:Math.floor((h-d.h)/2),d.w,d.h);offset+=vertical?d.h:d.w;});
      }
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
      if(token!==generation)return;if(!blob)throw Error('Não foi possível exportar. Tente uma imagem menor.');outputURL=URL.createObjectURL(blob);
      const preview=new Image();preview.src=outputURL;preview.alt=mode==='watermark'?'Prévia da imagem com marca d’água':'Prévia das imagens unidas';
      const info=document.createElement('p');info.textContent=canvas.width+' × '+canvas.height+' px · '+(blob.size/1024).toFixed(1)+' KB · PNG';
      const link=document.createElement('a');link.href=outputURL;link.download=mode==='watermark'?'nexora-marca-dagua.png':'nexora-imagens-unidas.png';link.className='button button-primary';link.textContent='Baixar PNG';result.append(preview,info,link);status.textContent='Pronto. Confira a prévia antes de baixar.';
    }catch(e){if(token===generation)status.textContent=e instanceof Error&&/^(Use|Cada|O conjunto|Resultado|Não foi)/.test(e.message)?e.message:'Arquivo inválido ou indisponível. Tente uma imagem menor em JPG, PNG ou WebP.';}
    finally{run.disabled=false;if(canvas){canvas.width=1;canvas.height=1;}images.length=0;}
  });
  window.addEventListener('pagehide',clear);
})();
