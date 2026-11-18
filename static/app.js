const el = id => document.getElementById(id);
let draftId;
async function post(path, body) {
  const response = await fetch(path, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)});
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Check the input and retry.");
  return data;
}
async function process(form, action) {
  if (document.querySelector("form button:disabled")) return;
  const button = form.querySelector("button");
  button.disabled = true;
  el("status").textContent = "Working…";
  try { await action(); } catch (error) { el("status").textContent = error.message; }
  finally { button.disabled = false; }
}
el("example").onclick = () => {
  el("message").value = "Name: Mira Khan\nEmail: mira@example.com\nInterest: onboarding automation\nCan we book a demo next week?";
};
el("intake").onsubmit = event => {
  event.preventDefault();
  process(event.target, async () => {
    el("review").hidden = true;
    const data = await post("/api/enquiries", {message:el("message").value});
    draftId = data.id;
    for (const key of ["name","email","interest"]) el(key).value = data.lead[key];
    el("followup").textContent = data.follow_up;
    el("status").textContent = data.duplicate ? "This email already exists in the CRM." : "Draft ready for review.";
    el("review").hidden = false;
  });
};
el("review").onsubmit = event => {
  event.preventDefault();
  process(event.target, async () => {
    const data = await post("/api/enquiries/"+draftId+"/approve", {
      name:el("name").value, email:el("email").value, interest:el("interest").value,
    });
    el("review").hidden = true;
    el("status").textContent = (data.status === "created" ? "Lead created: " : "Existing lead matched: ")+data.lead_id;
  });
};
