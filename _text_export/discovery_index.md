# Technical Discovery Document

Source: discovery/index.html

---

Technical Discovery Document: USACE Northwestern Division
Dragos, Inc. / Public Sector
Technical Discovery Document
U.S. Army Corps of Engineers, Northwestern Division
Hydropower OT Cybersecurity Assessment
Prepared ByAaron Kotz, Solutions Architect (Federal) [Exercise Role]
Account Executive[AE Name], Dragos Public Sector
Channel PartnerCarahsoft Technology Corp.
Contract VehicleNASA SEWP V (via Carahsoft)
DateMay 20, 2026
Version1.4, Post-Discovery
Opportunity IDDRG-FED-2026-0847
NDA StatusExecuted 2026-04-30
PORTFOLIO EXERCISE - Sample work product created for interview preparation. Not a Dragos engagement.
CUI // FOUO, Distribution Limited to Dragos Internal + Carahsoft
1. Engagement Overview
| Field | Detail
| Customer | U.S. Army Corps of Engineers, Northwestern Division (NWD)
| Mission | Hydroelectric power generation, navigation locks, flood control, water management
| Sector | Federal: DoD (Civil Works) / Energy
| Sites in Scope | 4 dams (initial); expandable to 29 hydropower plants across NWD
| Primary Sites | Bonneville Dam (OR), The Dalles Dam (OR), John Day Dam (OR), McNary Dam (OR/WA)
| Discovery Session | 2026-05-15 | 90 min | MS Teams (NIPR)
| Classification | Unclassified // CUI; all OT systems reside on unclassified networks
Customer Stakeholders
| Name | Title | Role
| COL James Harding | District Commander, Portland District | Executive Sponsor
| Dr. Rebecca Torres | Chief, Cybersecurity Division (NWD) | Technical Decision Maker
| Mike Osterman | SCADA Program Manager, Hydropower | OT Subject Matter Expert
| Jennifer Walsh | Contracting Officer, USACE Portland District | Procurement Authority
| Brian Knox | OT Network Administrator, GS-12 | Hands-On Evaluator
Dragos Attendees
| Name | Title | Role
| Aaron Kotz | Solutions Architect (Federal) [Exercise Role] | Technical Lead: discovery, solution design, demo, PoC
| [AE Name] | Account Executive, Public Sector | Relationship owner: deal strategy, pricing, contract
| [SE Name] | Sales Engineer | Demo environment prep, protocol validation
2. Business Context & Engagement Drivers
What Triggered This Engagement
| # | Driver | Detail
| 1 | CISA Advisory AA24-038A | Warning about PRC state-sponsored actors (Volt Typhoon / VOLTZITE) pre-positioning in U.S. critical infrastructure including energy and water systems
| 2 | DoD CIO Memo (Jan 2026) | Mandates OT cybersecurity assessment for all Civil Works by EOY FY2026
| 3 | Internal Gap Assessment | IT cybersecurity team confirmed zero OT/ICS visibility below the enterprise DMZ
| 4 | Incident: Bonneville Dam | Q4 2025: unauthorized laptop found connected to SCADA network; no detection capability existed
Desired Outcomes (Customer-Stated)
"We need to know what's on our control networks, who's talking to what, and whether anyone who shouldn't be there is there. Today we're blind."
- Dr. Rebecca Torres, Discovery Call, 2026-05-15
SA Note: Torres is the technical champion and budget holder. She framed this as a visibility problem, not a compliance checkbox. Lead the demo with asset discovery and threat detection, not regulatory mapping. Compliance is the justification for procurement, but her personal motivation is operational awareness.
| # | Outcome
| 1 | Asset Visibility: Complete inventory of all OT/ICS devices across 4 dam sites
| 2 | Threat Detection: Continuous monitoring for malicious/anomalous activity on SCADA networks
| 3 | Compliance: Meet DoD CIO mandate; align to NIST 800-82 Rev 3
| 4 | Incident Readiness: Establish baseline for OT-specific incident response
Timeline Pressure
| Milestone | Date | Driver
| Vendor Selection | Aug 2026 | FY26 obligation deadline
| Contract Award | Sep 2026 | End of fiscal year
| First Site Deployed | Dec 2026 | DoD CIO mandate compliance
| All 4 Sites Operational | Mar 2027 | Program milestone
3. OT/ICS Environment Inventory
Control Systems by Site
| Site | Primary Control | SCADA / HMI | Safety | Historian
| Bonneville Dam | GE Mark VIe Turbine Controls | GE CIMPLICITY (plant-level SCADA); ControlST/WorkstationST (per-unit) | Woodward Load Sharing | AVEVA PI System
| The Dalles Dam | Emerson Ovation DCS | Emerson OvationView | Legacy relay protection | AVEVA PI System
| John Day Dam | Allen-Bradley ControlLogix L83 | FactoryTalk View SE (6 stn) | None identified | Wonderware
| McNary Dam | Siemens S7-400 PLCs | WinCC 7.5 (4 stations) | None identified | None (manual)
Estimated Asset Inventory
| Device Type | Est. Count | Notes
| Turbine Control PLCs / DCS Controllers | 48 | Per-unit controllers at Bonneville (Mark VIe); shared DCS/PLC groups at other sites. 70 generating units total - actual controller count TBV during PoC asset discovery.
| Gate/Lock Control PLCs | 24 | Spillway gates, navigation lock controls
| RTUs | 18 | River level, seismic, weather monitoring
| HMI / Operator Stations | 22 | Mix of dedicated workstations and shared terminals
| Engineering Workstations | 6 | PLC programming, shared, no access control
| Historians / Data Servers | 6 | AVEVA PI System (2), Wonderware (1), misc
| Network Switches (OT) | ~40 | Mix of managed (Cisco IE) and unmanaged (Moxa)
| IP Cameras on OT Network | ~30 | Physical security cameras routed through OT switches
| TOTAL | ~194 | Customer estimates 30-40% undocumented. Actual count expected to be higher; primary justification for automated asset discovery.
OT Protocols Identified
| Protocol | Usage | Priority
| Modbus TCP | Turbine controls, gate actuators | Critical
| GE SRTP | Mark VIe turbine controllers, Bonneville | Critical
| GE EGD | Mark VIe inter-controller data, Bonneville | Critical
| EtherNet/IP (CIP) | Allen-Bradley PLCs, John Day | Critical
| S7comm | Siemens S7-400, McNary | Critical
| OPC-UA | Historian data collection | High
| OPC-DA (Classic) | Legacy historian, The Dalles | Medium
| DNP3 | RTU communications (river monitoring) | Medium
| HTTP/HTTPS | HMI web interfaces, firmware updates | Medium
| RDP | Remote HMI access | Critical ⚠
SA Note: RDP on the OT network is a significant finding. Confirm during PoC whether this is site-to-site remote access or just local console use. If cross-site RDP exists over the DISA WAN with no segmentation, that is a high-severity gap worth calling out in the demo. Mike Osterman (SCADA PM) may push back on changing this workflow.
| SMB/CIFS | File shares, backup transfers | Medium
| IEC 61850 | Substation relays (limited deployment) | Low
4. Network Architecture Assessment
Purdue Model: As-Found
USACE NWD OT Network: As-Found Architecture
Mapped to ISA-99 / IEC 62443 Purdue Reference Architecture
LEVEL 5 · ENTERPRISE
USACE NIPRNet
Email / DNS
ATAAPS / Finance
Splunk Cloud (IT SIEM)
✓ Palo Alto PA-3260 Firewall
LEVEL 4 · IT/OT DMZ (partially implemented)
AVEVA PI Relay
WSUS Patch Server
AV Definition Server
⚠ CRITICAL GAP - No firewall between L4 DMZ and L3 control network
LEVEL 3 · SITE OPERATIONS
SCADA Servers
HMIs (22 stations)
Eng. Workstations (6)
Historians (AVEVA PI, Wonderware)
All 4 dam sites interconnected via DISA MPLS WAN - single trust domain
⚠ FLAT - No segmentation between L3 and L2, same broadcast domain
SA Note: This flat L3/L2 topology is the strongest argument for passive monitoring. They cannot segment overnight without risking production impact, but they can get visibility immediately by deploying sensors on SPAN ports. Position Dragos as the first step before segmentation, not a replacement for it. Follow up: does their maintenance window schedule allow TAP installation at John Day and McNary, or do we need SPAN-only at those sites?
LEVEL 2 · CONTROL
GE Mark VIe (Bonneville)
Emerson Ovation (The Dalles)
AB ControlLogix (John Day)
Siemens S7-400 (McNary)
LEVEL 1 · FIELD
I/O Modules · Sensors · RTUs · Gate Actuators · Spillway Controls · River Monitoring
Architecture Findings
| ID | Finding | Severity | Detail
| A-1 | No firewall between L4 DMZ and L3 control network | CRITICAL | L3 and L4 share switch fabric. DMZ compromise = direct SCADA access.
| A-2 | L3 and L2 are a flat network - no segmentation | CRITICAL | HMI compromise = direct PLC access. Found in 81% of Dragos assessments.
| A-3 | RDP enabled on 4 engineering workstations | CRITICAL | RDP is the #1 lateral movement vector in OT attacks.
| A-4 | 30+ IP cameras on OT network | HIGH | IoT devices with poor security expanding OT attack surface.
| A-5 | MPLS WAN connects all 4 sites unfiltered | HIGH | Compromise at one dam can reach all others.
| A-6 | No SPAN ports configured | INFO | Cisco IE switches support SPAN. 4-week change control lead time.
SPAN / TAP Availability
| Site | Switch | SPAN? | TAP Needed? | Lead Time
| Bonneville | Cisco IE-4010 | ✓ Yes | No | 4 weeks
| The Dalles | Cisco IE-3400 | ✓ Yes | No | 4 weeks
| John Day | HP ProCurve 2920 | ⚠ Limited | TAP recommended | 4 weeks
| McNary | Unmanaged (Moxa) | ✗ No | TAP required | 6 weeks
5. Current Security Posture
| Category | Current State | Gap
| OT Asset Inventory | Manual spreadsheet, last updated 2023 | ✗ No automated discovery. ~40% undocumented.
| OT Network Monitoring | NONE | ✗ Complete blind spot below L4 DMZ.
| Vulnerability Mgmt | Tenable.sc, IT only. No OT scanning. | ✗ Zero OT vulnerability visibility.
| Endpoint Protection | CrowdStrike Falcon on L3/L4 Windows servers only | ⚠ No coverage on HMIs or below.
| SIEM | Splunk Cloud (FedRAMP High / DoD IL5), IT side only | ⚠ Exists but has zero OT data feeds.
| Patch Management | WSUS for Windows. No OT firmware process. | ✗ Months/years behind on OT patches.
| Access Control | Shared local accounts on HMIs. No MFA. | ✗ "admin/admin" on ≥3 HMI stations.
| Incident Response | IT-only IR plan. No OT playbooks. | ✗ No OT tabletop exercises conducted.
| Backup / Recovery | Inconsistent PLC program backups | ⚠ No centralized OT backup strategy.
| Remote Access | VPN → RDP to OT workstations | ✗ No jump host. No session recording. No MFA.
6. Compliance & Regulatory
| Framework | Applicability | Status
| NIST SP 800-82 Rev 3 | Primary OT framework for federal | Not assessed
| DoD CIO OT Mandate (2026) | Requires OT monitoring by EOY FY26 | Non-compliant
| USACE EP 1130-2-510 | Internal USACE hydropower operations policy, primary compliance driver for generation assets | Gap: no OT monitoring capability
| EO 14028 | Improving the Nation’s Cybersecurity (May 2021); drives zero-trust and supply chain security | Partial, IT only
| CISA BOD 23-01 | Asset visibility for internet-accessible devices | Partial (IT only)
| FISMA | Federal baseline | IT covered; OT not in boundary
| NERC CIP | Electric reliability; applies to BES; USACE generation assets are not directly NERC CIP-registered (governed by EP 1130-2-510 and DoD directives instead) | Not applicable to generation; BPA handles transmission compliance
7. Pain Points & SA Observations
Customer-Stated Pain Points
"We have 182+ devices on our control networks and we can only account for maybe 60% of them. We don't know what's talking to what."
- Mike Osterman, SCADA Program Manager
"The unauthorized laptop at Bonneville scared us. We had no way to detect it - an operator physically saw it plugged in. If it had been remote, we'd never have known."
- Dr. Rebecca Torres
"The DoD CIO mandate says we need OT monitoring by end of fiscal year. We have 4 months."
- Dr. Torres
"We can't do anything that disrupts generator operations. If a turbine trips because of a security tool, that's a multi-million dollar event and a national news story."
- Mike Osterman
"We tried to use our IT Tenable scanner on the OT network once. It crashed two HMIs. Never again."
- Brian Knox, OT Network Administrator
SA-Observed Gaps (Not Stated by Customer)
| ID | Observation | Risk
| G-1 | Customer unaware MPLS WAN creates a single trust domain across all 4 dams | One dam compromised = all dams compromised
| G-2 | IP cameras on OT network = unmanaged IoT attack surface | Cameras are easy pivot points for adversaries
| G-3 | No supply chain security for PLC firmware updates | Firmware delivered via USB with no integrity verification
| G-4 | Shared engineering workstations are not hardened | Single compromise = PLC programming access
| G-5 | "Legacy relay protection" at The Dalles, no digital monitoring | Relay tampering attack (cf. Industroyer) would be undetected
8. Decision Criteria & Procurement
| Factor | Detail
| Technical Decision Maker | Dr. Rebecca Torres, Chief, Cybersecurity Division (NWD)
| Budget Authority | COL Harding (approval) → Jennifer Walsh (contracting)
| Budget Range | $600K - $1M (FY26 funds, must obligate by Sep 30)
| Procurement Path | NASA SEWP V via Carahsoft (ordering period extended through Sep 30, 2026; SEWP VI pending)
| Contract Type | Firm Fixed Price (FFP) + option years for subscriptions
| Decision Timeline | Technical eval: Jun-Jul  |  Award: Aug-Sep
| Competition | Claroty contacted, no formal eval started. Nozomi not considered. Strong Dragos brand affinity; customer heard Robert M. Lee at S4 Conference.
| Security Requirements | CUI handling. FedRAMP preferred. STIG-hardened appliances required. §889 supply chain certification required.
| Deployment Constraints | No active scanning. No agents on PLCs. Passive only. Change control required for SPAN.
| System Categorization | Recommended FIPS 199: Moderate-Moderate-High. HIGH availability drives HIGH control baseline. Discuss with ISSO during PoC scope meeting.
| Site Access | All 4 dams are restricted federal installations. Dragos personnel need PIV/CAC or escort. 14-day advance request through NWD Physical Security. SA coordinates access during deployment planning.
9. Proposed Solution Approach
| Site | Sensors | SiteStore | Notes
| Bonneville Dam | 2 (SPAN × 2 segments, Powerhouse 1 + 2) | 1 × Hardware | Largest facility; 2 powerhouses require separate SPAN sessions on separate switch stacks
| The Dalles Dam | 1 (L3 SPAN) | 1 × Hardware | Emerson Ovation; verify OPC-DA/UA and Ovation proprietary protocol parsing
| John Day Dam | 2 (L3 SPAN + L2 TAP) | 1 × Hardware | TAP needed; HP ProCurve 2920 has limited SPAN capability per SPAN/TAP assessment
| McNary Dam | 1 (TAP required) | 1 × Hardware | Siemens S7; verify S7comm parsing. Hardware SiteStore required, no existing server infrastructure for VM.
| Enterprise (NWD HQ) |  -  |  -  | 1 × CentralStore (VM on existing NWD data center infrastructure)
Integration Points
| Target System | Integration | Method
| Splunk Cloud | OT alerts → Splunk | Syslog/CEF over TLS
| CrowdStrike Falcon | IOC sharing | REST API (bi-directional)
| ITSM (ServiceNow TBC) | Vulnerability tickets | REST API - customer to confirm ITSM platform during solution design
10. Next Steps
| # | Action | Owner | Due | Status
| 1 | Produce Solution Architecture Document | Aaron Kotz (SA) | May 30 | Open
| 2 | Schedule tailored demo for Dr. Torres + OT team | AE + SA | Week of Jun 9 | Open
| 3 | Engage Carahsoft for SEWP V pricing | AE | Jun 6 | Open
| 4 | Submit SPAN port change request at Bonneville (4-week change control → clears Jun 19) | Brian Knox | May 22 | Pending
| 4a | Submit IATT package through eMASS for Bonneville PoC (target: granted before SPAN clears) | ISSO + SA support | Jun 6 | Open
| 5 | Procure Gigamon TAPs for John Day + McNary | Jennifer Walsh | Jun 13 | Open
| 6 | Verify S7comm + Emerson Ovation protocol support | SA (internal) | May 27 | Open
| 7 | Schedule PoC scope meeting (Bonneville pilot - target start Jun 23 after SPAN clears) | SA + Dr. Torres | Jun 16 | Open
| 8 | Draft PoC success criteria document | SA | Jun 20 | Open
| 9 | Internal Dragos review - pricing + services scoping | SA + AE + Deal Desk | Jun 2 | Open
| 10 | Provide FedRAMP / ATO documentation package (STIG results, SSP sections, POAM templates) formatted for eMASS submission | SA (internal) | Jun 6 | Open
Dragos, Inc., Confidential
Technical Discovery Document v1.4, DRG-FED-2026-0847