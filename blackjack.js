// blackjack.js - extracted from blackjack.html
// Improved Blackjack implementation (UI + logic)
const STORAGE_KEY = 'blackjackSave_v1';
let balance = 0;
let bet = 10;
let deck = [];
let dealer = [];
let player = [];
let inRound = false;

// Elements
const balanceEl = document.getElementById('balance');
const betEl = document.getElementById('bet');
const betRange = document.getElementById('bet-range');
const presetBtns = document.querySelectorAll('.preset-btns .btn.secondary');
const btnDeal = document.getElementById('btn-deal');
const btnHit = document.getElementById('btn-hit');
const btnStand = document.getElementById('btn-stand');
const btnDouble = document.getElementById('btn-double');
const btnReset = document.getElementById('btn-reset');
const btnMax = document.getElementById('btn-max');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const logEl = document.getElementById('log');
const lastEl = document.getElementById('last');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({balance}));
}
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const obj = JSON.parse(raw);
      if (typeof obj.balance === 'number') balance = obj.balance;
    } catch(e) { /* ignore */ }
  }
  if (!balance || balance < 1) balance = 500; // default start
  betEl.value = bet;
  betRange.value = bet;
  updateUI();
  renderLast('Welcome — good luck!');
}

function renderLast(msg){ lastEl.textContent = msg }

function updateUI() {
  balanceEl.textContent = Number(balance).toFixed(0);
  btnHit.disabled = !inRound;
  btnStand.disabled = !inRound;
  btnDouble.disabled = !inRound || player.length !== 2 || (bet*2) > balance;
  betEl.disabled = inRound;
  betRange.disabled = inRound;
  btnDeal.disabled = inRound;
}

function createDeck() {
  const suits=['♠','♥','♦','♣'];
  const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d=[];
  for(const s of suits) for(const r of ranks) d.push({r,s});
  for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}
  return d;
}

function cardValue(card){ if(!card) return 0; const r=card.r; if(r==='A') return 11; if(['J','Q','K'].includes(r)) return 10; return parseInt(r,10); }

function scoreHand(hand){ let total=0, aces=0; for(const c of hand){ total+=cardValue(c); if(c.r==='A') aces++; } while(total>21 && aces>0){ total-=10; aces--; } return total; }

function renderCardElement(cardObj, hide=false){
  const div=document.createElement('div');
  div.className='card';
  if(hide){ div.classList.add('back'); div.textContent='🂠'; return div; }
  const isRed = ['♥','♦'].includes(cardObj.s);
  const suitSpanTop = document.createElement('div'); suitSpanTop.className='top ' + (isRed ? 'suit red' : 'suit black'); suitSpanTop.textContent = cardObj.r + cardObj.s;
  const center = document.createElement('div'); center.className='center'; center.textContent = cardObj.s;
  const bottom = document.createElement('div'); bottom.className='bottom ' + (isRed ? 'suit red' : 'suit black'); bottom.textContent = cardObj.r;
  div.appendChild(suitSpanTop); div.appendChild(center); div.appendChild(bottom);
  return div;
}

function renderCards(el, hand, hideFirst=false){ el.innerHTML=''; hand.forEach((c,i)=>{ el.appendChild(renderCardElement(c, hideFirst && i===0)); }); }

function renderScores(){ playerScoreEl.textContent = scoreHand(player) ? `(${scoreHand(player)})` : ''; dealerScoreEl.textContent = inRound ? '' : `(${scoreHand(dealer)})`; }

function log(msg){ logEl.textContent = msg }

function endRound(result){
  // Resolve payouts
  if(result==='blackjack'){ const win = Math.floor(bet * 1.5); balance += win; renderLast(`Blackjack! +$${win}`); }
  else if(result==='win'){ balance += bet; renderLast(`You win +$${bet}`); }
  else if(result==='push'){ renderLast('Push — bet returned'); }
  else if(result==='lose'){ balance -= bet; renderLast(`You lose -$${bet}`); }

  inRound=false;
  if(balance <= 0){ balance = 50; renderLast('Bankruptcy — balance reset to $50'); }
  save(); updateUI(); renderScores();
}

function dealerPlay(){ while(scoreHand(dealer) < 17){ dealer.push(deck.pop()); } }

function deal(){
  bet = Math.max(1, Math.floor(Number(betEl.value)||0));
  if (bet <=0){ log('Place a valid bet.'); return }
  if (bet > balance){ log('Bet cannot exceed balance.'); return }
  deck = createDeck(); dealer=[]; player=[];
  player.push(deck.pop()); dealer.push(deck.pop()); player.push(deck.pop()); dealer.push(deck.pop());
  inRound = true;
  renderCards(playerCardsEl, player); renderCards(dealerCardsEl, dealer, true); renderScores(); log('Round started — Hit, Stand, or Double.'); updateUI();
  const pScore = scoreHand(player);
  if(pScore===21){ inRound=false; renderCards(dealerCardsEl, dealer); renderScores(); endRound('blackjack'); }
}

function hit(){ if(!inRound) return; player.push(deck.pop()); renderCards(playerCardsEl, player); renderScores(); const pScore=scoreHand(player); if(pScore>21){ inRound=false; renderCards(dealerCardsEl, dealer); endRound('lose'); } updateUI(); }

function stand(){ if(!inRound) return; renderCards(dealerCardsEl, dealer); dealerPlay(); renderCards(dealerCardsEl, dealer); const pScore=scoreHand(player); const dScore=scoreHand(dealer); if(dScore>21||pScore>dScore) endRound('win'); else if(pScore===dScore) endRound('push'); else endRound('lose'); updateUI(); }

function dbl(){ if(!inRound) return; if((bet*2) > balance){ log('Not enough balance to double.'); return } bet = bet * 2; player.push(deck.pop()); renderCards(playerCardsEl, player); renderScores(); if(scoreHand(player)>21){ inRound=false; renderCards(dealerCardsEl, dealer); endRound('lose'); updateUI(); return } renderCards(dealerCardsEl, dealer); dealerPlay(); renderCards(dealerCardsEl, dealer); const pScore=scoreHand(player); const dScore=scoreHand(dealer); if(dScore>21||pScore>dScore) endRound('win'); else if(pScore===dScore) endRound('push'); else endRound('lose'); updateUI(); }

// UI bindings
btnDeal.addEventListener('click', ()=>{ deal(); });
btnHit.addEventListener('click', ()=>{ hit(); });
btnStand.addEventListener('click', ()=>{ stand(); });
btnDouble.addEventListener('click', ()=>{ dbl(); });
betEl.addEventListener('input', ()=>{ betRange.value = betEl.value; });
betRange.addEventListener('input', ()=>{ betEl.value = betRange.value; });
presetBtns.forEach(b=> b.addEventListener('click', (e)=>{ const v=Number(e.currentTarget.dataset.bet); betEl.value=v; betRange.value=v; }));
btnReset.addEventListener('click', ()=>{ if(confirm('Reset balance to $500?')){ balance = 500; save(); updateUI(); renderLast('Balance reset to $500'); } });
btnMax.addEventListener('click', ()=>{ betEl.value = Math.max(1, Math.floor(balance)); betRange.value = betEl.value; });

// load
load();
