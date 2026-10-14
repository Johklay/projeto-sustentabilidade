import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabasePublishableKey, supabaseUrl } from "./supabase-config.js";

const form = document.querySelector("#form-participacao");
const nameInput = document.querySelector("#nome");
const emailInput = document.querySelector("#email");
const formFeedback = document.querySelector("#form-feedback");
const participantCount = document.querySelector("#participantes-count");
const counterFeedback = document.querySelector("#counter-feedback");

if (
  !(form instanceof HTMLFormElement) ||
  !(nameInput instanceof HTMLInputElement) ||
  !(emailInput instanceof HTMLInputElement) ||
  !(formFeedback instanceof HTMLParagraphElement) ||
  !(participantCount instanceof HTMLElement) ||
  !(counterFeedback instanceof HTMLParagraphElement)
) {
  throw new Error("Não foi possível inicializar os elementos da página.");
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);
const submitButton = form.querySelector('button[type="submit"]');

if (!(submitButton instanceof HTMLButtonElement)) {
  throw new Error("Não foi possível inicializar o botão de participação.");
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
  counterFeedback.textContent = "Não foi possível carregar a contagem de participantes.";
  console.error(error);
});

nameInput.addEventListener("input", () => {
  nameInput.setCustomValidity("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  nameInput.value = nameInput.value.trim();
  emailInput.value = emailInput.value.trim();
  nameInput.setCustomValidity(nameInput.value ? "" : "Informe seu nome.");
  formFeedback.hidden = true;

  if (!form.reportValidity()) {
    return;
  }

  submitButton.disabled = true;
  formFeedback.textContent = "Registrando sua participação...";
  formFeedback.hidden = false;

  let error;

  try {
    ({ error } = await supabase
      .from("participantes")
      .insert({ nome: nameInput.value }));
  } catch (cause) {
    console.error("Falha de conexão ao registrar participante.", cause);
    formFeedback.textContent = "Falha de conexão. Verifique sua internet e tente novamente.";
    submitButton.disabled = false;
    return;
  }

  submitButton.disabled = false;

  if (error) {
    formFeedback.textContent = "Não foi possível registrar sua participação. Tente novamente.";
    console.error("Falha ao registrar participante.", error);
    return;
  }

  formFeedback.textContent = "Sua participação foi registrada. Obrigado por fazer parte!";
  form.reset();

  try {
    await refreshParticipantCount();
  } catch (error) {
    console.error(error);
  }
});
