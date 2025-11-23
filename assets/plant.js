// Основной скрипт для страницы растения (plants/plant.html)
// Получаем id растения из query string
const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");

function showError(msg) {
  const nameEl = document.getElementById("plantName");
  if (nameEl) nameEl.textContent = msg;
}

// Если id не указан — показываем сообщение
if (!plantId) {
  showError("Ошибка: растение не указано в URL (например ?id=igor)");
  throw new Error("No plant id in URL");
}

// Загружаем данные о растениях (имена)
fetch("../data/plants.json")
  .then(r => {
    if (!r.ok) throw new Error("Не удалось загрузить plants.json");
    return r.json();
  })
  .then(data => {
    const plant = (data.plants || []).find(p => p.id === plantId);
    if (!plant) {
      showError("Растение не найдено");
      return;
    }
    document.getElementById("plantName").textContent = plant.name;
    // После установки имени и загрузки данных — инициализируем UI
    initializeUI();
    buildInstructions();
  })
  .catch(err => {
    console.error(err);
    showError("Ошибка загрузки данных");
  });

// ========== СЕЗОНЫ И УСЛОВИЯ ==========
function getMonth() {
  return new Date().getMonth() + 1;
}
function getSeasonConditions(m) {
  if (3 <= m && m <= 5) return { hnu: [8,10], t: [15,25], N: [0,1] };
  if (6 <= m && m <= 8) return { hnu: [12,14], t: [20,30], N: [1,2] };
  if (9 <= m && m <= 11) return { hnu: [6,8], t: [5,15], N: [0] };
  return { hnu: [4,6], t: [0,10], N: [] };
}
function getSeasonConstants(m) {
  if (3 <= m && m <= 5) return { hnu: 9, T_season: 20, k_season: 1.0 };
  if (6 <= m && m <= 8) return { hnu: 13, T_season: 25, k_season: 1.3 };
  if (9 <= m && m <= 11) return { hnu: 7, T_season: 10, k_season: 0.6 };
  return { hnu: 5, T_season: 5, k_season: 0.2 };
}

function getPlantPhase(m) {
  if (3 <= m && m <= 5) return "Фаза активного роста";
  if (6 <= m && m <= 8) return "Фаза максимальной активности";
  if (9 <= m && m <= 11) return "Фаза подготовки к спячке";
  return "Фаза спячки";
}

function buildInstructions() {
  const m = getMonth();
  const cond = getSeasonConditions(m);
  let sunHours = `${cond.hnu[0]}–${cond.hnu[1]} ч`;
  let tempRange = `${cond.t[0]}–${cond.t[1]}`;

  let feedingInfo = '';
  if (cond.N.length === 2) feedingInfo = `Можно кормить 1-2 раза живыми насекомыми: мухами, комарами и пауками.`;
  else if (cond.N.length === 1) feedingInfo = "Можно покормить 1 раз — растение готовится к спячке.";
  else feedingInfo = "Растение в состоянии покоя, кормить не нужно.";

  let wateringInfo = "Использовать только дистиллированную или дождевую воду. Почва должна быть влажной, но не залитой. Поливать снизу через поддон.";
  let repotInfo = m === 3 ? "Можно пересаживать в свежий субстрат из торфа и песка." : "В этот период пересадка не рекомендуется.";

  document.getElementById('plantPhase').textContent = getPlantPhase(m);
  document.getElementById('sunHours').textContent = sunHours;
  document.getElementById('tempRange').textContent = tempRange;
  document.getElementById('feedingInfo').textContent = feedingInfo;
  document.getElementById('wateringInfo').textContent = wateringInfo;
  document.getElementById('repotInfo').textContent = repotInfo;
}

// ========== UI: слайдеры, кнопки, расчёт ==========
function initializeUI() {
  const sliders = ['vPot','temp','fPlant'];
  sliders.forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', e=>{
      const valDiv = document.getElementById(id+'Val');
      if (!valDiv) return;
      if (id==='vPot') valDiv.textContent = e.target.value + ' мл';
      else if (id==='temp') valDiv.textContent = e.target.value + ' °C';
      else valDiv.textContent = e.target.value;
    });
  });

  const btnCalc = document.getElementById('btnCalc');
  const btnReset = document.getElementById('btnReset');
  if (btnCalc) btnCalc.addEventListener('click', calculateWater);
  if (btnReset) btnReset.addEventListener('click', resetAll);

  // Установим начальные значения визуально
  resetAll();
}

function calculateWater() {
  const T = parseFloat(document.getElementById('temp').value);
  const V = parseFloat(document.getElementById('vPot').value);
  const f = parseFloat(document.getElementById('fPlant').value);
  const consts = getSeasonConstants(getMonth());
  const hnu = consts.hnu;
  const k = consts.k_season;
  // Формула W = 30*(hnu/10)*(1+0.03*(T-20))*(V/250)*k*f
  const W = 30 * (hnu/10) * (1 + 0.03 * (T - 20)) * (V / 250) * k * f;
  document.getElementById('result').textContent = Math.max(0, Math.round(W)) + ' мл/сут';
}

function resetAll() {
  const temp = document.getElementById('temp');
  const vPot = document.getElementById('vPot');
  const fPlant = document.getElementById('fPlant');

  if (temp) { temp.value = 20; document.getElementById('tempVal').textContent = '20 °C'; }
  if (vPot) { vPot.value = 50; document.getElementById('vPotVal').textContent = '50 мл'; }
  if (fPlant) { fPlant.value = 0.9; document.getElementById('fPlantVal').textContent = '0.9'; }

  const res = document.getElementById('result');
  if (res) res.textContent = '—';
}
