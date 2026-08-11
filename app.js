const state={cases:[],category:'전체',query:''};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

function renderFilters(){
  const categories=['전체',...new Set(state.cases.map(item=>item.category))];
  $('#filters').innerHTML=categories.map(category=>`<button class="${category===state.category?'active':''}" data-category="${esc(category)}">${esc(category)}</button>`).join('');
}

function filteredCases(){
  const q=state.query.trim().toLowerCase();
  return state.cases.filter(item=>{
    const categoryMatches=state.category==='전체'||item.category===state.category;
    const text=[item.title,item.summary,item.category,...item.keywords].join(' ').toLowerCase();
    return categoryMatches&&(!q||text.includes(q));
  });
}

function renderCases(){
  const items=filteredCases();
  $('#resultCount').textContent=`${items.length}개 사례`;
  $('#emptyState').hidden=items.length>0;
  $('#caseGrid').innerHTML=items.map(item=>`<button class="case-card" data-id="${item.id}"><span class="tag">${esc(item.category)}</span><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><span class="arrow">↗</span></button>`).join('');
}

function openCase(id){
  const item=state.cases.find(x=>x.id===id); if(!item)return;
  $('#dialogContent').innerHTML=`<span class="tag">${esc(item.category)}</span><h2 class="dialog-title">${esc(item.title)}</h2><div class="detail"><h3>상황 보기</h3><p>${esc(item.observe)}</p></div><div class="detail"><h3>해도 되는 것</h3><p>${esc(item.do)}</p></div><div class="detail"><h3>피할 것</h3><p>${esc(item.avoid)}</p></div><div class="detail quote"><h3>실제로 할 말</h3><p>“${esc(item.say)}”</p></div><div class="detail"><h3>판단 기준</h3><p>${esc(item.check)}</p></div>`;
  $('#caseDialog').showModal();
}

$('#filters').addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;state.category=button.dataset.category;renderFilters();renderCases()});
$('#caseGrid').addEventListener('click',e=>{const card=e.target.closest('.case-card');if(card)openCase(card.dataset.id)});
$('#searchInput').addEventListener('input',e=>{state.query=e.target.value;renderCases()});
$('.close').addEventListener('click',()=>$('#caseDialog').close());
$('#caseDialog').addEventListener('click',e=>{if(e.target===$('#caseDialog'))$('#caseDialog').close()});

fetch('cases.json').then(response=>{if(!response.ok)throw new Error('데이터를 불러오지 못했습니다.');return response.json()}).then(data=>{state.cases=data;renderFilters();renderCases()}).catch(()=>{$('#emptyState').hidden=false;$('#emptyState').textContent='사례 데이터를 불러오지 못했습니다.'});
