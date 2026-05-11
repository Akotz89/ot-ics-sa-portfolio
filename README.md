# OT/ICS Pre-Sales Solution Architect - Work Product Portfolio

Realistic, fact-checked SA work products for the OT/ICS cybersecurity domain, built around a **USACE Columbia River Hydropower** federal engagement scenario.

**Fictional future-state simulation built from public sources; not a real Dragos/customer engagement.**

## Source of Truth

This local `06_SA_Document` draft is the canonical showcase for interview review. The GitHub Pages links below are the published snapshot, but local validation should be run from this folder before sharing updates.

```powershell
python validate_portfolio.py
npm run audit:whiteboard
npm run validate
python -m http.server 4179 --bind 127.0.0.1
```

## View the Documents

### **[View the Portfolio](https://akotz89.github.io/ot-ics-sa-portfolio/)**

| Stage | Document | Direct Link |
|-------|----------|-------------|
| 0. Scenario | Scenario Brief | [View](https://akotz89.github.io/ot-ics-sa-portfolio/scenario.html) |
| 1. Discovery | Technical Discovery Document | [View](https://akotz89.github.io/ot-ics-sa-portfolio/discovery/) |
| 2. Solution Design | Solution Architecture + Bill of Materials | [View](https://akotz89.github.io/ot-ics-sa-portfolio/architecture.html) |
| 3. Demo | Tailored Demo Agenda | [View](https://akotz89.github.io/ot-ics-sa-portfolio/demo.html) |
| 4. PoC | Proof of Value - Findings Report | [View](https://akotz89.github.io/ot-ics-sa-portfolio/poc-report.html) |
| 5. RFP Response | Technical Volume + Requirements Matrix | [View](https://akotz89.github.io/ot-ics-sa-portfolio/rfp-response.html) |
| 6. Technical Win | Architecture Review Board Brief | [View](https://akotz89.github.io/ot-ics-sa-portfolio/arb-brief.html) |

### SA Tools

| Tool | Description | Direct Link |
|------|-------------|-------------|
| Whiteboard | 24-step customer workshop: OT discovery, Dragos placement, passive SPAN, SiteStore/CentralStore, and SOC handoff | [View](https://akotz89.github.io/ot-ics-sa-portfolio/whiteboard/) |

## The Scenario

**Customer:** U.S. Army Corps of Engineers - Northwestern Division
**Sites:** Bonneville, The Dalles, John Day, McNary dams (Columbia River, OR/WA)
**Capacity:** 5,970 MW planning basis across 70 generating units
**Control Systems:** GE Mark VIe, Emerson Ovation DCS, Allen-Bradley ControlLogix, Siemens S7-400
**Threat Actors:** VOLTZITE, CHERNOVITE, ELECTRUM, SYLVANITE
**Procurement:** NASA SEWP V via Carahsoft, ~$780K FFP Year 1
**Opportunity ID:** DRG-FED-2026-0847

Infrastructure and procurement claims are source-backed where public references exist. Hydropower capacity is used as a **5,970 MW planning basis** for the exercise because public source wording varies by facility and capacity basis. All stakeholders, findings, dates, authorization milestones, procurement milestones, and engagement details are fictional unless explicitly cited.

## What This Demonstrates

Each document includes interactive tooltips - hover any dotted-underlined term for an explanation of what it means and why it matters. The portfolio covers the full SA sales cycle from initial discovery through technical win, showing:

- **Technical depth:** OT protocol knowledge (GE SRTP/EGD, S7comm, EtherNet/IP), customer whiteboarding, Purdue/IEC 62443 architecture, federal compliance frameworks (RMF, FIPS 199, DISA STIG)
- **Sales methodology:** MEDDPICC qualification, persona-specific messaging, objection handling, competitive positioning
- **Federal acumen:** SEWP V procurement, FedRAMP/IL5 considerations, customer-owned RMF/IATT/ATO process support, EP 1130-2-510 regulatory context
- **Role fit:** federal customers, mission requirements, consultative recommendations, tailored demonstrations, proof-of-concept execution, troubleshooting, RFI/RFP/SOW support, TCP/IP/OSI/Purdue mapping, Linux CLI, Wireshark/Tshark-style packet analysis, Elastic/Logstash/Kibana-style log/telemetry workflows, AWS/VMware/Hyper-V considerations, and scripting

---

*Fictional future-state simulation built from public sources; not a real Dragos/customer engagement.*
