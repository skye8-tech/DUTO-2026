/**
 * Duto-AI — uses Groq from the browser.
 * API key is entered by the user and saved in localStorage only.
 */
const AI_HISTORY_KEY = "duto_ai_history";
const GROQ_KEY_STORAGE = "duto_groq_api_key";
const GROQ_MODEL = "llama-3.3-70b-versatile";

function getGroqApiKey() {
  try {
    let raw = localStorage.getItem(GROQ_KEY_STORAGE);
    if (!raw) return "";
    // stored as plain string or JSON string
    try {
      let parsed = JSON.parse(raw);
      if (typeof parsed === "string") return parsed;
    } catch (e) {}
    return raw;
  } catch (e2) {
    return "";
  }
}

function setGroqApiKey(key) {
  localStorage.setItem(GROQ_KEY_STORAGE, key || "");
}

function clearGroqApiKey() {
  localStorage.removeItem(GROQ_KEY_STORAGE);
}

function loadChatHistory() {
  let h = loadData(AI_HISTORY_KEY, []);
  return Array.isArray(h) ? h : [];
}

function saveChatHistory(history) {
  saveData(AI_HISTORY_KEY, history);
}

function callGroq(history) {
  let apiKey = getGroqApiKey();
  if (!apiKey) {
    return Promise.reject(new Error("Add your Groq API key above to use Duto-AI."));
  }

  let messages = [
    {
      role: "system",
      content:
        "You are Duto-AI, a helpful study assistant. Explain clearly and keep answers practical."
    }
  ];
  for (let i = 0; i < history.length; i++) {
    messages.push({
      role: history[i].role === "user" ? "user" : "assistant",
      content: history[i].text
    });
  }

  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.6
    })
  }).then(function (res) {
    return res.json().then(function (data) {
      if (!res.ok) {
        let msg =
          (data && data.error && data.error.message) ||
          "Request failed (" + res.status + "). Check your API key and try again.";
        throw new Error(msg);
      }
      if (
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        return data.choices[0].message.content;
      }
      throw new Error("No response was returned. Try again.");
    });
  });
}

function escapeHtml(text) {
  let d = document.createElement("div");
  d.textContent = text || "";
  return d.innerHTML;
}

function renderChat() {
  let box = document.getElementById("chat-messages");
  if (!box) return;
  let history = loadChatHistory();
  box.innerHTML = "";
  if (history.length === 0) {
    box.innerHTML =
      '<div class="chat-bubble chat-bubble-ai">Hi! I am Duto-AI. Save your Groq API key above, then ask a study question.</div>';
    return;
  }
  for (let i = 0; i < history.length; i++) {
    let bubble = document.createElement("div");
    bubble.className =
      "chat-bubble " +
      (history[i].role === "user" ? "chat-bubble-user" : "chat-bubble-ai");
    bubble.innerHTML = escapeHtml(history[i].text).replace(/\n/g, "<br>");
    box.appendChild(bubble);
  }
  box.scrollTop = box.scrollHeight;
}

function updateKeyStatus() {
  let status = document.getElementById("api-key-status");
  let input = document.getElementById("groq-api-key");
  let key = getGroqApiKey();
  if (input && !input.value && key) {
    input.value = key;
  }
  if (status) {
    status.textContent = key
      ? "API key is saved in this browser."
      : "No API key saved yet.";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof requireLogin === "function") requireLogin();

  updateKeyStatus();
  renderChat();

  let saveBtn = document.getElementById("save-api-key-btn");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      let input = document.getElementById("groq-api-key");
      let key = input ? input.value.trim() : "";
      if (!key) {
        if (typeof showError === "function") showError("Enter an API key first.");
        return;
      }
      setGroqApiKey(key);
      updateKeyStatus();
      if (typeof showSuccess === "function") showSuccess("API key saved.");
    });
  }

  let clearBtn = document.getElementById("clear-api-key-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      showConfirmModal({
        title: "Clear API key",
        message: "The key will be removed from this browser only.",
        confirmLabel: "Clear key",
        onConfirm: function () {
          clearGroqApiKey();
          let input = document.getElementById("groq-api-key");
          if (input) input.value = "";
          updateKeyStatus();
          if (typeof showSuccess === "function") showSuccess("API key cleared.");
        }
      });
    });
  }

  let toggleVis = document.getElementById("toggle-key-visibility");
  if (toggleVis) {
    toggleVis.addEventListener("click", function () {
      let input = document.getElementById("groq-api-key");
      if (!input) return;
      input.type = input.type === "password" ? "text" : "password";
    });
  }

  let form = document.getElementById("ai-chat-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let input = document.getElementById("ai-user-input");
      let text = input ? input.value.trim() : "";
      if (!text) return;

      if (!getGroqApiKey()) {
        if (typeof showError === "function") {
          showError("Add and save your Groq API key before chatting.");
        }
        return;
      }

      let history = loadChatHistory();
      history.push({ role: "user", text: text });
      saveChatHistory(history);
      if (input) input.value = "";
      renderChat();

      let sendBtn = document.getElementById("ai-send-btn");
      if (sendBtn) {
        sendBtn.disabled = true;
        sendBtn.textContent = "…";
      }

      callGroq(history)
        .then(function (reply) {
          history = loadChatHistory();
          history.push({ role: "assistant", text: reply });
          saveChatHistory(history);
          renderChat();
        })
        .catch(function (err) {
          if (typeof showError === "function") {
            showError(err.message || "Could not get a response.");
          }
        })
        .finally(function () {
          if (sendBtn) {
            sendBtn.disabled = false;
            sendBtn.textContent = "Send";
          }
        });
    });
  }

  let clearChat = document.getElementById("clear-chat-btn");
  if (clearChat) {
    clearChat.addEventListener("click", function () {
      showConfirmModal({
        title: "Clear chat",
        message: "All messages in this conversation will be removed.",
        confirmLabel: "Clear chat",
        onConfirm: function () {
          saveChatHistory([]);
          renderChat();
          if (typeof showSuccess === "function") showSuccess("Chat cleared.");
        }
      });
    });
  }
});
