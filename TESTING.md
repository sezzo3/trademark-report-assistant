# Test report — 8 November 2026

Version tested: 9.0.1. No complaints were submitted. No real reporter identity or allegation was entered into an external form.

## Automated checks

Run `node --test tests/report-assistant.test.cjs`. Tests cover spoofed form hosts, required evidence and review, invalid profile data, forbidden signature/attestation mappings, trusted-popup message checks, private-data/permission checks, null settings, review confirmation across validation, and Instagram registration fields. JavaScript syntax and manifest asset references were also checked.

## Chrome browser checks

The real popup and content-script code were exercised on localhost with simulated Chrome APIs and fictional data. X and Instagram fixture field metadata came from a read-only inspection of their current official forms. GitHub’s full fixture uses the project’s field mappings; only its initial live form step was inspected, because further steps require asserting a relationship to a rights owner.

| Check | Result |
| --- | --- |
| Save reporter settings and reload | Passed in simulated local storage |
| Missing evidence / missing review blocks filling | Passed |
| X draft | 14 fields filled; country and class reported for manual completion |
| Instagram draft | 12 fields filled, including registration number and record URL |
| GitHub fixture draft | 10 fields filled |
| Signatures / legal name | Remained blank |
| Legal checkboxes / authority radios | Remained untouched |
| Automatic submission | None |
| Clear saved data and reload | All reporter settings and case fields blank; review unchecked |

## Issues found and fixed

- GitHub redirects to `help.github.com`: updated the canonical form URL, host matching and manifest.
- Null saved settings caused popup initialization to fail: added safe normalization.
- Validation dropped the review flag before popup-to-content messaging: preserved the validated flag and added a regression test.
- Instagram registration number and record URL were missing from the mappings: added `TMREGNUMBER` and `TM_URL`.
- X custom combobox backing inputs could misleadingly appear fillable: skip non-editable/hidden backing controls and report missing fields for manual completion.

## Limits

The owner subsequently reported that the installed extension worked in their manual test. This is owner-reported confirmation; the platforms and individual steps tested were not specified. The agent did not independently complete an installed-extension end-to-end test because its browser connection blocked `chrome://extensions`. Framework-controlled form behaviour and later GitHub steps were not independently verified.

Fixture passing results do not guarantee every live platform field will work. The assistant reports fields it cannot populate and requires manual review, declarations, signatures and submission.
