const ideaInput = document.querySelector('#idea-input');
const charCount = document.querySelector('#char-count');
const forgeButton = document.querySelector('#forge-button');
const audienceInput = document.querySelector('#audience-input');
const formatInput = document.querySelector('#format-input');
const progressPanel = document.querySelector('#forge-progress');
const progressLabel = document.querySelector('#progress-label');
const progressBar = document.querySelector('#progress-bar');
const blueprint = document.querySelector('#blueprint');
const processItems = [...document.querySelectorAll('#process-list li')];
const refineButtons = [...document.querySelectorAll('[data-refine]')];
const state = { refinements: new Set(), currentIdea: '' };

const keywordProfiles = [
  { words:['inventory','stock','expire','expiry','shop','store','retail'], name:'ShelfSignal', tagline:'A practical operations layer that detects stock risk early and turns it into clear action.', features:['Product and batch registration','Expiry-risk dashboard','Prioritized action queue','Discount and waste notes'], workflow:['Capture stock','Detect risk','Recommend action','Track outcome'] },
  { words:['tool','construction','borrow','qr','equipment','asset'], name:'ToolChain', tagline:'A traceability product for knowing who has each asset, where it moved, and what happened next.', features:['QR asset identity','Issue and return workflow','Condition evidence','Responsibility history'], workflow:['Register asset','Assign custody','Record movement','Close return'] },
  { words:['older','elderly','assistance','community','trusted','care'], name:'NeighbourLink', tagline:'A low-friction trusted-assistance experience designed around clarity, confidence, and human support.', features:['Guided assistance request','Trusted helper profiles','Large-action interface','Family or coordinator visibility'], workflow:['Request help','Match support','Confirm trust','Follow outcome'] },
  { words:['delivery','warehouse','logistics','supplier','damage','trace'], name:'ProofFlow', tagline:'A shared evidence and exception workflow for operational teams that need reliable traceability.', features:['Mobile evidence capture','Exception classification','Role-based notification','Searchable event timeline'], workflow:['Capture event','Classify issue','Notify owner','Resolve and audit'] },
];
const fallbackProfile = { name:'ForgeFlow', tagline:'A focused digital product that transforms a recurring problem into a guided, measurable workflow.', features:['Guided user intake','Central operational dashboard','Status and responsibility tracking','Outcome reporting'], workflow:['Capture need','Prioritize','Take action','Review result'] };

function escapeHtml(value){return String(value).replace(/[&<>'"]/g,(character)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[character]);}
function chooseProfile(idea){const normalized=idea.toLowerCase();return keywordProfiles.find((profile)=>profile.words.some((word)=>normalized.includes(word)))||fallbackProfile;}
function createUsers(audience){const users=audience==='consumers'?['Primary user','Trusted support contact','Service administrator']:['Operational user','Team coordinator','Organization administrator'];if(state.refinements.has('saas'))users.push('Platform owner');return users;}
function createFeatures(profile){let features=[...profile.features];if(state.refinements.has('simpler'))features=features.slice(0,3).map((item,index)=>index===0?`Fast ${item.toLowerCase()}`:item);if(state.refinements.has('mobile'))features.push('Mobile-first guided interface');if(state.refinements.has('qr'))features.push('QR identity and scan history');if(state.refinements.has('ai'))features.push('Explainable AI suggestions with human approval');if(state.refinements.has('saas'))features.push('Multi-organization workspace and subscription readiness');return [...new Set(features)].slice(0,7);}
function createAssumptions(){const items=['The described problem occurs often enough to justify a dedicated workflow.','Primary users can access a connected device during the process.','Success criteria and current baseline data still need validation.'];if(state.refinements.has('ai'))items.push('Suitable data and review controls are available for AI-supported decisions.');if(state.refinements.has('saas'))items.push('Multiple organizations share a sufficiently similar core process.');return items;}

function renderBlueprint(){
  const profile=chooseProfile(state.currentIdea);const audience=audienceInput.value;const format=formatInput.value;
  const tags=[format,audience,'exploratory MVP'];state.refinements.forEach((item)=>tags.push(item==='qr'?'QR-enabled':item));
  document.querySelector('#product-name').textContent=profile.name;
  document.querySelector('#product-tagline').textContent=profile.tagline;
  document.querySelector('#blueprint-summary').textContent=`A proposed ${format} for ${audience}, shaped from: “${state.currentIdea.slice(0,170)}${state.currentIdea.length>170?'…':''}”`;
  document.querySelector('#product-tags').innerHTML=tags.map((tag)=>`<span>${escapeHtml(tag)}</span>`).join('');
  document.querySelector('#user-list').innerHTML=createUsers(audience).map((user)=>`<li>${escapeHtml(user)}</li>`).join('');
  document.querySelector('#feature-list').innerHTML=createFeatures(profile).map((feature)=>`<li>${escapeHtml(feature)}</li>`).join('');
  document.querySelector('#assumption-list').innerHTML=createAssumptions().map((assumption)=>`<li>${escapeHtml(assumption)}</li>`).join('');
  document.querySelector('#workflow-list').innerHTML=profile.workflow.map((step,index)=>`<div class="workflow-step"><small>STEP 0${index+1}</small><strong>${escapeHtml(step)}</strong></div>`).join('');
  blueprint.hidden=false;
}
function setProcessStep(index){processItems.forEach((item,itemIndex)=>item.classList.toggle('active',itemIndex<=index));}
function wait(ms){return new Promise((resolve)=>window.setTimeout(resolve,ms));}
function createSparks(container,count){if(!container)return;container.innerHTML='';for(let index=0;index<count;index+=1){const spark=document.createElement('span');spark.className='spark';spark.style.left=`${47+Math.random()*8}%`;spark.style.top=`${54+Math.random()*6}%`;spark.style.setProperty('--x',`${(Math.random()-.5)*260}px`);spark.style.setProperty('--y',`${-40-Math.random()*180}px`);spark.style.animationDelay=`${Math.random()*.18}s`;container.appendChild(spark);}}
async function runForge(){
  const idea=ideaInput.value.trim();if(idea.length<18){ideaInput.focus();ideaInput.setCustomValidity('Please add a little more detail so the Forge has enough raw material.');ideaInput.reportValidity();return;}
  ideaInput.setCustomValidity('');state.currentIdea=idea;state.refinements.clear();refineButtons.forEach((button)=>button.classList.remove('selected'));forgeButton.disabled=true;blueprint.hidden=true;progressPanel.hidden=false;progressBar.style.width='8%';createSparks(document.querySelector('#hero-sparks'),24);
  for(const [label,width,step] of [['Understanding the problem',26,0],['Shaping users and workflow',52,1],['Testing assumptions and MVP scope',78,1],['Preparing the Forge Blueprint',100,2]]){progressLabel.textContent=label;progressBar.style.width=`${width}%`;setProcessStep(step);await wait(620);}
  renderBlueprint();progressPanel.hidden=true;forgeButton.disabled=false;blueprint.scrollIntoView({behavior:'smooth',block:'start'});
}
function updateSimulator(){const operations=Number(document.querySelector('#operations-slider').value);const minutes=Number(document.querySelector('#minutes-slider').value);const reduction=Number(document.querySelector('#reduction-slider').value);const manualHours=operations*minutes/60;const savedHours=manualHours*reduction/100;document.querySelector('#operations-value').textContent=operations.toLocaleString('en-US');document.querySelector('#minutes-value').textContent=`${minutes} min`;document.querySelector('#reduction-value').textContent=`${reduction}%`;document.querySelector('#manual-hours').textContent=`${Math.round(manualHours).toLocaleString('en-US')} h`;document.querySelector('#saved-hours').textContent=`${Math.round(savedHours).toLocaleString('en-US')} h`;document.querySelector('#annual-hours').textContent=`${Math.round(savedHours*12).toLocaleString('en-US')} h`;document.querySelector('#readiness-value').textContent=operations>=500&&minutes>=4?'High':operations>=250?'Medium':'Explore';}

ideaInput.addEventListener('input',()=>{charCount.textContent=`${ideaInput.value.length} / 900`;ideaInput.setCustomValidity('');});
forgeButton.addEventListener('click',runForge);
document.querySelectorAll('[data-sample]').forEach((button)=>button.addEventListener('click',()=>{ideaInput.value=button.dataset.sample;ideaInput.dispatchEvent(new Event('input'));ideaInput.focus();}));
refineButtons.forEach((button)=>button.addEventListener('click',()=>{const key=button.dataset.refine;if(state.refinements.has(key)){state.refinements.delete(key);button.classList.remove('selected');}else{state.refinements.add(key);button.classList.add('selected');createSparks(document.querySelector('#hero-sparks'),12);}renderBlueprint();}));
['operations-slider','minutes-slider','reduction-slider'].forEach((id)=>document.querySelector(`#${id}`).addEventListener('input',updateSimulator));
document.querySelector('#year').textContent=new Date().getFullYear();updateSimulator();

const stylesheetAssets=[
  ['./enhancements.css','forgeEnhancements'],['./strategy.css','forgeStrategy'],['./stories.css','forgeStories'],
  ['./dashboard.css','forgeDashboard'],['./intelligence.css','forgeIntelligence'],['./refinements.css','forgeRefinements'],
  ['./workspace.css','forgeWorkspace'],
];
stylesheetAssets.forEach(([href,dataKey])=>{const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href=href;stylesheet.dataset[dataKey]='true';document.head.appendChild(stylesheet);});
function loadScript(src,dataKey){const script=document.createElement('script');script.src=src;script.defer=true;script.dataset[dataKey]='true';document.body.appendChild(script);return script;}
const enhancementScript=loadScript('./forge-v2.js','forgeEnhancements');
enhancementScript.addEventListener('load',()=>{
  loadScript('./forge-strategy.js','forgeStrategy');loadScript('./forge-stories.js','forgeStories');loadScript('./forge-dashboard.js','forgeDashboard');loadScript('./forge-refinements.js','forgeRefinements');
  const intelligenceCoreScript=loadScript('./forge-intelligence-core.js','forgeIntelligenceCore');
  intelligenceCoreScript.addEventListener('load',()=>loadScript('./forge-intelligence.js','forgeIntelligence'));
  const workspaceCoreScript=loadScript('./forge-workspace-core.js','forgeWorkspaceCore');
  workspaceCoreScript.addEventListener('load',()=>loadScript('./forge-workspace.js','forgeWorkspace'));
});
