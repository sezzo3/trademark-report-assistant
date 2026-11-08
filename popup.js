"use strict";
const labels = {fullName:"Your full name *",jobTitle:"Job title",email:"Contact email *",phone:"Phone",holderName:"Trademark owner / rights holder *",address:"Owner address",country:"Owner country",website:"Official website (HTTPS)",holderUsername:"Official X username",companyName:"Company",state:"State / region",trademark:"Trademark *",registrationNumber:"Registration number",registrationOffice:"Registration office",registrationUrl:"Registration record URL (HTTPS)",goodsClass:"Goods / services class"};
const status = document.getElementById("status");
const fields = document.getElementById("profile-fields");
for (const key of ReportCore.fields) {
  const label = document.createElement("label");
  label.textContent = labels[key];
  const input = document.createElement("input");
  input.id = `profile-${key}`;
  input.maxLength = 500;
  input.type = key === "email" ? "email" : ["website", "registrationUrl"].includes(key) ? "url" : "text";
  input.required = ["fullName", "email", "holderName", "trademark"].includes(key);
  label.append(input); fields.append(label);
}
const readProfile = () => Object.fromEntries(ReportCore.fields.map(k => [k, document.getElementById(`profile-${k}`).value]));
// The popup is a trusted extension context; no webpage bridge can read these settings.
let settingsError = null;
const ready = (async () => {
  await chrome.storage.local.setAccessLevel({accessLevel:"TRUSTED_CONTEXTS"});
  const {reporterProfile} = await chrome.storage.local.get("reporterProfile");
  const p = ReportCore.profile(reporterProfile);
  for (const k of ReportCore.fields) document.getElementById(`profile-${k}`).value = p[k];
})().catch(() => { settingsError = new Error("Could not load local settings. Close and reopen the popup."); status.textContent = settingsError.message; });
document.getElementById("settings").addEventListener("submit", async event => {
  event.preventDefault();
  try { await ready; if (settingsError) throw settingsError; const p = ReportCore.validateProfile(readProfile()); await chrome.storage.local.set({reporterProfile:p}); status.textContent = "Reporter settings saved on this device."; }
  catch(error) { status.textContent = error.message; }
});
document.getElementById("open-form").addEventListener("click", async () => {
  try { await chrome.tabs.create({url:ReportCore.forms[document.getElementById("platform").value]}); }
  catch { status.textContent = "Could not open the official form."; }
});
for (const id of ["platform", "target-url", "explanation", "evidence"]) {
  document.getElementById(id).addEventListener("input", () => {document.getElementById("reviewed").checked = false;});
}
document.getElementById("case-form").addEventListener("submit", async event => {
  event.preventDefault();
  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    await ready; if (settingsError) throw settingsError;
    const profile = ReportCore.validateProfile(readProfile());
    const report = ReportCore.validateCase({platform:document.getElementById("platform").value,targetUrl:document.getElementById("target-url").value,explanation:document.getElementById("explanation").value,evidence:document.getElementById("evidence").value,reviewed:document.getElementById("reviewed").checked});
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
    if (!tab?.id || ReportCore.platformFor(tab.url) !== report.platform) throw new Error("Open the selected platform’s official report form, then reopen this popup.");
    const result = await chrome.tabs.sendMessage(tab.id,{action:"prepareReport",profile,report});
    if (!result?.ok) throw new Error(result?.error || "The form could not be filled.");
    status.textContent = `Filled ${result.filled} fields. Review them before submitting. Signatures and legal declarations were not changed.` + (result.missing.length ? `\nNot filled: ${result.missing.join(", ")}. Complete these manually or reveal the next form step and retry.` : "");
  } catch(error) { status.textContent = error.message.includes("Receiving end") ? "Reload the official form after installing or updating the extension, then retry." : error.message; }
  finally { document.getElementById("reviewed").checked = false; if (button) button.disabled = false; }
});
document.getElementById("clear-data").addEventListener("click", async () => {
  try { await ready; if (settingsError) throw settingsError; await chrome.storage.local.clear(); for (const k of ReportCore.fields) document.getElementById(`profile-${k}`).value = ""; document.getElementById("case-form").reset(); status.textContent = "Saved reporter settings and legacy local extension data cleared."; }
  catch { status.textContent = "Could not clear local data. Try again."; }
});
