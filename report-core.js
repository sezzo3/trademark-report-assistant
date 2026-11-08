/* Shared validation and form mappings. No network requests or embedded identities. */
(() => {
  "use strict";
  const forms = Object.freeze({
    x: "https://help.x.com/en/forms/ipi/trademark/trademark-owner",
    instagram: "https://help.instagram.com/contact/230197320740525",
    github: "https://help.github.com/contact/trademark-policy"
  });
  const fields = Object.freeze([
    "fullName", "jobTitle", "email", "phone", "holderName", "address", "country",
    "website", "holderUsername", "companyName", "state", "trademark",
    "registrationNumber", "registrationOffice", "registrationUrl", "goodsClass"
  ]);
  function httpsUrl(value) {
    try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; }
    catch { return false; }
  }
  function platformFor(url) {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") return null;
      if (["help.x.com", "help.twitter.com"].includes(u.hostname) && u.pathname.includes("trademark")) return "x";
      if (["support.github.com", "help.github.com"].includes(u.hostname) && /^\/contact\/trademark-policy(?:\/|$)/.test(u.pathname)) return "github";
      if (u.hostname === "help.instagram.com" && u.pathname.startsWith("/contact/") &&
          (/^\/contact\/230197320740525\/?$/.test(u.pathname) || /trademark|intellectual/.test(u.pathname))) return "instagram";
    } catch {}
    return null;
  }
  function profile(raw = {}) {
    raw = raw && typeof raw === "object" ? raw : {};
    return Object.fromEntries(fields.map(k => [k, typeof raw[k] === "string" ? raw[k].trim().slice(0, 500) : ""]));
  }
  function validateProfile(raw) {
    const p = profile(raw);
    for (const k of ["fullName", "email", "holderName", "trademark"]) {
      if (!p[k]) throw new Error(`Complete reporter settings: ${k}.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) throw new Error("Enter a valid contact email.");
    for (const k of ["website", "registrationUrl"]) {
      if (p[k] && !httpsUrl(p[k])) throw new Error(`${k} must be an HTTPS URL without credentials.`);
    }
    return p;
  }
  function validateCase(raw) {
    if (!raw || !forms[raw.platform]) throw new Error("Select a supported platform.");
    const u = new URL(raw.targetUrl);
    const hosts = {x: ["x.com", "www.x.com", "twitter.com", "www.twitter.com"], instagram: ["instagram.com", "www.instagram.com"], github: ["github.com", "www.github.com"]};
    if (!httpsUrl(raw.targetUrl) || !hosts[raw.platform].includes(u.hostname) || u.pathname === "/") throw new Error("Enter an HTTPS account or content URL for the selected platform.");
    if (u.search || u.hash) throw new Error("Remove tracking parameters and fragments from the reported URL.");
    const explanation = String(raw.explanation || "").trim();
    const evidence = String(raw.evidence || "").trim();
    if (explanation.length < 30 || explanation.length > 6000) throw new Error("Explain the specific confusion in 30–6000 characters.");
    if (evidence.length < 20 || evidence.length > 6000) throw new Error("Provide case-specific evidence in 20–6000 characters.");
    if (raw.reviewed !== true) throw new Error("Review this case and confirm your authority before filling.");
    return {platform: raw.platform, targetUrl: u.href, explanation, evidence, reviewed: true};
  }
  function entries(p, c) {
    const description = `${c.explanation}\n\nReported content: ${c.targetUrl}\n\nSupporting evidence:\n${c.evidence}`;
    const username = new URL(c.targetUrl).pathname.split("/").filter(Boolean)[0];
    if (c.platform === "x") return [
      ["Form_Name__c", p.fullName], ["job-title", p.jobTitle], ["Form_Email__c", p.email],
      ["SuppliedPhone", p.phone], ["Reported_Screen_Name__c", `@${username}`],
      ["DescriptionText", description], ["Content_Owner_Name__c", p.holderName],
      ["trademark-holder-address", p.address], ["trademark-holder-country", p.country],
      ["trademark-holder-website", p.website], ["trademark-holder-username", p.holderUsername],
      ["trademark-word", p.trademark], ["Registration_Number__c", p.registrationNumber],
      ["trademark-class", p.goodsClass], ["reg-office", p.registrationOffice], ["trademark-link", p.registrationUrl]
    ];
    if (c.platform === "instagram") return [
      ["your_name", p.fullName], ["Address", p.address], ["email", p.email], ["confirm_email", p.email],
      ["reporter_name", p.holderName], ["websiterightsholder", p.website], ["what_is_your_trademark", p.trademark],
      ["rights_owner_country_routing", p.country], ["TMREGNUMBER", p.registrationNumber], ["TM_URL", p.registrationUrl], ["content_urls", c.targetUrl], ["why_reporting_other", description]
    ];
    return [["contact[phone]", p.phone], ["contact[state]", p.state], ["contact[name]", p.fullName],
      ["contact[registration_number]", p.registrationNumber], ["contact[registration_office]", p.registrationOffice],
      ["contact[registration_url]", p.registrationUrl], ["contact[github_url]", c.targetUrl],
      ["contact[description]", description], ["contact[company_name]", p.companyName], ["contact[company_url]", p.website]];
  }
  globalThis.ReportCore = Object.freeze({forms, fields, profile, validateProfile, validateCase, platformFor, entries});
})();
