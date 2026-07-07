// ================================================
// app.js — Utilitários globais do sistema
// ================================================

import { db } from './firebase-config.js';
import {
  doc, setDoc, getDoc, collection, query, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---- Toast Notifications ----
export function showToast(message, type = 'success') {
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function createToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

// ---- Loading overlay ----
export function showLoading() {
  document.getElementById('loading-overlay')?.classList.add('show');
}
export function hideLoading() {
  document.getElementById('loading-overlay')?.classList.remove('show');
}

// ---- Formata moeda ----
export function formatCurrency(value) {
  if (!value && value !== 0) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ---- Formata percentual ----
export function formatPercent(value) {
  if (!value && value !== 0) return '';
  return `${parseFloat(value).toFixed(1)}%`;
}

// ---- Salva dados no Firestore ----
export async function saveData(loja, diaId, modulo, data) {
  const ref = doc(db, 'lojas', loja, 'dias', diaId, 'dados', modulo);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

// ---- Carrega dados do Firestore ----
export async function loadData(loja, diaId, modulo) {
  const ref = doc(db, 'lojas', loja, 'dias', diaId, 'dados', modulo);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ---- Gera ID da semana ----
export function buildWeekId(year, month, week) {
  return `${year}-${String(month).padStart(2,'0')}-W${week}`;
}

// ---- Calcula % de atingimento da meta ----
export function calcMeta(realizado, meta) {
  if (!meta || meta === 0) return 0;
  return Math.round((realizado / meta) * 100);
}

// ---- Badge de status da meta ----
export function metaBadge(pct) {
  if (pct >= 100) return { cls: 'badge-success', label: `${pct}%` };
  if (pct >= 70) return { cls: 'badge-warning', label: `${pct}%` };
  return { cls: 'badge-danger', label: `${pct}%` };
}

// ---- Semáforo cor ----
export function semaforoClass(pct) {
  if (pct >= 100) return 'meta-green';
  if (pct >= 70) return 'meta-yellow';
  return 'meta-red';
}

// ---- Inicializa sidebar ----
export function initSidebar(activePage) {
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.page === activePage) {
      item.classList.add('active');
    }
    item.addEventListener('click', () => {
      window.location.href = item.dataset.href;
    });
  });
}

// ---- Popula initials do avatar ----
export function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// ---- Debounce ----
export function debounce(fn, delay = 800) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// ---- Mês por extenso em PT-BR ----
export function monthName(monthNum) {
  const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  return months[monthNum - 1] || '';
}

// ---- Configura o seletor de lojas na sidebar ----
export function setupStoreSelector(userRole, currentPage) {
  const select = document.getElementById('store-select');
  if (!select) return;

  select.innerHTML = ''; // Limpa

  const LOJAS_OPTIONS = {
    matriz:      "Matriz",
    zona_sul:    "Zona Sul",
    gravataí:   "Gravataí",
    viamao:      "Viamão",
    multimarcas: "Multimarcas"
  };

  // Adiciona a opção "Grupo (Todos)" para todos os usuários
  const optGrupo = document.createElement('option');
  optGrupo.value = 'grupo';
  optGrupo.textContent = 'Grupo (Todos)';
  select.appendChild(optGrupo);

  // Adiciona as lojas
  Object.entries(LOJAS_OPTIONS).forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    select.appendChild(opt);
  });

  // Determina o valor ativo
  let activeLoja = sessionStorage.getItem('activeLoja');

  if (!activeLoja) {
    activeLoja = 'grupo';
    sessionStorage.setItem('activeLoja', activeLoja);
  }

  // Todos podem mudar de loja
  select.disabled = false;
  select.title = 'Selecione a loja para visualizar';
  select.value = activeLoja;

  // Todos os usuários podem trocar de loja
  select.addEventListener('change', (e) => {
    const newVal = e.target.value;
    sessionStorage.setItem('activeLoja', newVal);

    if (newVal === 'grupo') {
      window.location.href = 'admin.html';
    } else if (currentPage === 'admin') {
      // Se estiver no admin, vai para dashboard da loja
      window.location.href = 'dashboard.html';
    } else {
      // Recarrega a página atual com a nova loja
      window.location.reload();
    }
  });

  // Configura a exibição e cliques da lista de lojas na sidebar
  const storesContainer = document.getElementById('sidebar-lojas-container');
  if (storesContainer) {
    if (activeLoja === 'grupo') {
      storesContainer.style.display = 'none';
    } else {
      storesContainer.style.display = 'block';

      const navLojas = {
        'nav-matriz': 'matriz',
        'nav-zona-sul': 'zona_sul',
        'nav-gravataí': 'gravataí',
        'nav-viamao': 'viamao',
        'nav-multi': 'multimarcas'
      };

      Object.entries(navLojas).forEach(([id, key]) => {
        const link = document.getElementById(id);
        if (link) {
          link.onclick = (e) => {
            e.preventDefault();
            sessionStorage.setItem('activeLoja', key);
            if (currentPage === 'admin') {
              window.location.href = 'dashboard.html';
            } else {
              window.location.reload();
            }
          };

          // Destaca visualmente a loja ativa
          if (key === activeLoja) {
            link.style.borderLeft = '3px solid var(--primary)';
            link.style.background = 'var(--primary-glow)';
            link.style.color = 'var(--primary-light)';
            link.style.fontWeight = '700';
          } else {
            link.style.borderLeft = '';
            link.style.background = '';
            link.style.color = '';
            link.style.fontWeight = '';
          }
        }
      });
    }
  }
}

export function getDaysInDateRange(startDateStr, endDateStr) {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T23:59:59');
  const days = [];

  let curr = new Date(start);
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = curr.getMonth() + 1;
    const d = curr.getDate();
    days.push(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    curr.setDate(curr.getDate() + 1);
  }

  return days;
}

export async function loadAndAggregateData(loja, days, modulo) {
  if (!days || days.length === 0) return null;
  const promises = days.map(d => loadData(loja, d, modulo));
  const docs = await Promise.all(promises);
  
  const validDocs = docs.filter(d => d !== null);
  if (validDocs.length === 0) return null;

  if (modulo === 'leads') {
    const res = {
      leads_quantidade: 0,
      leads_quantidade_meta: 0,
      vendas_fechadas: 0,
      vendas_fechadas_meta: 0,
      agendamentos: 0,
      visitas_showroom: 0,
      avaliacoes_realizadas: 0,
      propostas_andamento: 0,
      desqualificados: 0
    };
    validDocs.forEach(d => {
      res.leads_quantidade += d.leads_quantidade || 0;
      res.leads_quantidade_meta += d.leads_quantidade_meta || 0;
      res.vendas_fechadas += d.vendas_fechadas || 0;
      res.vendas_fechadas_meta += d.vendas_fechadas_meta || 0;
      res.agendamentos += d.agendamentos || 0;
      res.visitas_showroom += d.visitas_showroom || 0;
      res.avaliacoes_realizadas += d.avaliacoes_realizadas || 0;
      res.propostas_andamento += d.propostas_andamento || 0;
      res.desqualificados += d.desqualificados || 0;
    });
    return res;
  }

  if (modulo === 'estoque') {
    return validDocs[validDocs.length - 1];
  }

  if (modulo === 'vendedores') {
    const res = {
      leads_quentes: [],
      negocios_travados: [],
      perf_realizado: 0,
      perf_meta: 0,
      nps: 0,
      fin_banco_a: 0,
      fin_banco_b: 0,
      fin_banco_c: 0,
      fin_avista: 0,
      fin_outros: 0,
      perda_preco: 0,
      perda_concorrencia: 0,
      perda_credito: 0,
      perda_avaliacao: 0,
      perda_sem_retorno: 0,
      fin_faturamento: 0,
      fin_ticket_medio: 0,
      fin_margem_bruta: 0,
      fin_margem_pct: 0
    };
    let npsCount = 0;
    let npsSum = 0;

    validDocs.forEach(d => {
      if (d.leads_quentes) res.leads_quentes.push(...d.leads_quentes);
      if (d.negocios_travados) res.negocios_travados.push(...d.negocios_travados);

      res.perf_realizado += d.perf_realizado || 0;
      res.perf_meta += d.perf_meta || 0;

      if (d.nps > 0) {
        npsSum += d.nps;
        npsCount++;
      }

      res.fin_banco_a += d.fin_banco_a || 0;
      res.fin_banco_b += d.fin_banco_b || 0;
      res.fin_banco_c += d.fin_banco_c || 0;
      res.fin_avista += d.fin_avista || 0;
      res.fin_outros += d.fin_outros || 0;

      res.perda_preco += d.perda_preco || 0;
      res.perda_concorrencia += d.perda_concorrencia || 0;
      res.perda_credito += d.perda_credito || 0;
      res.perda_avaliacao += d.perda_avaliacao || 0;
      res.perda_sem_retorno += d.perda_sem_retorno || 0;

      res.fin_faturamento += d.fin_faturamento || 0;
      res.fin_ticket_medio += d.fin_ticket_medio || 0;
      res.fin_margem_bruta += d.fin_margem_bruta || 0;
      res.fin_margem_pct += d.fin_margem_pct || 0;
    });

    res.nps = npsCount > 0 ? Math.round(npsSum / npsCount) : 0;
    if (validDocs.length > 0) {
      res.fin_ticket_medio = Math.round(res.fin_ticket_medio / validDocs.length);
      res.fin_margem_pct = Math.round(res.fin_margem_pct / validDocs.length);
    }
    return res;
  }

  if (modulo === 'plano_acao') {
    const res = { acoes: [] };
    validDocs.forEach(d => {
      if (d.acoes) {
        res.acoes.push(...d.acoes);
      }
    });
    return res;
  }

  return null;
}

// ============================================
// SELETOR DE PERÍODOS PERSONALIZADO (POPUP)
// ============================================
export function initCustomPeriodPicker(inputElOrId, onApply) {
  const inputEl = typeof inputElOrId === 'string' ? document.getElementById(inputElOrId) : inputElOrId;
  if (!inputEl) return;

  const parent = inputEl.parentElement;
  if (!parent) return;

  // Garantir que o pai seja relative
  parent.style.position = 'relative';

  // 1. Criar o HTML do popover
  const popover = document.createElement('div');
  popover.className = 'period-picker-popover';
  popover.id = 'custom-period-picker-popover';

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const years = [2024, 2025, 2026, 2027];

  popover.innerHTML = `
    <div class="period-picker-left">
      <div class="period-picker-section-title">Personalizado</div>
      
      <!-- Linha De -->
      <div class="period-picker-row">
        <div class="period-picker-row-header">
          <label>De</label>
          <div class="period-picker-select-group">
            <select class="period-picker-select" id="pick-from-month">
              ${months.map((m, i) => `<option value="${i}">${m}</option>`).join('')}
            </select>
            <select class="period-picker-select" id="pick-from-year">
              ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="period-picker-date-input-group">
          <input type="text" class="period-picker-date-input" id="pick-from-date" placeholder="01/01/2026" />
          <span class="period-picker-calendar-icon" id="pick-from-cal">📅</span>
        </div>
      </div>

      <!-- Linha Até -->
      <div class="period-picker-row">
        <div class="period-picker-row-header">
          <label>Até</label>
          <div class="period-picker-select-group">
            <select class="period-picker-select" id="pick-to-month">
              ${months.map((m, i) => `<option value="${i}">${m}</option>`).join('')}
            </select>
            <select class="period-picker-select" id="pick-to-year">
              ${years.map(y => `<option value="${y}">${y}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="period-picker-date-input-group">
          <input type="text" class="period-picker-date-input" id="pick-to-date" placeholder="30/06/2026" />
          <span class="period-picker-calendar-icon" id="pick-to-cal">📅</span>
        </div>
      </div>

      <!-- Grade de Meses -->
      <div class="period-picker-months-grid">
        ${['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => `
          <button class="period-picker-month-btn" data-month="${i}">${m}</button>
        `).join('')}
      </div>

      <!-- Botões Ação -->
      <div class="period-picker-actions">
        <button class="period-picker-btn-cancel" id="pick-btn-cancel">Cancelar</button>
        <button class="period-picker-btn-apply" id="pick-btn-apply">Aplicar</button>
      </div>
    </div>

    <div class="period-picker-right">
      <div class="period-picker-section-title">Filtros</div>
      <button class="period-picker-filter-btn" data-filter="hoje">Hoje</button>
      <button class="period-picker-filter-btn" data-filter="ontem">Ontem</button>
      <button class="period-picker-filter-btn" data-filter="7d">Últimos 7 Dias</button>
      <button class="period-picker-filter-btn" data-filter="30d">Últimos 30 Dias</button>
      <button class="period-picker-filter-btn" data-filter="este-mes">Este Mês</button>
      <button class="period-picker-filter-btn" data-filter="mes-passado">Mês Passado</button>
      <button class="period-picker-filter-btn" data-filter="3m">Últimos 3 Meses</button>
      <button class="period-picker-filter-btn" data-filter="6m">Últimos 6 Meses</button>
      <button class="period-picker-filter-btn" data-filter="este-ano">Este Ano</button>
      <button class="period-picker-filter-btn" data-filter="ultimo-ano">Último Ano</button>
    </div>
  `;

  parent.appendChild(popover);

  let currentStart = new Date();
  let currentEnd = new Date();

  function parseCurrentInput() {
    const val = inputEl.value;
    if (val && val.includes(' - ')) {
      const parts = val.split(' - ');
      const startParts = parts[0].split('/');
      const endParts = parts[1].split('/');
      if (startParts.length === 3 && endParts.length === 3) {
        currentStart = new Date(startParts[2], startParts[1] - 1, startParts[0]);
        currentEnd = new Date(endParts[2], endParts[1] - 1, endParts[0]);
      }
    } else {
      const now = new Date();
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = now;
    }
  }

  parseCurrentInput();

  const fromMonthSel = popover.querySelector('#pick-from-month');
  const fromYearSel = popover.querySelector('#pick-from-year');
  const fromDateInp = popover.querySelector('#pick-from-date');
  const toMonthSel = popover.querySelector('#pick-to-month');
  const toYearSel = popover.querySelector('#pick-to-year');
  const toDateInp = popover.querySelector('#pick-to-date');

  const monthBtns = popover.querySelectorAll('.period-picker-month-btn');
  const filterBtns = popover.querySelectorAll('.period-picker-filter-btn');

  const fpFrom = flatpickr(popover.querySelector('#pick-from-date'), {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    onChange: function(dates) {
      if (dates.length === 1) {
        currentStart = dates[0];
        updateSelectsFromDates();
        highlightMonthsAndFilters();
      }
    }
  });

  const fpTo = flatpickr(popover.querySelector('#pick-to-date'), {
    locale: 'pt',
    dateFormat: 'd/m/Y',
    onChange: function(dates) {
      if (dates.length === 1) {
        currentEnd = dates[0];
        updateSelectsFromDates();
        highlightMonthsAndFilters();
      }
    }
  });

  popover.querySelector('#pick-from-cal').addEventListener('click', () => fpFrom.open());
  popover.querySelector('#pick-to-cal').addEventListener('click', () => fpTo.open());

  function formatDate(d) {
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  function updateSelectsFromDates() {
    fromMonthSel.value = currentStart.getMonth();
    fromYearSel.value = currentStart.getFullYear();
    fromDateInp.value = formatDate(currentStart);

    toMonthSel.value = currentEnd.getMonth();
    toYearSel.value = currentEnd.getFullYear();
    toDateInp.value = formatDate(currentEnd);
  }

  function updateDatesFromSelects() {
    const fromM = parseInt(fromMonthSel.value);
    const fromY = parseInt(fromYearSel.value);
    let fromDay = currentStart.getDate();
    const lastDayFrom = new Date(fromY, fromM + 1, 0).getDate();
    if (fromDay > lastDayFrom) fromDay = lastDayFrom;
    currentStart = new Date(fromY, fromM, fromDay);

    const toM = parseInt(toMonthSel.value);
    const toY = parseInt(toYearSel.value);
    let toDay = currentEnd.getDate();
    const lastDayTo = new Date(toY, toM + 1, 0).getDate();
    if (toDay > lastDayTo) toDay = lastDayTo;
    currentEnd = new Date(toY, toM, toDay);

    fromDateInp.value = formatDate(currentStart);
    toDateInp.value = formatDate(currentEnd);

    highlightMonthsAndFilters();
  }

  [fromMonthSel, fromYearSel, toMonthSel, toYearSel].forEach(sel => {
    sel.addEventListener('change', updateDatesFromSelects);
  });

  monthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const monthIdx = parseInt(btn.getAttribute('data-month'));
      const activeYear = currentStart.getFullYear();
      
      currentStart = new Date(activeYear, monthIdx, 1);
      currentEnd = new Date(activeYear, monthIdx + 1, 0);

      updateSelectsFromDates();
      highlightMonthsAndFilters();
    });
  });

  function highlightMonthsAndFilters() {
    const startM = currentStart.getMonth();
    const startY = currentStart.getFullYear();
    const endM = currentEnd.getMonth();
    const endY = currentEnd.getFullYear();

    monthBtns.forEach(btn => {
      const mIdx = parseInt(btn.getAttribute('data-month'));
      if (startY === endY) {
        if (mIdx >= startM && mIdx <= endM) {
          btn.classList.add('highlighted');
          if (mIdx === startM && mIdx === endM) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        } else {
          btn.className = 'period-picker-month-btn';
        }
      } else {
        btn.className = 'period-picker-month-btn';
      }
    });

    filterBtns.forEach(btn => {
      btn.classList.remove('active');
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      const today = new Date();
      let start = new Date();
      let end = new Date();

      switch (filter) {
        case 'hoje':
          start = today;
          end = today;
          break;
        case 'ontem':
          const yest = new Date(today);
          yest.setDate(today.getDate() - 1);
          start = yest;
          end = yest;
          break;
        case '7d':
          const d7 = new Date(today);
          d7.setDate(today.getDate() - 6);
          start = d7;
          end = today;
          break;
        case '30d':
          const d30 = new Date(today);
          d30.setDate(today.getDate() - 29);
          start = d30;
          end = today;
          break;
        case 'este-mes':
          start = new Date(today.getFullYear(), today.getMonth(), 1);
          end = today;
          break;
        case 'mes-passado':
          start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          end = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case '3m':
          start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
          end = today;
          break;
        case '6m':
          start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
          end = today;
          break;
        case 'este-ano':
          start = new Date(today.getFullYear(), 0, 1);
          end = today;
          break;
        case 'ultimo-ano':
          start = new Date(today.getFullYear() - 1, 0, 1);
          end = new Date(today.getFullYear() - 1, 11, 31);
          break;
      }

      currentStart = start;
      currentEnd = end;

      updateSelectsFromDates();
      highlightMonthsAndFilters();
      btn.classList.add('active');
    });
  });

  function showPopover() {
    parseCurrentInput();
    updateSelectsFromDates();
    highlightMonthsAndFilters();
    popover.classList.add('show');
  }

  function hidePopover() {
    popover.classList.remove('show');
  }

  parent.addEventListener('click', (e) => {
    if (e.target === inputEl || inputEl.contains(e.target)) {
      showPopover();
    }
  });

  document.addEventListener('click', (e) => {
    if (!parent.contains(e.target)) {
      hidePopover();
    }
  });

  popover.querySelector('#pick-btn-cancel').addEventListener('click', (e) => {
    e.preventDefault();
    hidePopover();
  });

  popover.querySelector('#pick-btn-apply').addEventListener('click', (e) => {
    e.preventDefault();
    inputEl.value = `${formatDate(currentStart)} - ${formatDate(currentEnd)}`;
    hidePopover();
    if (onApply) {
      onApply(currentStart, currentEnd);
    }
  });

  updateSelectsFromDates();
}

