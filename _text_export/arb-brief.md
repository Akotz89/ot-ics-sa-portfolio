# Architecture Review Board Brief

Source: arb-brief.html

---

ARB Brief - USACE Columbia River Hydropower
Dragos, Inc. - Public Sector
Architecture Review Board Brief
U.S. Army Corps of Engineers - Northwestern Division
OT Cybersecurity Program - Dragos Platform Deployment
Presented ByAaron Kotz, Solutions Architect (Federal) [Exercise Role]
SponsorCOL James Harding, District Commander, Portland District
ChampionDr. Rebecca Torres, Chief, Cybersecurity Division (NWD)
DateAugust 14, 2026
ARB SessionNWD IT Governance - Quarterly Review
Decision RequestedEndorsement for full 4-site deployment procurement
PORTFOLIO EXERCISE - Sample work product created for interview preparation. Not a Dragos engagement.
CUI // FOUO - Distribution Limited to ARB Members
Agenda
| # | Topic | Time
| 1 | Problem Statement - Current OT Visibility Gaps | 5 min
| 2 | Proof of Value Results - Bonneville Dam | 10 min
| 3 | Proposed Architecture - 4-Site Deployment | 10 min
| 4 | Compliance Alignment | 5 min
| 5 | Risk Assessment - Cost of Inaction | 5 min
| 6 | Budget & Timeline | 5 min
| 7 | Decision - ARB Endorsement | 5 min
1. Problem Statement
NWD operates 5,970 MW of hydroelectric generation across 4 major dams with zero OT network visibility.
0
OT Assets Monitored
70
Turbine Controllers
4
Controller Vendors
0
OT Incident Response Capability
Current State: If an adversary gained access to a turbine controller today, NWD would have no way to detect, investigate, or respond. The first indication would be a physical failure - by which point the attack has already succeeded.
2. Proof of Value Results - Bonneville Dam
30-day evaluation (Jun 23 - Jul 23, 2026) · All 5 success criteria met
5/5
Success Criteria Met
247
Assets Discovered
27
Previously Unknown
0
Operational Disruptions
| Finding | Severity | Status
| Undocumented jump server bridging L3/L4 boundary | CRITICAL | Remediation in progress
| 2 Windows XP HMIs on L2 process network | HIGH | Compensating controls applied
| SMB traffic crossing IT→OT boundary | HIGH | Firewall rule audit initiated
| 34 OT vulnerabilities identified (2 Now / 8 Next / 24 Never) | MEDIUM | Prioritized remediation plan
3. Proposed Architecture
| Site | Controller | Sensors | SiteStore | Tap Strategy
| Bonneville (1,050 MW) | GE Mark VIe | 2 | SiteStore (standard) | SPAN (Cisco IE-4010)
| The Dalles (1,780 MW) | Emerson Ovation | 1 | SiteStore (standard) | SPAN (Cisco IE-3400)
| John Day (2,160 MW) | AB ControlLogix L83 | 2 | SiteStore (standard) | TAP (HP ProCurve 2920, limited SPAN)
| McNary (980 MW) | Siemens S7-400 | 1 | SiteStore (compact) | TAP (Moxa unmanaged)
| CentralStore | NWD HQ (Portland) | VM | Aggregation + SIEM integration
Integration: Splunk Cloud (Syslog/CEF - FedRAMP High / DoD IL5) · CrowdStrike Falcon (REST API - bi-directional IOC exchange) · Neighborhood Keeper (anonymized community defense)
4. Compliance Alignment
| Requirement | Source | Dragos Coverage
| OT Asset Inventory | USACE EP 1130-2-510; CISA BOD 23-01 | ✓ Continuous passive discovery
| OT Network Monitoring | NIST 800-82 §5.3; DoD CIO OT Directive | ✓ 600+ protocol parsers, behavioral analytics
| Vulnerability Management | NIST 800-53 RA-5; EP 1130-2-510 | ✓ Now/Next/Never prioritization
| Incident Response | NIST 800-53 IR-4; CIRCIA | ✓ PCAP forensics, timeline reconstruction
| System Hardening | DISA STIG | ✓ Platform 2.x STIG published on public.cyber.mil
| RMF Authorization | NIST SP 800-37; DoDI 8510.01 | ✓ IATT for PoC (90-day); full ATO artifacts pre-built. eMASS-ready package
| Supply Chain (§889) | NDAA FY2019 §889; FASCSA | ✓ Dell/HPE hardware, documented provenance, compliance letter available
5. Risk Assessment - Cost of Inaction
VOLTZITE (PRC-linked) Pre-Positioning
Active reconnaissance of US electric utilities per CISA AA24-038A. The Columbia River Basin produces 40% of US hydroelectric generation; these 4 dams are part of that grid. Current detection capability: zero.
CHERNOVITE ICS Attack Framework
PIPEDREAM/INCONTROLLER targets safety controllers across vendors. First cross-industry ICS malware. Without protocol-level monitoring, this type of attack is invisible to IT security tools.
Regulatory Non-Compliance
EP 1130-2-510 requires OT asset inventory and network monitoring. Current state: manual spreadsheets, no continuous monitoring. Audit risk is increasing with DoD-wide OT security emphasis.
Cascading Infrastructure Impact
A successful attack on Columbia River dams affects power generation (5,970 MW), navigation, flood control, irrigation, and fish passage across 3 states. The blast radius extends far beyond USACE.
6. Budget & Timeline
Investment Summary
| Category | Year 1
| Hardware (Sensors + SiteStores) | 10 appliances
| Software (Platform Enterprise) | ≤500 assets, 4 sites
| Subscriptions (WorldView + OT Watch) | Annual
| Services (Assessment + Deploy + Training) | One-time
| Total FFP Year 1 | ~$780K
Via NASA SEWP V (Carahsoft). Final pricing from Deal Desk.
Deployment Timeline
PoC ✓
Jun-Jul '26
ARB ← Today
Aug '26
Contract
Sep '26
All Sites Live
Jan '27
7. Decision Requested
ARB Endorsement - Full 4-Site Deployment
We request the Architecture Review Board endorse the proposed Dragos Platform deployment for procurement via NASA SEWP V:
Architecture technically sound - validated by 30-day PoC at most complex site
Compliance requirements addressed - EP 1130-2-510, NIST 800-82, DoD CIO OT Directive
Integration validated - Splunk Cloud, CrowdStrike Falcon, Neighborhood Keeper operational
Procurement path clear - SEWP V task order via Carahsoft, ~$780K FFP Year 1
Upon endorsement: Procurement package forwarded to Jennifer Walsh (Contracting Officer) for SEWP V task order initiation. Target contract award: September 2026.
CUI // FOUO - ARB Members Only · Architecture Review Board Brief v1.0 · DRG-FED-2026-0847