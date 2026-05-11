# Exercise Scenario Brief - USACE NWD Columbia River

Source: scenario.html

---

Exercise Scenario: USACE Columbia River Hydropower
SA Work Product Exercise
Scenario Brief
USACE Columbia River Hydropower: OT Cybersecurity Program
Federal engagement scenario for SA portfolio development
PurposeProvide consistent context for all work products across all 7 sales cycle stages
Based OnReal USACE infrastructure, Dragos YIR statistics, actual federal procurement paths
CreatedMay 2026
ClassificationEXERCISE: Not a real engagement
Exercise Scenario: Stakeholder names, control system configurations, and engagement findings are fictional. Dam infrastructure and threat intelligence are sourced from public data.
Scenario Overview
This scenario provides a single consistent backdrop for every work product in the portfolio: a Dragos Federal SA engagement covering federal procurement, DoD stakeholders, multi-site OT architecture, mixed vendor environments, compliance mandates, and an active threat actor.
How I Built This Scenario
I chose USACE NWD because Columbia River dams are real, publicly documented federal infrastructure where OT cybersecurity is a genuine need. The control system vendors (GE, Emerson, Rockwell, Siemens) reflect what is common in federal hydropower and creates the mixed-vendor challenge that matters for Dragos protocol parsing. Threat context (VOLTZITE, CHERNOVITE, ELECTRUM) comes from the Dragos 2024 Year in Review and public CISA advisories. Procurement details (SEWP V, Carahsoft) come from public SAM.gov and NASA SEWP records. Stakeholder personas are fictional but modeled on the roles I actually interact with in federal program management: the O-6 who wants a one-page summary, the technical champion under compliance pressure, the SCADA operator who does not trust IT tools, the GS-12 who will actually use the product, and the contracting officer who controls the money.
1. The Customer
| Field | Detail
| Organization | U.S. Army Corps of Engineers (USACE), Northwestern Division (NWD)
| Mission | Operates 21 hydroelectric dams across the Columbia and Willamette River basins (OR, WA, ID, MT). Generates over 22,000 GWh/year, part of the Federal Columbia River Power System that provides roughly 40% of all U.S. hydroelectric power.
| Sector | Federal: DoD (Civil Works) / Energy / Water
| Scope | Initial engagement: 4 dams. Success → expansion to all 21 NWD dams.
| Annual OT Budget | ~$2M (cybersecurity portion of SCADA modernization program)
| Existing Relationship | None with Dragos. CrowdStrike and Splunk on IT side. Dr. Torres attended S4 Conference and heard Robert M. Lee present.
2. The Sites
Control system vendors and configurations below are fictional. Each assignment uses vendors common in federal hydroelectric facilities to create a realistic mixed-vendor environment for the exercise.
🏭 Bonneville Dam, OR
Commissioned: 1938 (first powerhouse; second powerhouse 1981)
Capacity: 1,050 MW nameplate / 1,200+ MW overload (18 generating units across two powerhouses)
Control System: GE Mark VIe Turbine Controls
HMI: GE CIMPLICITY (plant-level SCADA); ControlST/WorkstationST (per-unit)
Historian: AVEVA PI System
Safety: Woodward Load Sharing
Protocols: GE SRTP, EGD, Modbus TCP, OPC-UA
Network: Cisco IE-4010 (SPAN capable)
Role: Primary PoC site (most complex control environment of the four)
🏭 The Dalles Dam, OR
Commissioned: 1957 (dam completed); generators: 14 units by 1960, 8 additional by 1973
Capacity: 1,780 MW nameplate / 2,080 MW overload (22 generating units)
Control System: Emerson Ovation DCS
HMI: Emerson OvationView
Historian: AVEVA PI System
Safety: Legacy relay protection (no digital monitoring)
Network: Cisco IE-3400 (SPAN capable)
Risk: Legacy relays vulnerable to Industroyer-style attacks
🏭 John Day Dam, OR
Commissioned: 1968 (first power); completed 1971
Capacity: 2,160 MW (16 generating units)
Control System: Allen-Bradley ControlLogix L83
HMI: FactoryTalk View SE (6 stations)
Historian: Wonderware Historian
Safety: None identified
Network: HP ProCurve 2920 (limited SPAN, TAP needed)
Risk: ControlLogix CIP firmware CVE-2023-3595 (RCE via CIP, Dragos-discovered, CVSS 9.8)
🏭 McNary Dam, OR/WA
Commissioned: 1954 (first power); expanded 1957
Capacity: 980 MW (14 generating units)
Control System: Siemens S7-400 PLCs
HMI: WinCC 7.5 (4 stations)
Historian: None (manual logs only)
Safety: None identified
Network: Unmanaged Moxa switches (no SPAN; TAP required)
Risk: Least visibility, most legacy infrastructure
3. The People
Customer Side
COL James Harding
District Commander, Portland District
Executive sponsor. Army O-6. Focused on mission readiness and compliance. Expects a 1-page executive summary, not a 40-page report. Controls budget approval.
Dr. Rebecca Torres
Chief, Cybersecurity Division (NWD)
Your primary technical champion. PhD in CS, former NSA. Understands IT security deeply but openly admits OT is new territory. Attended S4, heard Rob Lee, and initiated this engagement. Evaluates technical depth. Under pressure from the DoD CIO mandate and needs a win by Sep 30.
Mike Osterman
SCADA Program Manager, Hydropower
30-year USACE veteran. Knows the turbines, the protocols, and the failure modes. Deeply skeptical of IT security tools in his control network. His concern: a security product causes a turbine trip and shuts down generation on the Columbia River. His endorsement is the single biggest factor in whether this engagement moves forward.
Jennifer Walsh
Contracting Officer, USACE Portland District
Controls the procurement process. Needs clean SOW, compliant contract vehicle (SEWP V/VI), and justified sole-source or competitive documentation. She does not evaluate technology. She evaluates FAR compliance and obligation deadlines.
Brian Knox
OT Network Administrator, GS-12
Hands-on evaluator. Former Air Force 3D1X2 (Cyber Transport Systems), 8 years active duty before transitioning to USACE civilian service. Manages the switches, configures SPAN ports, and will physically rack deployed sensors. Brian is the source of the Tenable incident: "we tried Tenable on the OT network once and it crashed two HMIs."
Dragos Side
Aaron Kotz
Solutions Architect (Federal) [Exercise Role]
SA assigned to this engagement. Owns the technical evaluation: discovery doc, architecture, demo, PoC, and RFP response. Partners with the AE on deal strategy. TS clearance and 18+ years in classified DoD environments.
[Account Executive]
Account Executive, Dragos Public Sector
Owns the relationship and the quota. Handles pricing, negotiation, and Carahsoft coordination. The SA never quotes pricing directly; that goes through AE and Deal Desk.
4. The Timeline
Feb 2024: Trigger Event
CISA publishes Advisory AA24-038A warning about PRC state-sponsored actors (Volt Typhoon / tracked by Dragos as VOLTZITE) pre-positioning in U.S. critical infrastructure, including energy and water systems.
Nov 2025: Incident
Unauthorized laptop found connected to SCADA network at Bonneville Dam. Discovered by an operator visually, not by any technical detection. No evidence of intrusion, but no way to confirm either.
Jan 2026: Mandate
DoD CIO issues memo requiring OT cybersecurity assessments for all Civil Works facilities by end of FY2026 (Sep 30, 2026).
Feb 2026: S4x26 Conference (Miami Beach)
Dr. Torres attends S4x26 Conference (Feb 24-26, Miami Beach). Hears Robert M. Lee present on OT threat landscape. Visits Dragos booth and PoC Pavilion demo. Contacts Dragos through the website afterward.
Apr 2026: Initial Contact
Dragos AE reaches out. NDA executed April 30. First intro call scheduled.
May 15: Discovery Call
90-minute technical discovery session conducted. → Discovery Document produced.
May 30: Solution Design
Solution Architecture Document + Bill of Materials delivered to customer.
Jun 9: Demo
60-minute tailored demo for Dr. Torres, Mike Osterman, Brian Knox, and 5 OT engineers.
Jun 23-Jul 23: PoC
30-day Proof of Value at Bonneville Dam. 2 sensors deployed (SPAN × 2 segments: Powerhouse 1 + Powerhouse 2). SPAN change request submitted May 22. 4-week change control clears Jun 19. IATT granted Jun 18. Sensors racked Jun 20-22. Neighborhood Keeper enrollment configured during PoC to enable anonymized threat sharing.
Jul 28: PoC Readout
Findings presentation to Dr. Torres, Mike Osterman, COL Harding. Results: 247 OT assets discovered, 27 previously unknown, 34 vulnerabilities identified (2 Now / 8 Next / 24 Never).
Aug 14: Technical Win
USACE Architecture Review Board endorses Dragos. Technical win achieved. Procurement package submitted to Jennifer Walsh.
Sep 15: Contract Award
FFP contract via NASA SEWP (Carahsoft). $780K Year 1. FY26 funds obligated.
Dec 2026: First Site Live
Bonneville Dam operational. Continuous OT monitoring active. 247 assets discovered, 27 previously unknown (12.3%). Neighborhood Keeper connected. Anonymized telemetry flowing to Dragos community intelligence.
Jan 2027: All Sites Live
All 4 dams operational. CentralStore providing unified visibility at NWD HQ.
5. The Threat
| Threat Group | Relevance
| VOLTZITE | Stage 2 group (PRC-linked, overlaps with Volt Typhoon) targeting U.S. electric grid, pipelines, and water systems. Manipulates engineering workstation software to extract config files. CISA advisory AA24-038A covers the PRC pre-positioning campaign; Dragos elevated VOLTZITE to Stage 2 in 2025. This is the threat driving the deal.
| CHERNOVITE | Developed PIPEDREAM/INCONTROLLER, ICS-specific malware that can target industrial controllers. Relevant because USACE runs PLCs from multiple vendors.
| ELECTRUM | Connected to Industroyer malware that targeted electric grid in Ukraine. Relevant to The Dalles Dam's legacy relay protection systems.
| SYLVANITE | Access broker that weaponizes VPN/edge device vulnerabilities. Relevant because USACE uses VPN for remote OT access with no MFA.
6. Constraints and Rules of Engagement
⚠ Non-Negotiable: No active scanning. No agents on PLCs. Passive monitoring ONLY. A turbine trip caused by a security tool is a career-ending event for everyone involved.
| Constraint | Detail
| Availability Priority | OT uptime > everything else. These dams provide power to millions. No disruption to operations is acceptable.
| Change Control | Any network change (SPAN config, TAP install) requires a 4-week change control process.
| Passive Only | Customer burned by Tenable crashing HMIs. They will reject any solution that sends packets into the OT network.
| CUI Handling | All documents are CUI // FOUO. No cloud storage. No emailing findings over unencrypted channels.
| STIG Compliance | Any hardware deployed must be STIG-hardened. Customer ISSM will validate.
| RMF / ATO Process | Full deployment requires ATO per NIST SP 800-37. PoC operates under IATT (90-day). Dragos Platform 2.x STIG on public.cyber.mil accelerates both paths. SA provides architecture artifacts for eMASS package.
| Fiscal Year | Funds expire Sep 30, 2026. If contract isn't awarded by then, deal dies and restarts in FY27.
| Expansion Potential | Success at 4 dams = expansion to all 21 NWD dams ($3M+ follow-on). This is a land-and-expand play.
| Regulatory Framework | USACE hydropower generation is not directly NERC CIP-registered. Compliance is driven by USACE EP 1130-2-510, DoD CIO OT cybersecurity directives, and NIST SP 800-82 Rev. 3 (Guide to OT Security). BPA, which markets the power, is NERC CIP-registered for transmission assets.
| Applicable Standards | NIST SP 800-53 Rev. 5 (security controls), NIST SP 800-82 Rev. 3 (OT security), DoD Zero Trust Strategy (FY2027 mandate), EO 14028 (Improving the Nation's Cybersecurity), CISA Cross-Sector CPGs.
| Supply Chain (§889) | All Dragos hardware must comply with Section 889 NDAA and FASCSA requirements. No prohibited telecommunications components. Dragos provides a supply chain compliance letter upon request. Hardware is Dell/HPE with documented provenance.
| Site Access | Bonneville, The Dalles, John Day, and McNary are restricted federal installations. All Dragos personnel require PIV/CAC or government escort. SA coordinates access requests through NWD Physical Security 14 days prior to any site visit. DD Form 254 on file for classified access if needed.
| System Categorization | Dragos Platform will be categorized under FIPS 199 as Moderate Confidentiality / Moderate Integrity / High Availability. The HIGH availability component (safety-critical infrastructure monitoring) drives the overall system to a HIGH baseline, requiring the full NIST 800-53 HIGH control set.
| SSP / POA&M | SA provides technical sections for the System Security Plan (architecture, data flows, encryption, access controls). Residual risks documented in POA&M for AO risk acceptance. SA ensures all artifacts are formatted for eMASS upload.
| Contract Structure | SEWP V task order structured with CLINs for software, hardware, services, and managed detection. CDRLs define required deliverables (status reports, asset inventories, vulnerability summaries). SA reviews CDRL scope to ensure technical feasibility before proposal submission.
7. Work Products
| Stage | Document | Gate to Advance | Status
| 1. Discovery | Technical Discovery Document | Customer validates environment data; NDA executed | ✓ Complete
| 2. Solution Design | Architecture Document + Bill of Materials | SA + AE alignment on pricing; customer accepts architecture | ✓ Complete
| 3. Demo | Demo Agenda + Tailored Script | Demo environment configured with customer-relevant protocols | ✓ Complete
| 4. PoC | Proof of Value Findings Report | SPAN/TAP change control cleared; success criteria agreed | ✓ Complete
| 5. RFP Response | Technical Volume + Requirements Matrix | PoC data validates architecture; customer issues solicitation | ✓ Complete
| 6. Technical Win | Architecture Review Board Brief | ARB endorsement; procurement package to Contracting Officer | ✓ Complete
| 7. Post-Sales | Quarterly Business Review | Contract awarded; deployment complete at ≥1 site | Pending
📋 PoC Success Criteria (agreed with Dr. Torres before deployment):
1. Discover ≥90% of known OT assets within 72 hours of sensor activation
2. Identify ≥1 previously unknown device or communication path
3. Demonstrate protocol-specific parsing for ≥3 site-relevant OT protocols (Bonneville target: GE SRTP, EGD, Modbus TCP, OPC-UA)
4. Generate zero operational disruptions: no turbine trips, no HMI impacts, no network degradation
5. Produce findings report within 5 business days of PoC completion
8. References
Every verifiable claim in this scenario is sourced from public data. Control systems, stakeholder names, and engagement findings are fictional; infrastructure specifications and threat intelligence are real.
Dam Infrastructure: U.S. Army Corps of Engineers
| Claim | Source
| Bonneville Dam: 18 units, 1,050 MW nameplate, commissioned 1938/1981 | USACE NWD Fact Sheet: Bonneville Dam · USACE Water Control Data: Bonneville · Columbia Basin Research (Univ. of Washington): Bonneville Hydro Data
| The Dalles Dam: 22 units, 1,780 MW nameplate, Phase I 1957 / Phase II 1973 | USACE NWD Fact Sheet: The Dalles Dam · USACE Water Control Data: The Dalles
| John Day Dam: 16 units, 2,160 MW, first power 1968 | USACE NWD Fact Sheet: John Day Dam · USACE Water Control Data: John Day
| McNary Dam: 14 units, 980 MW, first power 1954 | USACE NWD Fact Sheet: McNary Dam · USACE Walla Walla District: McNary Fact Sheet (PDF)
| USACE NWD: 21 dams in Columbia/Willamette basins | USACE NWD: Columbia River Basin Dams · USACE NWD News Release (2023)
| Columbia Basin: ~40% of U.S. hydroelectric generation | U.S. Energy Information Administration: Columbia River Basin Hydroelectric Generation
| Federal Columbia River Power System: 31 dams, 22,000+ MW | Bonneville Power Administration: FCRPS Brochure (PDF) · USACE Hydropower Program
Threat Intelligence
| Claim | Source
| CISA Advisory AA24-038A: PRC / Volt Typhoon | CISA: Advisory AA24-038A, PRC State-Sponsored Actors
| VOLTZITE: Dragos Activity Group, Stage 2, PRC-linked | Dragos: VOLTZITE Threat Group · Dragos Blog: VOLTZITE Cyber Espionage
| CHERNOVITE: PIPEDREAM / INCONTROLLER ICS malware | Dragos: CHERNOVITE Threat Group · Dragos Blog: PIPEDREAM Analysis
| ELECTRUM: Industroyer (Ukraine 2016/2022) | Dragos: ELECTRUM Threat Group
| SYLVANITE: Initial access broker, edge device exploitation | Dragos: 2026 OT Cybersecurity Year in Review (Press Release) · Dragos Blog: OT Threat Landscape 2026
| CVE-2023-3595: Rockwell ControlLogix CIP RCE (CVSS 9.8) | Dragos: Defense Against ControlLogix Exploits · NIST NVD: CVE-2023-3595 · CISA ICS Advisory: ICSA-23-193-01
Dragos Platform & Products
| Claim | Source
| CentralStore / SiteStore: platform architecture | Dragos: Platform Brochure (Feb 2026, PDF) · Dragos: Appliance Models Datasheet (PDF)
| Dragos Platform 2.x DISA STIG | BusinessWire: Dragos Public Sector Launch
| Neighborhood Keeper: anonymized threat data sharing | Dragos: Neighborhood Keeper Program
| Dragos threat group methodology (Stage 1 / Stage 2) | Dragos: ICS/OT Threat Groups
Federal Procurement
| Claim | Source
| NASA SEWP V → SEWP VI transition status | NASA SEWP: Contract Information · NASA SEWP V Home
| Carahsoft: Dragos authorized federal distributor | Carahsoft: Dragos Partnership
Industry Events
| Claim | Source
| S4x26 Conference: Feb 24-26, 2026, Miami Beach | S4 Events: POC Pavilion · Dragos: Upcoming Events
| Robert M. Lee: CEO/Co-Founder, Dragos Inc. | SANS Institute: Robert M. Lee Faculty Profile
Exercise Scenario: Not a real engagement
USACE Columbia River Hydropower, v1.7