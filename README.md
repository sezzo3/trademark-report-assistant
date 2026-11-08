<div align="center">

# Trademark Report Assistant

**Prepare the draft. Review the evidence. Stay in control.**

A lightweight Chrome extension for preparing trademark report forms on **X**, **Instagram** and **GitHub**.

Manifest V3 · Vanilla JavaScript · Local reporter settings · No build step

</div>

> **Human review comes first.** This extension assists with form entry. It does not determine infringement, establish legal rights, sign declarations or submit complaints. Only report content you have reviewed and are authorised to report.

## Why I built this

I built Trademark Report Assistant to reduce the repetitive work involved in preparing brand protection reports across different platforms. Reporter details and trademark registration information often need to be entered again for each case, while the explanation and evidence must remain specific to the content being reported.

My aim was to make that preparation more consistent without automating the legal judgment. The extension handles ordinary form fields, asks for evidence and a fresh review for each case, and leaves authority selections, signatures, declarations and submission to the person responsible for the report.

## How it can help companies

For companies reviewing suspected brand impersonation or misleading trademark use, the assistant can support a more organised reporting workflow:

| Team need | How the assistant helps |
| --- | --- |
| Reduce repeated typing | Reuses locally saved reporter and trademark details across supported forms |
| Prepare clearer reports | Requires an exact content URL, an explanation and supporting evidence for each case |
| Keep responsibility clear | Requires a case review and leaves legal declarations and submission manual |
| Work across platforms | Provides one drafting interface for X, Instagram and GitHub |
| Limit additional data sharing | Uses no separate reporting dashboard or analytics service; entered drafts go to the selected platform form |
| Notice incomplete preparation | Lists fields that still need manual attention |

It is intended as a preparation aid for authorised brand protection, legal, trust and safety, or customer protection teams. It does not monitor the internet, verify trademark ownership, decide whether a use infringes a mark, or guarantee that a platform will take action. Any time savings depend on the company’s workflow and have not been measured in a production study.

## What it does

Trademark Report Assistant brings your reporter details and case-specific evidence into supported platform forms, reducing repetitive typing while leaving legal decisions to you.

- **One case at a time:** enter the exact content URL, explain the misleading use and provide supporting evidence.
- **Reusable reporter settings:** save contact and trademark details locally in your browser profile.
- **Deliberate review:** confirm your authority and review before each fill; changing case details resets the confirmation.
- **Manual legal steps:** signatures, declarations, authority selections and final submission remain untouched.
- **Clear feedback:** see which fields were filled and which need manual completion.
- **Minimal dependencies:** plain HTML, CSS and JavaScript, with no package installation or remote fonts.

## Supported platforms

| Platform | Draft assistance | Manual steps |
| --- | --- | --- |
| X | Reporter, account, trademark and evidence fields | Country/class widgets, declarations, category selections and submission |
| Instagram | Reporter, trademark, registration, content URL and evidence fields | Relationship selection, content categories, signature and submission |
| GitHub | Available reporter, company, registration, content URL and explanation fields | Relationship/category selections, account email, legal name/signature, declarations and submission |

Forms change over time and some fields appear only after a category or role is selected. Missing fields are reported instead of being silently treated as complete.

## Install locally

1. Download this repository and extract it, or clone it:

   ```sh
   git clone https://github.com/sezzo3/trademark-report-assistant.git
   ```

2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the folder containing `manifest.json`.
5. Open the extension popup, expand **Reporter settings**, enter your details and click **Save settings**.

Chrome **102 or later** is required for restricting stored settings to trusted extension contexts. No build step is needed.

## Prepare a report

1. Select a platform and click **Open official form**.
2. On the website, manually select your actual relationship to the rights owner and any required report categories.
3. Reopen the extension popup and enter the exact reported account or content URL.
4. Describe the specific misleading use or confusion, then add verifiable supporting evidence for that case.
5. Confirm you have reviewed the case and are authorised to report it.
6. Click **Fill draft fields**, review the results and complete any missing fields manually.
7. Complete signatures and legal declarations yourself. Submit only after checking the full report for accuracy.

A matching username alone is not proof of infringement. Consider authorised use, fair use and the platform’s policy when reviewing each case.

**Open the official form before entering your evidence.** Opening a new tab can close the popup. Case details are deliberately not saved, and closing the popup discards them. Repeating a fill can overwrite existing ordinary fields.

## Privacy by design

| Information | Handling |
| --- | --- |
| Reporter settings | Saved in `chrome.storage.local` in this browser profile; not synced by the extension |
| Case URL, explanation, evidence and review | Kept in popup memory and discarded when it closes |
| Information entered into a form | Shared with that platform when you click **Fill draft fields**; the site can read populated fields before submission |
| Saved data removal | **Clear saved reporter data** removes extension-local settings and legacy cached data |

There are **no dashboard requests, analytics, shared API tokens or website message bridges**. Local extension storage is not encrypted secret storage; use a trusted device. Clearing saved data does not erase fields already entered on a website or previously submitted reports.

Read the [privacy details](privacy.html) for the full behaviour.

### Permissions

- `storage` — saves reporter settings locally.
- `activeTab` — identifies the selected form tab following a user action.
- Content scripts run only on the official report paths listed in the manifest and fill ordinary fields only on a request from this extension’s popup.

No `host_permissions` or `scripting` permission is requested.

## Development

```text
trademark-report-assistant/
├── manifest.json                   # Extension configuration and supported form paths
├── popup.html                      # Reporter settings and case drafting interface
├── popup.css                       # Interface styles
├── popup.js                        # Local settings, review and popup messaging
├── report-core.js                  # Validation and platform field mappings
├── content.js                      # Restricted form-filling handler
├── privacy.html                    # Data handling details
├── TESTING.md                       # Test results and limitations
└── tests/
    └── report-assistant.test.cjs    # Regression tests
```

Run the regression suite with Node.js:

```sh
node --test tests/report-assistant.test.cjs
```

The eight automated tests cover URL validation, evidence and review requirements, message sender checks, protected legal fields, settings recovery and registration mappings. Local browser fixtures were tested, and the owner subsequently confirmed that the installed extension worked in a manual test. See the [test report](TESTING.md) for scope and limitations.

## Troubleshooting

- **No connection to the form:** reload the official form after installing or updating the extension, then reopen the popup.
- **Fields are missing:** select the appropriate role/category on the website and fill again, or complete the fields manually.
- **X country or class stays blank:** these custom widgets require manual selection.
- **The popup closes:** reopen it; reporter settings remain, but case details must be re-entered.

## Migration from earlier versions

Version 9 replaces the former client-specific configuration with user-entered settings and evidence-based drafting. Embedded identities, signatures, credentials, private development hosts, dashboard imports and bulk reporting have been removed.

After upgrading, use **Clear saved reporter data** to remove any legacy local data before saving your new settings. If a previously bundled shared token is still accepted by your backend, revoke it there; removing it from the extension cannot invalidate a server credential. A future dashboard integration would require individual authentication and updated privacy documentation.

## Usage and licensing

This project is not affiliated with X, Meta or GitHub. Platform names identify the supported forms. The assistant does not provide legal advice or guarantee acceptance of a report.

No blanket open-source licence is currently granted. Public availability alone does not grant permission to reuse or redistribute the code.
