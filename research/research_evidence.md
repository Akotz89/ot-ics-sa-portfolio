# USACE SA Portfolio — Research Evidence Index

> Compiled: 2026-05-10 | SA: Aaron Kotz
> Purpose: Defensible source citations for every major technical claim in the 7-doc portfolio.
> Interview use: "I verified this at [source] on [date]"

---

## Federal Advisories & Directives

### 1. CISA Advisory AA24-038A — Volt Typhoon
| Field | Value |
|-------|-------|
| Published | February 7, 2024 |
| Authors | CISA, NSA, FBI, international partners |
| URL | https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a |
| Local copy | `CISA_AA24-038A_Volt_Typhoon.md` |
| Used in | scenario.html, discovery/index.html, arb-brief.html |

**Key claims verified:**
- PRC state-sponsored actor pre-positioning in US critical infrastructure ✅
- Targets Energy, Communications, Transportation, Water/Wastewater ✅
- Living off the Land (LotL) techniques using native system tools ✅
- Some actors maintained access for 5+ years ✅

---

### 2. NIST SP 800-82 Rev 3 — OT Security Guide
| Field | Value |
|-------|-------|
| Published | September 2023 |
| URL | https://csrc.nist.gov/pubs/sp/800/82/r3/final |
| Local copy | `NIST_SP_800-82_Rev3.md` |
| Used in | architecture.html, discovery/index.html |

**Key claims verified:**
- Expanded scope from ICS to broader OT category ✅
- OT overlay for NIST SP 800-53 Rev 5 controls ✅
- Aligns with NIST CSF and IEC 62443 ✅

---

### 3. CISA BOD 23-01 — Asset Visibility
| Field | Value |
|-------|-------|
| Issued | October 3, 2022 |
| URL | https://www.cisa.gov/news-events/directives/bod-23-01 |
| Local copy | `CISA_BOD_23-01.md` |
| Used in | discovery/index.html |

**Key claims verified:**
- Automated asset discovery every 7 days ✅
- Vulnerability enumeration every 14 days ✅
- Upload results to CDM Dashboard within 72 hours ✅

---

### 4. CIRCIA — Cyber Incident Reporting (2022)
| Field | Value |
|-------|-------|
| Enacted | 2022 |
| URL | https://www.cisa.gov/circia |
| Local copy | `CISA_CIRCIA.md` |
| Used in | arb-brief.html |

**Key claims verified:**
- 72-hour reporting for covered cyber incidents ✅
- 24-hour reporting for ransom payments ✅
- ⚠️ Final rule still in development (NPRM April 2024) — note in interviews

---

### 5. Executive Order 14028 — Cybersecurity
| Field | Value |
|-------|-------|
| Signed | May 12, 2021 |
| Federal Register | 86 FR 26633 (May 17, 2021) |
| Used in | discovery/index.html |

**Key claims verified:**
- Zero Trust Architecture mandate ✅
- SBOM requirements ✅
- EDR deployment requirements ✅

---

## Contract & Procurement

### 6. NASA SEWP VI
| Field | Value |
|-------|-------|
| URL | https://www.sewp.nasa.gov/ |
| Local copy | `NASA_SEWP.md` |
| Used in | All docs (contract vehicle) |

**Key claims verified:**
- SEWP VI is successor to SEWP V ✅
- Carahsoft is a SEWP contract holder ✅
- ⚠️ SEWP V extended past Apr 30, 2026 through Sept 30, 2026 — portfolio may need update

---

### 7. Dragos Public Sector LLC
| Field | Value |
|-------|-------|
| Launched | October 9, 2024 |
| Sources | intelligencecommunitynews.com, executivebiz.com, dragos.com |
| Used in | Interview prep |

**Key claims verified:**
- Dedicated federal subsidiary ✅
- Top Secret facility clearance ✅
- GM: Daniel Dorchinsky ✅
- DISA released Dragos Platform 2.x STIG concurrent with launch ✅
- Carahsoft named Master Government Aggregator (Dec 2024) ✅

---

## Threat Intelligence

### 8. VOLTZITE Threat Activity Group
| Field | Value |
|-------|-------|
| URL | https://www.dragos.com/threat/voltzite/ |
| Local copy | `Dragos_VOLTZITE_Threat_Group.md` |
| Used in | scenario.html, arb-brief.html |

**Key claims verified:**
- Overlaps with Volt Typhoon (Microsoft), BRONZE SILHOUETTE, Vanguard Panda, UNC3236 ✅
- Targets electric power, telecom, emergency services, defense industrial base ✅
- Exfiltrates OT configs, GIS data, SCADA configs ✅
- Uses LotL and compromised SOHO routers ✅

---

### 9. CHERNOVITE Threat Activity Group
| Field | Value |
|-------|-------|
| URL | https://www.dragos.com/threat/chernovite/ |
| Local copy | `Dragos_CHERNOVITE_Threat_Group.md` |
| Used in | scenario.html, arb-brief.html |

**Key claims verified:**
- Developed PIPEDREAM ICS malware framework ✅
- Capability to disrupt, degrade, destroy industrial environments ✅

---

## Technology Verification

### 10. Splunk Cloud — FedRAMP High + DoD IL5
| Field | Value |
|-------|-------|
| Source | splunk.com compliance page |
| Used in | architecture.html |

**Key claims verified:**
- FedRAMP High authorized ✅
- DoD IL5 Provisional Authorization (DISA, 2021) ✅
- AWS GovCloud (US), US-citizen-only support ✅

---

### 11. GE CIMPLICITY — Standard HMI for Mark VIe
| Field | Value |
|-------|-------|
| Sources | GE Vernova docs, control.com |
| Used in | discovery/index.html, architecture.html |

**Key claims verified:**
- CIMPLICITY is standard/preferred HMI for Mark VIe power generation ✅
- iFIX is same Proficy family but targets pharma/process industry ✅
- WorkstationST/ControlST are engineering tools that run alongside CIMPLICITY ✅

---

### 12. HP ProCurve 2920 — SPAN Limitations
| Field | Value |
|-------|-------|
| Sources | arubanetworks.com, hpe.com support docs |
| Used in | discovery/index.html, architecture.html |

**Key claims verified:**
- Limited to ONE active mirror session ✅
- Port trunks cannot be mirror destination ✅
- Destination port becomes exit-only ✅
- Network TAP recommended for reliable capture ✅

---

## Infrastructure Facts

### 13. Bonneville Dam
| Field | Value |
|-------|-------|
| Source | USACE army.mil (403), wikipedia, washington.edu |
| Used in | All site cards |

- PH1: 518 MW (10 units) + PH2: 532 MW (8 units + 2 fishway)
- Total installed: ~1,227 MW
- **CORRECTED:** Portfolio now states **1,050 MW / 18 units** (nameplate sum: 518+532=1,050) ✅
- Combined 4-dam total: **6,003 MW** (1,050+1,813+2,160+980)

### 14. The Dalles Dam
| Field | Value |
|-------|-------|
| Source | army.mil, crohms.org, oregonencyclopedia.org |
| Used in | All site cards |

- 22 main turbine-generators
- Nameplate: ~1,813 MW
- **Portfolio states 1,813 MW** ✅

---

## USACE Policy

### 15. EP 1130-2-510
- USACE engineering pamphlet governing hydropower operations
- army.mil returns 403 (likely requires CAC)
- Real document — referencing the EP number demonstrates domain knowledge
- Interview note: "Governed by EP 1130-2-510, not NERC CIP"

---

## ✅ Corrections Applied (Red-Team Audit — 2026-05-10)

| Issue | Was | Corrected To | Files Changed | Source |
|-------|-----|-------------|---------------|--------|
| Bonneville MW | 1,080 MW / 20 units | **1,050 MW / 18 units** | scenario, architecture, poc-report, arb-brief | USACE NWD Fact Sheet (PH1:518+PH2:532) |
| McNary first power | 1953 | **1954** | scenario (body + refs) | East Oregonian, USACE records |
| NIST 800-82 date | June 2023 | **September 2023** | scenario, discovery | csrc.nist.gov |
| VOLTZITE stage | Stage 1 (index.html) | **Stage 2 ICS** | index.html | Dragos 2026 YIR — elevated 2025 |
| Combined MW total | 6,033 MW | **6,003 MW** | architecture, arb-brief, rfp-response | Sum of corrected site figures |

## ✅ All Items Resolved

| Issue | Status | Notes |
|-------|--------|-------|
| Segmentation stat | **VERIFIED** | 81% confirmed from Dragos 2026 YIR (covering 2025 data). Source: dragos.com/year-in-review |
| SEWP V→VI transition | Acceptable | V extended through Sept 2026; portfolio uses SEWP VI which is correct forward-looking. |
| EP 1130-2-510 | Acceptable | army.mil returns 403 (CAC-required). Real document — referencing the EP number demonstrates domain knowledge. |

---

## Dragos DISA STIG

### 16. Dragos Platform 2.x STIG
- Released by DISA concurrent with Dragos Public Sector LLC launch (Oct 2024)
- Available on public.cyber.mil (requires login/authentication)
- Confirmed via press coverage (intelligencecommunitynews.com, executivebiz.com)
- **Interview note:** "The Dragos Platform has a published DISA STIG on public.cyber.mil — this significantly accelerates the ATO process because the security configuration baseline is already documented and approved by DISA."
