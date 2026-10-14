import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config.js";

const form = document.querySelector("#form-participacao");
const nameInput = document.querySelector("#nome");
const formFeedback = document.querySelector("#form-feedback");
const participantCount = document.querySelector("#participantes-count");
const counterFeedback = document.querySelector("#counter-feedback");

if (
  !(form instanceof HTMLFormElement) ||
  !(nameInput instanceof HTMLInputElement) ||
  !(formFeedback instanceof HTMLParagraphElement) ||
  !(participantCount instanceof HTMLElement) ||
  !(counterFeedback instanceof HTMLParagraphElement)
) {
  throw new Error("Não foi possível inicializar os elementos da página.");
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);
const submitButton = form.querySelector('button[type="submit"]');

if (!(submitButton instanceof HTMLButtonElement)) {
  throw new Error("Não foi possível inicializar o botão de registro de visita.");
}

const numberFormatter = new Intl.NumberFormat("pt-BR");

function displayParticipantCount(count) {
  participantCount.textContent = numberFormatter.format(count);
  counterFeedback.textContent = "Contagem atualizada.";
}

async function refreshParticipantCount() {
  const { data, error } = await supabase.rpc("contar_participantes");

  if (error) {
    throw new Error("Não foi possível carregar a contagem de participantes.", { cause: error });
  }

  if (data === null || data === undefined) {
    throw new Error("O Supabase não retornou a contagem de participantes.");
  }

  const count = Number(data);

  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("O Supabase retornou uma contagem de participantes inválida.");
  }

  displayParticipantCount(count);
}

supabase
  .channel("participantes", { config: { private: false } })
  .on("broadcast", { event: "count" }, ({ payload }) => {
    if (
      typeof payload?.count === "number" &&
      Number.isSafeInteger(payload.count) &&
      payload.count >= 0
    ) {
      displayParticipantCount(payload.count);
    }
  })
  .subscribe((status, error) => {
    if (status === "SUBSCRIBED") {
      counterFeedback.textContent = "Contagem atualizada em tempo real.";
      return;
    }

    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      counterFeedback.textContent = "Não foi possível atualizar a contagem em tempo real.";
      console.error("Falha na assinatura da contagem de participantes.", error);
    }
  });

refreshParticipantCount().catch((error) => {
  counterFeedback.textContent = "Não foi possível carregar a contagem de visitas.";
  console.error(error);
});

nameInput.addEventListener("input", () => {
  nameInput.setCustomValidity("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  nameInput.value = nameInput.value.trim();
  nameInput.setCustomValidity(nameInput.value ? "" : "Informe seu nome.");
  formFeedback.hidden = true;

  if (!form.reportValidity()) {
    return;
  }

  submitButton.disabled = true;
  formFeedback.textContent = "Registrando sua visita...";
  formFeedback.hidden = false;

  let error;

  try {
    ({ error } = await supabase
      .from("participantes")
      .insert({ nome: nameInput.value }));
  } catch (cause) {
    console.error("Falha de conexão ao registrar visita.", cause);
    formFeedback.textContent = "Falha de conexão. Verifique sua internet e tente novamente.";
    submitButton.disabled = false;
    return;
  }

  submitButton.disabled = false;

  if (error) {
    formFeedback.textContent = "Não foi possível registrar sua visita. Tente novamente.";
    console.error("Falha ao registrar visita.", error);
    return;
  }

  formFeedback.textContent = "Sua visita foi registrada. Obrigado por consultar nossas orientações!";
  form.reset();

  try {
    await refreshParticipantCount();
  } catch (error) {
    console.error(error);
  }
});

const guidanceFilters = document.querySelectorAll("[data-guide-filter]");
const guidanceCards = document.querySelectorAll("[data-guide-category]");
const guidanceFilterStatus = document.querySelector("#guidance-filter-status");

guidanceFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.guideFilter;
    let visibleCount = 0;

    guidanceFilters.forEach((button) => {
      const isActive = button === filter;
      button.setAttribute("aria-pressed", String(isActive));
    });

    guidanceCards.forEach((card) => {
      const isVisible = category === "all" || card.dataset.guideCategory === category;
      card.hidden = !isVisible;
      visibleCount += Number(isVisible);
    });

    if (guidanceFilterStatus instanceof HTMLParagraphElement) {
      guidanceFilterStatus.textContent = `Exibindo ${visibleCount} ${visibleCount === 1 ? "orientação" : "orientações"}.`;
    }
  });
});

const actionCheckboxes = [...document.querySelectorAll("[data-action-check]")];
const actionProgress = document.querySelector("#action-progress");
const actionProgressLabel = document.querySelector("#action-progress-label");
const resetActionsButton = document.querySelector("[data-reset-actions]");
const actionStorageKey = "sustenta-local-action-plan-v1";

if (
  actionCheckboxes.length > 0 &&
  actionProgress instanceof HTMLProgressElement &&
  actionProgressLabel instanceof HTMLParagraphElement &&
  resetActionsButton instanceof HTMLButtonElement
) {
  try {
    const savedActions = JSON.parse(localStorage.getItem(actionStorageKey) || "[]");

    if (Array.isArray(savedActions)) {
      actionCheckboxes.forEach((checkbox) => {
        checkbox.checked = savedActions.includes(checkbox.id);
      });
    }
  } catch (error) {
    console.warn("Não foi possível restaurar o plano de ação salvo.", error);
  }

  function updateActionPlan() {
    const selectedActions = actionCheckboxes.filter((checkbox) => checkbox.checked);
    const selectedCount = selectedActions.length;

    actionProgress.value = selectedCount;
    actionProgressLabel.textContent = `${selectedCount} de ${actionCheckboxes.length} ações selecionadas.`;

    try {
      localStorage.setItem(actionStorageKey, JSON.stringify(selectedActions.map((checkbox) => checkbox.id)));
    } catch (error) {
      console.warn("Não foi possível salvar o plano de ação neste navegador.", error);
    }
  }

  actionCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", updateActionPlan);
  });

  resetActionsButton.addEventListener("click", () => {
    actionCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    updateActionPlan();
  });

  updateActionPlan();
}
