// blackjack.js - Uses universal currency system
const STORAGE_KEY = 'blackjackSave_v1';
let currency;
let balance = 0;
let bet = 10;
let deck = [];
let dealer = [];
let player = [];
let inRound = false;

// Elements (may be present in header and sidebar)
const balanceEl = document.getElementById('balance');
const balanceHeaderEl = document.getElementById('balance-sidebar');
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

function save() { currency.saveGold(); }
function load() {
  // Initialize currency
  if (typeof UniversalCurrency !== 'undefined') {
      currency = new UniversalCurrency();
      balance = currency.getGold();
  } else {
      // Fallback if currency not loaded
      balance = 500;
  }
  
  if (!balance || balance < 1) {
      balance = 500;
      currency.setGold(balance);
  }
  
  betEl.value = bet; if (betRange) betRange.value = bet;
  updateUI(); renderLast('Welcome — good luck!');
}

function renderLast(msg){ if (lastEl) lastEl.textContent = msg }

function updateUI() {
  balance = currency.getGold();
  if (balanceEl) balanceEl.textContent = Number(balance).toFixed(0);
  if (balanceHeaderEl) balanceHeaderEl.textContent = Number(balance).toFixed(0);
  btnHit.disabled = !inRound;
  btnStand.disabled = !inRound;
  btnDouble.disabled = !inRound || player.length !== 2 || (bet*2) > balance;
  betEl.disabled = inRound;
  if (betRange) betRange.disabled = inRound;
  btnDeal.disabled = inRound;
}

function createDeck() {
  const suits=['♠','♥','♦','♣'];
  const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  const d=[]; for(const s of suits) for(const r of ranks) d.push({r,s}); shuffleArray(d); return d;
}

function cardValue(card){ if(!card) return 0; const r=card.r; if(r==='A') return 11; if(['J','Q','K'].includes(r)) return 10; return parseInt(r,10); }
function scoreHand(hand){ let total=0, aces=0; for(const c of hand){ total+=cardValue(c); if(c.r==='A') aces++; } while(total>21 && aces>0){ total-=10; aces--; } return total; }

function renderCardElement(cardObj, hide=false){ const div=document.createElement('div'); div.className='card'; if(hide){ div.classList.add('back'); div.textContent='🂠'; return div; } const isRed = ['♥','♦'].includes(cardObj.s); const suitSpanTop = document.createElement('div'); suitSpanTop.className='top ' + (isRed ? 'suit red' : 'suit black'); suitSpanTop.textContent = cardObj.r + cardObj.s; const center = document.createElement('div'); center.className='center'; center.textContent = cardObj.s; const bottom = document.createElement('div'); bottom.className='bottom ' + (isRed ? 'suit red' : 'suit black'); bottom.textContent = cardObj.r; div.appendChild(suitSpanTop); div.appendChild(center); div.appendChild(bottom); return div; }

function renderCards(el, hand, hideFirst=false){ if (!el) return; el.innerHTML=''; hand.forEach((c,i)=>{ el.appendChild(renderCardElement(c, hideFirst && i===0)); }); }
function renderScores(){ playerScoreEl.textContent = scoreHand(player) ? `(${scoreHand(player)})` : ''; dealerScoreEl.textContent = inRound ? '' : `(${scoreHand(dealer)})`; }
function log(msg){ if (logEl) logEl.textContent = msg }

function endRound(result){
  if(result==='blackjack'){ const win = Math.floor(bet * 1.5); currency.addGold(win); renderLast(`Blackjack! +$${win}`); }
  else if(result==='win'){ currency.addGold(bet); renderLast(`You win +$${bet}`); }
  else if(result==='push'){ renderLast('Push — bet returned'); }
  else if(result==='lose'){ currency.subtractGold(bet); renderLast(`You lose -$${bet}`); }
  inRound=false; if(currency.getGold() <= 0){ currency.setGold(50); renderLast('Bankruptcy — balance reset to $50'); } save(); updateUI(); renderScores();
}

function dealerPlay(){ while(scoreHand(dealer) < 17){ dealer.push(deck.pop()); } }

function deal(){ bet = Math.max(1, Math.floor(Number(betEl.value)||0)); if (bet <=0){ log('Place a valid bet.'); return } if (bet > currency.getGold()){ log('Bet cannot exceed balance.'); return } currency.subtractGold(bet); deck = createDeck(); dealer=[]; player=[]; player.push(deck.pop()); dealer.push(deck.pop()); player.push(deck.pop()); dealer.push(deck.pop()); inRound = true; renderCards(playerCardsEl, player); renderCards(dealerCardsEl, dealer, true); renderScores(); log('Round started — Hit, Stand, or Double.'); updateUI(); const pScore = scoreHand(player); if(pScore===21){ inRound=false; renderCards(dealerCardsEl, dealer); renderScores(); endRound('blackjack'); } }

function hit(){ if(!inRound) return; player.push(deck.pop()); renderCards(playerCardsEl, player); renderScores(); const pScore=scoreHand(player); if(pScore>21){ inRound=false; renderCards(dealerCardsEl, dealer); endRound('lose'); } updateUI(); }

function stand(){ if(!inRound) return; renderCards(dealerCardsEl, dealer); dealerPlay(); renderCards(dealerCardsEl, dealer); const pScore=scoreHand(player); const dScore=scoreHand(dealer); if(dScore>21||pScore>dScore) endRound('win'); else if(pScore===dScore) endRound('push'); else endRound('lose'); updateUI(); }

function dbl(){ if(!inRound) return; if((bet*2) > currency.getGold()){ log('Not enough balance to double.'); return } bet = bet * 2; player.push(deck.pop()); renderCards(playerCardsEl, player); renderScores(); if(scoreHand(player)>21){ inRound=false; renderCards(dealerCardsEl, dealer); endRound('lose'); updateUI(); return } renderCards(dealerCardsEl, dealer); dealerPlay(); renderCards(dealerCardsEl, dealer); const pScore=scoreHand(player); const dScore=scoreHand(dealer); if(dScore>21||pScore>dScore) endRound('win'); else if(pScore===dScore) endRound('push'); else endRound('lose'); updateUI(); }

// UI bindings
if (btnDeal) btnDeal.addEventListener('click', ()=>{ deal(); });
if (btnHit) btnHit.addEventListener('click', ()=>{ hit(); });
if (btnStand) btnStand.addEventListener('click', ()=>{ stand(); });
if (btnDouble) btnDouble.addEventListener('click', ()=>{ dbl(); });
if (betEl && betRange) betEl.addEventListener('input', ()=>{ betRange.value = betEl.value; });
if (betRange && betEl) betRange.addEventListener('input', ()=>{ betEl.value = betRange.value; });
presetBtns.forEach(b=> b.addEventListener('click', (e)=>{ const v=Number(e.currentTarget.dataset.bet); betEl.value=v; betRange.value=v; }));
if (btnReset) btnReset.addEventListener('click', ()=>{ if(confirm('Reset balance to $500?')){ currency.setGold(500); save(); updateUI(); renderLast('Balance reset to $500'); } });
if (btnMax) btnMax.addEventListener('click', ()=>{ betEl.value = Math.max(1, Math.floor(balance)); betRange.value = betEl.value; });

// Initialize
load();
