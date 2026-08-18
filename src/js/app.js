
const burgerBtn = document.getElementById("burger-btn");
const mainNav = document.getElementById("main-nav");
const navBackdrop = document.getElementById("nav-backdrop");
const navLinks = document.querySelectorAll(".header__link");
const subscribeForm = document.querySelector(".subscribe__form");

function openMenu() {
  mainNav.classList.add("is-open");
  burgerBtn.classList.add("is-active");
  if (navBackdrop) navBackdrop.classList.add("is-open");
  burgerBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  mainNav.classList.remove("is-open");
  burgerBtn.classList.remove("is-active");
  if (navBackdrop) navBackdrop.classList.remove("is-open");
  burgerBtn.setAttribute("aria-expanded", "false");
}

if (burgerBtn && mainNav) {
 
  burgerBtn.addEventListener("click", () => {
    if (mainNav.classList.contains("is-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  
  if (navBackdrop) {
    navBackdrop.addEventListener("click", closeMenu);
  }


  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });


  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu();
    }
  });
}


if (subscribeForm) {
  subscribeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const emailInput = subscribeForm.querySelector(".subscribe__input");
    if (emailInput && emailInput.value.trim()) {
      alert(`Thank you for subscribing: ${emailInput.value.trim()}!`);
      emailInput.value = "";
    }
  });
}


const initialMembers = [
  {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.j@photographyuk.co.uk",
    type: "Membership Organisation",
    plan: "Pro",
    fee: 49,
    status: "Active",
  },
  {
    id: 2,
    name: "David Miller",
    email: "d.miller@londonrunners.org",
    type: "Clubs And Groups",
    plan: "Basic",
    fee: 19,
    status: "Active",
  },
  {
    id: 3,
    name: "Elena Rostova",
    email: "elena@nationalchess.org.uk",
    type: "National Association",
    plan: "Enterprise",
    fee: 99,
    status: "Expired",
  },
];


function loadMembers() {
  try {
    const stored = localStorage.getItem("nexcent_members");
    if (!stored) return initialMembers;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : initialMembers;
  } catch (error) {
    console.warn(
      "Не удалось прочитать nexcent_members из localStorage, использую данные по умолчанию:",
      error,
    );
    return initialMembers;
  }
}

let members = loadMembers();


const tableBody = document.getElementById("dashboard-tbody");
const emptyMessage = document.getElementById("dashboard-empty");
const searchInput = document.getElementById("dashboard-search");
const filterSelect = document.getElementById("dashboard-filter");

const metricTotal = document.getElementById("metric-total");
const metricActive = document.getElementById("metric-active");
const metricRevenue = document.getElementById("metric-revenue");

const modal = document.getElementById("member-modal");
const btnOpenModal = document.getElementById("btn-open-modal");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancelModal = document.getElementById("btn-cancel-modal");
const modalOverlay = document.getElementById("modal-overlay");
const addMemberForm = document.getElementById("add-member-form");


function saveMembers() {
  try {
    localStorage.setItem("nexcent_members", JSON.stringify(members));
  } catch (error) {
    console.warn("Не удалось сохранить nexcent_members в localStorage:", error);
  }
}


function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function updateMetrics() {
  const total = members.length;
  const activeMembers = members.filter((member) => member.status === "Active");
  const activeCount = activeMembers.length;
  const revenue = activeMembers.reduce(
    (sum, member) => sum + Number(member.fee),
    0,
  );

  if (metricTotal) metricTotal.textContent = total;
  if (metricActive) metricActive.textContent = activeCount;
  if (metricRevenue) metricRevenue.textContent = `£${revenue}`;
}

function renderTable() {
  if (!tableBody) return;

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedType = filterSelect ? filterSelect.value : "all";

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm);

    const matchesType = selectedType === "all" || member.type === selectedType;

    return matchesSearch && matchesType;
  });

  if (filteredMembers.length === 0) {
    tableBody.innerHTML = "";
    if (emptyMessage) emptyMessage.style.display = "block";
    return;
  }

  if (emptyMessage) emptyMessage.style.display = "none";

  tableBody.innerHTML = filteredMembers
    .map((member) => {
      const badgeClass =
        member.status === "Active" ? "badge--active" : "badge--expired";

      return `
        <tr>
          <td>
            <div class="dashboard__member-info">
              <span class="dashboard__member-name">${escapeHtml(member.name)}</span>
              <span class="dashboard__member-email">${escapeHtml(member.email)}</span>
            </div>
          </td>
          <td>${escapeHtml(member.type)}</td>
          <td>${escapeHtml(member.plan)}</td>
          <td>£${escapeHtml(member.fee)}</td>
          <td>
            <span class="badge ${badgeClass}">${escapeHtml(member.status)}</span>
          </td>
          <td>
            <button
              type="button"
              class="dashboard__action-btn dashboard__action-btn--toggle"
              data-id="${member.id}"
              data-action="toggle"
            >
              Change Status
            </button>
            <button
              type="button"
              class="dashboard__action-btn dashboard__action-btn--delete"
              data-id="${member.id}"
              data-action="delete"
            >
              Delete
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

// ==========================================
// 5. Обработчики событий Dashboard
// ==========================================
if (tableBody) {
  tableBody.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "delete") {
      members = members.filter((member) => member.id !== id);
    } else if (action === "toggle") {
      members = members.map((member) => {
        if (member.id === id) {
          return {
            ...member,
            status: member.status === "Active" ? "Expired" : "Active",
          };
        }
        return member;
      });
    }

    saveMembers();
    updateMetrics();
    renderTable();
  });
}

if (searchInput) searchInput.addEventListener("input", renderTable);
if (filterSelect) filterSelect.addEventListener("change", renderTable);

function openModal() {
  if (!modal) return;
  modal.classList.add("is-open");

  modal.setAttribute("aria-hidden", "false");
  const firstInput = document.getElementById("member-name");
  if (firstInput) firstInput.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (addMemberForm) addMemberForm.reset();
}

if (btnOpenModal) btnOpenModal.addEventListener("click", openModal);
if (btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if (btnCancelModal) btnCancelModal.addEventListener("click", closeModal);
if (modalOverlay) modalOverlay.addEventListener("click", closeModal);

if (addMemberForm) {
  addMemberForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const rawFee = Number(document.getElementById("member-fee").value);
    const fee = Number.isFinite(rawFee) ? Math.max(0, rawFee) : 0;

    const newMember = {
      id: Date.now(),
      name: document.getElementById("member-name").value.trim(),
      email: document.getElementById("member-email").value.trim(),
      type: document.getElementById("member-type").value,
      plan: document.getElementById("member-plan").value,
      fee,
      status: "Active",
    };

    members.unshift(newMember);
    saveMembers();
    updateMetrics();
    renderTable();
    closeModal();
  });
}


updateMetrics();
renderTable();
