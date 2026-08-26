let AI_HISTORY_KEY = "duto_ai_history";

let GROQ_API_KEY = "";

let GROQ_MODEL = "llama-3.3-70b-versatile";


function loadChatHistory() {
  let h = loadData(AI_HISTORY_KEY, []);
  return Array.isArray(h) ? h : [];
}

function saveChatHistory(history) {
  saveData(AI_HISTORY_KEY, history);
}

function fallbackReply() {
  return "I could not reach the AI service right now. Please try again in a moment.";
}

function callGroq(history) {
  let messages = [
    {
      role: "system",
      content:
        "You are Duto-AI, a helpful study assistant for students. Explain clearly, use simple language, and give practical study tips when useful."
    }
  ];

  let i;
  for (i = 0; i < history.length; i++) {
    messages.push({
      role: history[i].role === "user" ? "user" : "assistant",
      content: history[i].text
    });
  }

  if (messages.length < 2) {
    return Promise.resolve("Please type a question.");
  }

  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + GROQ_API_KEY
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    })
  })
    .then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          console.error("Groq error status:", res.status, data);
          throw new Error("API error " + res.status);
        }
        return data;
      });
    })
    .then(function (data) {
      let text =
        data &&
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content;

      if (!text) {
        console.error("Groq empty response:", data);
        return fallbackReply();
      }
      return text;
    })
    .catch(function (err) {
      console.error("Groq request failed:", err);
      return fallbackReply();
    });
}

function escapeHtml(text) {
  let div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, "<br>");
}

function renderChat() {
  let box = document.getElementById("chat-messages");
  if (!box) return;

  let history = loadChatHistory();
  box.innerHTML = "";

  if (history.length === 0) {
    let welcome = document.createElement("div");
    welcome.className = "chat-bubble chat-bubble-ai";
    welcome.innerHTML =
      "Hi! I’m Duto-AI, your study assistant. Ask me about coursework, study plans, or exam tips.";
    box.appendChild(welcome);
    return;
  }

  for (let i = 0; i < history.length; i++) {
    let bubble = document.createElement("div");
    bubble.className =
      history[i].role === "user"
        ? "chat-bubble chat-bubble-user"
        : "chat-bubble chat-bubble-ai";
    bubble.innerHTML = escapeHtml(history[i].text);
    box.appendChild(bubble);
  }

  box.scrollTop = box.scrollHeight;
}

function addMessage(role, text) {
  let history = loadChatHistory();
  history.push({
    role: role,
    text: text,
    at: new Date().toISOString()
  });
  saveChatHistory(history);
  renderChat();
}

function setLoading(isLoading) {
  let btn = document.getElementById("stud-ai-send-button");
  let input = document.getElementById("stud-ai-input");

  if (btn) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "Thinking…" : "Ask Duto-AI";
  }
  if (input) {
    input.disabled = isLoading;
  }
}

function sendMessage() {
  let input = document.getElementById("stud-ai-input");
  if (!input) return;

  let text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage("user", text);
  setLoading(true);

  let history = loadChatHistory();

  callGroq(history).then(function (reply) {
    addMessage("ai", reply);
    setLoading(false);
    input.focus();
  });
}

function setupDutoAiPage() {
  if (!document.getElementById("chat-messages")) return;

  renderChat();

  let btn = document.getElementById("stud-ai-send-button");
  let input = document.getElementById("stud-ai-input");

  if (btn) {
    btn.addEventListener("click", function () {
      sendMessage();
    });
  }

  if (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  setupDutoAiPage();
});