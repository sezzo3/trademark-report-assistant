/* Only extension-popup requests can fill ordinary fields. No page-message bridge. */
(() => {
  "use strict";
  let filling = false;
  function setField(el, value) {
    if (!value || !el || el.disabled || el.readOnly || el.hidden || el.getAttribute?.("aria-hidden") === "true" || el.closest?.("[hidden], [aria-hidden=\"true\"]")) return false;
    // Custom combobox backing inputs are not editable native controls.
    if (el.tagName === "INPUT" && !el.id && !el.labels?.length) return false;
    if (el.tagName === "SELECT") {
      const option = Array.from(el.options).find(o => o.value === value || o.text.trim().toLowerCase() === value.toLowerCase());
      if (!option) return false;
      el.value = option.value;
    } else {
      if (!(el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && ["text", "email", "tel", "url"].includes(el.type)))) return false;
      if (el.type === "password" || /signature|legal_name|attestation|good_faith|confirm_read/i.test(el.name || el.id)) return false;
      const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (!setter) return false;
      setter.call(el, value);
    }
    el.dispatchEvent(new Event("input", {bubbles:true}));
    el.dispatchEvent(new Event("change", {bubbles:true}));
    return true;
  }
  chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL("popup.html")) return;
    if (msg?.action !== "prepareReport") return;
    (async () => {
      if (filling) throw new Error("A fill is already in progress.");
      filling = true;
      try {
        const c = ReportCore.validateCase(msg.report);
        if (ReportCore.platformFor(location.href) !== c.platform) throw new Error("The report platform does not match this form.");
        const p = ReportCore.validateProfile(msg.profile);
        let filled = 0;
        const missing = [];
        for (const [name, value] of ReportCore.entries(p, c)) {
          if (!value) continue;
          const el = Array.from(document.querySelectorAll("input[name], textarea[name], select[name]"))
            .find(node => node.name === name || node.name.endsWith(`@${name}`));
          if (setField(el, value)) filled++;
          else missing.push(name);
        }
        respond({ok:true, filled, missing});
      } finally { filling = false; }
    })().catch(error => respond({ok:false, error:error.message}));
    return true;
  });
})();
