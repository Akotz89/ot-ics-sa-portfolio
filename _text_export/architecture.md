# Solution Architecture and Bill of Materials

Source: architecture.html

---

Solution Architecture - USACE Columbia River Hydropower
Dragos, Inc. - Public Sector
Solution Architecture & Bill of Materials
U.S. Army Corps of Engineers - Northwestern Division
Columbia River Hydropower OT Cybersecurity Program
Prepared ByAaron Kotz, Solutions Architect (Federal) [Exercise Role]
Account Executive[AE Name], Dragos Public Sector
Channel PartnerCarahsoft Technology Corp.
Contract VehicleNASA SEWP V (via Carahsoft)
DateMay 22, 2026
Version1.0 - Post-Discovery Architecture
Opportunity IDDRG-FED-2026-0847
Based OnDiscovery Document v1.4 (DRG-FED-2026-0847)
PORTFOLIO EXERCISE - Sample work product created for interview preparation. Not a Dragos engagement.
CUI // FOUO - Distribution Limited to Dragos Internal + Carahsoft
1. Executive Summary
This architecture covers the Dragos Platform deployment for the USACE Northwestern Division (NWD) Columbia River hydropower facilities: Bonneville, The Dalles, John Day, and McNary. These four dams generate 5,970 MW combined and currently have no OT network monitoring.
The design is based on the Technical Discovery session conducted May 15, 2026 (see Discovery Document v1.4, DRG-FED-2026-0847). Threat context is documented in the Discovery report; key drivers are VOLTZITE pre-positioning activity and the DoD CIO OT monitoring mandate.
Design Principle: All OT data stays on-premises. Only structured alert metadata leaves the local network via encrypted channels to existing enterprise security tools. No raw PCAP, asset data, or process telemetry goes to any cloud service.
The deployment: 6 passive sensors across 4 dam sites, 4 SiteStores for local analysis, and 1 CentralStore at NWD HQ for enterprise aggregation. Passive monitoring only (Purdue L1-L3). No active scanning.
2. Site Deployment Architecture
Deployment varies by site based on controller platform, switch capabilities, and protocol mix. Sensor placement and tap strategy are driven by what each site's network gear can support.
🏭 Bonneville Dam - PoC Site
Capacity: 1,050 MW · 18 generating units
Controller: GE Mark VIe
HMI: GE CIMPLICITY
Protocols: GE SRTP, EGD, Modbus TCP, OPC-UA
Network: Cisco IE-4010 managed switches
Tap Strategy: SPAN port mirroring (no TAP hardware needed)
Sensors: 2 (L2 process network + L3 site operations)
SiteStore: 1× SiteStore appliance
🏭 The Dalles Dam
Capacity: 1,780 MW nameplate · 22 generating units
Controller: Emerson Ovation DCS
HMI: Ovation Operator Workstations
Protocols: OPC-UA, Modbus TCP
Network: Cisco IE-3400 managed switches
Tap Strategy: SPAN port mirroring
Sensors: 1 (combined L2/L3, flat OT network)
SiteStore: 1× SiteStore appliance
🏭 John Day Dam
Capacity: 2,160 MW · 16 generating units
Controller: AB ControlLogix L83
HMI: FactoryTalk View SE
Protocols: EtherNet/IP (CIP), Modbus TCP
Network: HP ProCurve 2920 (limited SPAN)
Tap Strategy: Network TAP required (switches lack adequate SPAN)
Sensors: 2 (L1/L2 process + L3 operations)
SiteStore: 1× SiteStore appliance
🏭 McNary Dam
Capacity: 980 MW · 14 generating units
Controller: Siemens S7-400
HMI: WinCC 7.5
Protocols: S7comm, Modbus TCP
Network: Moxa EDS unmanaged switches
Tap Strategy: Network TAP required (unmanaged switches)
Sensors: 1 (combined, smaller OT footprint)
SiteStore: 1× SiteStore appliance (compact)
3. CentralStore & Enterprise Architecture
CentralStore - NWD Headquarters (Portland, OR)
The CentralStore is deployed as a virtual machine in the NWD HQ data center, aggregating data from all 4 SiteStores over encrypted channels. It provides:
Unified asset inventory across all 4 dam sites (est. 800-1,000 OT assets)
Cross-site threat correlation to detect adversary lateral movement between facilities
Enterprise vulnerability dashboard with Now/Next/Never prioritization
Executive reporting for NWD leadership and USACE HQ
SIEM integration point (single syslog feed to Splunk Cloud)
VM Requirements: 8 vCPU, 32 GB RAM, 2 TB storage, VMware ESXi 8.0+ or RHEL 9.x KVM. DISA STIG baseline applied.
Network: SiteStore → CentralStore: ~5-10 Mbps per site (metadata transport over encrypted WAN). Data Retention: 90-day PCAP per SiteStore (local); 1-year alert/asset history at CentralStore.
4. Integration Architecture
Dragos integrates with the customer's existing security tools. All integrations use encrypted channels and send metadata only. No raw OT data leaves the on-premises environment.
📊 Splunk Cloud
Method: Syslog/CEF over TLS
Source: CentralStore → Splunk Cloud
Data: Alert metadata only (type, severity, timestamp, asset ID). No raw PCAP.
Value: OT alerts in existing SOC dashboards
🛡️ CrowdStrike Falcon
Method: REST API (bi-directional)
Dragos → CS: OT IOCs + asset inventory → Falcon Discover for IoT
CS → Dragos: EDR context (hostname, OS, AD domain) enriches OT asset data
Value: Correlate IT endpoint context with OT asset data
🌐 Neighborhood Keeper
Method: Anonymized sensor telemetry
Source: Sensors → Dragos Cloud (anonymized)
Data: Statistical threat patterns only. Zero customer-identifiable data.
Value: Cross-sector threat awareness without exposing customer data
4.1 Ports, Protocols & Data Flow Matrix
The following matrix defines all network communications required by the Dragos Platform deployment. This table satisfies PPSM registration and SIA requirements.
| Source | Destination | Port | Protocol | Direction | Data Content
| Sensor | OT Network |  -  |  -  | NONE (receive-only) | Passive capture via SPAN/TAP - no packets sent to OT network
| Sensor | SiteStore | 443/TCP | TLS (HTTPS) | Outbound | Captured traffic metadata, parsed protocol data
| SiteStore | CentralStore | 443/TCP | TLS (HTTPS) | Outbound | Structured alerts, asset inventory, vulnerability data (no raw PCAP)
| CentralStore | Splunk Cloud | 6514/TCP | Syslog/CEF over TLS | Outbound | Alert metadata: type, severity, timestamp, asset ID
| CentralStore | CrowdStrike | 443/TCP | REST API (HTTPS) | Bi-directional | OT IOCs → CS; EDR context ← CS
| Sensor | Neighborhood Keeper | 443/TCP | TLS (HTTPS) | Outbound | Anonymized statistical telemetry only
| Admin workstation | SiteStore / CentralStore | 443/TCP | HTTPS | Inbound (mgmt) | Web UI management interface
| Admin workstation | SiteStore / CentralStore | 22/TCP | SSH | Inbound (mgmt) | CLI administration
Key Point: The Sensor → OT Network row is intentionally blank. Dragos sensors are physically configured as receive-only; there is no transmit path to the monitored OT network. This passive-only architecture is the foundation for a streamlined Security Impact Analysis and accelerated ATO timeline.
5. Bill of Materials
The following Bill of Materials is sized to the architecture described above. All pricing is indicative and subject to Deal Desk approval and Carahsoft quoting.
| Category | Item | Qty | Unit | Notes
| Hardware | Dragos Sensor Appliance | 6 | Each | 2× Bonneville, 1× Dalles, 2× John Day, 1× McNary
| Dragos SiteStore Appliance | 3 | Each | Bonneville, The Dalles, John Day - sized for 300-500 asset sites
| Dragos SiteStore Appliance (Compact) | 1 | Each | McNary - sized for <200 asset site
|  | Hardware Subtotal - 10 appliances
| Software | Dragos Platform License | 1 | Enterprise Tier | ≤500 assets, 4 sites, includes CentralStore
| CentralStore VM License | 1 | Each | NWD HQ - VMware deployment
|  | Software Subtotal - Enterprise platform + CentralStore
| Subscriptions | WorldView Threat Intelligence | 1 | Annual | Threat group tracking, vulnerability advisories, IOC feeds
| OT Watch | 1 | Annual | Managed detection - covers staffing gap for OT SOC
| Neighborhood Keeper | 1 | Annual | Included with platform - community defense enrollment
|  | Subscriptions Subtotal - Annual recurring
| Services | Architecture Assessment | 1 | Engagement | Pre-deployment network architecture review
| Deployment & Configuration | 4 | Sites | On-site sensor + SiteStore installation per site
| CentralStore Integration | 1 | Engagement | Splunk + CrowdStrike integration setup
| Platform Training | 1 | Session | 2-day administrator + analyst training for NWD team
|  | Services Subtotal - One-time professional services
|  | Total: Priced via Carahsoft quote under NASA SEWP V - FFP Year 1
Note: Pricing is indicative. Final pricing determined by Dragos Deal Desk and quoted through Carahsoft. FFP contract type recommended for Year 1 to simplify procurement.
Year 1 FFP Cost Summary (GSA Schedule 70 Basis)
| Category | Components | Estimated Cost
| Hardware | 6 Sensor Appliances + 3 SiteStore (Standard) + 1 SiteStore (Compact) + TAPs | $209K
| Software | Platform licenses (sensors + SiteStores) + CentralStore license | $157K
| Subscriptions | WorldView Threat Intelligence + OT Watch (6 sensors) | $108K
| Services | Architecture Assessment + 4-site Deployment + Training | $181K
|  | GSA Schedule Floor Total | $655K
| Adjustments | WorldView tier, Gigamon TAPs (John Day + McNary), travel/per diem, CentralStore full license | +$119K
|  | Year 1 FFP Estimate: ~$780K (via Carahsoft / NASA SEWP V)
Pricing derived from GSA Advantage Schedule 70 contract GS-35F-0142V (Dragos, Inc.). Individual line-item part numbers and unit costs documented in research evidence file. All prices are GSA-discounted list; actual task order pricing negotiated through Carahsoft.
6. Compliance & Regulatory Alignment
This architecture maps to four federal compliance frameworks. The platform generates evidence artifacts for each.
USACE EP 1130-2-510
OT asset inventory, network monitoring, vulnerability management. Dragos Platform provides continuous compliance evidence for all three requirements.
NIST SP 800-82 Rev 3
ICS security guidance. Platform addresses network monitoring (§5.3), access control validation (§5.5), and incident response capability (§6.2).
DoD CIO OT Security Directive
Mandates OT cybersecurity programs across all DoD components. This deployment covers the asset visibility and network monitoring requirements.
NIST SP 800-53 Rev 5
Federal security controls. Platform provides evidence for SI-4 (System Monitoring), AU-6 (Audit Review), IR-4 (Incident Handling), and RA-5 (Vulnerability Scanning).
7. Authorization to Operate (ATO) Strategy
All components require ATO before production deployment on USACE networks. The following strategy accelerates the authorization timeline:
| Phase | Authorization Type | Duration | Artifacts Provided
| RMF Step 1 | System Categorization (FIPS 199) | Pre-PoC | Recommended categorization: Moderate-Moderate-High (availability drives HIGH baseline due to safety-critical infrastructure)
| PoC | IATT / Test Authorization | 2-3 weeks | STIG checklist, network diagram, data flow diagram, ports/protocols matrix
| Production | Full ATO (RMF) | 3-6 months | Pre-built STIG results, SSP contribution sections, hardware/software inventory, POA&M templates
| Ongoing | Continuous Authorization | Ongoing | Automated compliance evidence: continuous asset inventory, vulnerability tracking, threat detection logs. Supports ISSO's ongoing authorization reporting requirements.
ATO Acceleration Approach
Published STIG: Dragos Platform 2.x STIG is available on public.cyber.mil, eliminating 3-6 months of control documentation
Early ISSO Engagement: SA coordinates introductory call between Dragos engineering and NWD ISSO during PoC phase. SA provides architecture artifacts formatted for eMASS submission
Passive-Only Architecture: Sensors are receive-only (no transmit path to OT network), which reduces risk assessment complexity
Precedent: Dragos has completed ATO at 13+ federal sites with reusable artifact templates available
In my current role, I coordinate IATT packages and eMASS submissions as part of our site's RMF compliance cycle. I have walked through this exact process for new systems entering our authorization boundary, including FIPS 199 categorization, STIG application, and POA&M management. The same workflow applies here.
Security Impact Analysis (SIA) Approach
Adding Dragos components to the USACE OT network authorization boundary triggers a Security Impact Analysis. The SA proactively provides SIA artifacts (ports/protocols matrix, data flow diagrams, network diagrams, hardware/software inventory) to the ISSO before deployment. The passive-only sensor architecture reduces SIA complexity because the system cannot affect the monitored OT network, eliminating an entire class of risk controls from the assessment scope.
Supply Chain Compliance (§889 NDAA)
All Dragos hardware appliances (SiteStore, sensors) are built on Dell PowerEdge / HPE ProLiant server platforms with documented supply chain provenance. No Section 889-prohibited components. Dragos provides a supply chain compliance certification letter for inclusion in the procurement package. Network TAPs (Gigamon) and managed switches (Cisco IE-4010) are also §889-compliant with US-based supply chains.
Resilience & High Availability
Sensor failure: Traffic continues to flow on the OT network unaffected. The sensor is passive and not inline
SiteStore failure: Sensors buffer captured data locally for up to 24 hours pending SiteStore recovery
CentralStore failure: Each SiteStore operates independently with full local analysis, detection, and alerting capability. No single point of failure for site-level monitoring
WAN outage: SiteStores queue metadata transport and sync automatically when connectivity restores
8. PoC Success Criteria
The Bonneville PoC is evaluated against five success criteria. All must be met before recommending production deployment.
| # | Criterion | Target | Measurement Method
| 1 | Asset Discovery Accuracy | ≥95% of known OT assets detected | Compare Dragos asset inventory against SCADA PM's baseline list
| 2 | Protocol Parsing Coverage | GE SRTP, EGD, Modbus TCP, OPC-UA all parsed | Verify protocol-specific fields populated in asset detail view
| 3 | Vulnerability Identification | Known CVEs correlated to discovered assets | Vulnerability dashboard populated with Now/Next/Never ratings
| 4 | Detection Fidelity | <5% false positive rate on generated alerts | Analyst review of all alerts during 14-day evaluation window
| 5 | SIEM Integration | Alerts visible in Splunk within 60 seconds | Timed test: trigger alert → verify Splunk dashboard update
9. Deployment Timeline
| Phase | Timeline | Activities | Gate
| PoC | Jun-Jul 2026 | Bonneville Dam - 2 sensors + 1 SiteStore. Validate GE SRTP/EGD parsing, asset discovery, Splunk integration. | Success criteria met (5/5)
| ARB Review | Aug 2026 | Present PoC findings + full architecture to NWD Architecture Review Board. | ARB endorsement
| Contract Award | Sep 2026 | SEWP V task order via Carahsoft. FFP Year 1. | CO signature
| First Site Live | Dec 2026 | Bonneville production deployment + NK enrollment. CentralStore at NWD HQ. | Site acceptance
| Remaining Sites | Jan-Mar 2027 | The Dalles, John Day, McNary - sequential rollout. TAP installation at John Day and McNary during scheduled outage windows. | Full operational capability
Key Constraint: John Day and McNary require network TAP installation during scheduled maintenance windows. TAP procurement and change control requests should be initiated during the PoC phase to avoid timeline delays.
10. Multi-Site Deployment Topology
NWD Headquarters - Portland, OR
Enterprise Aggregation + Executive Dashboards
CentralStore
Splunk Cloud
CrowdStrike
Neighborhood
Keeper
DISA MPLS WAN (NIPRNet)
Bonneville Dam
1,050 MW · 18 Units · GE Mark VIe
Sensor (SPAN)
Sensor (SPAN)
PH1 + PH2 segments
SiteStore (Standard)
PoC Site - Proven
The Dalles Dam
1,780 MW · 22 Units · Emerson Ovation
Sensor (SPAN)
L3 core switch
SiteStore (Standard)
John Day Dam
2,160 MW · 16 Units · AB ControlLogix
Sensor (SPAN)
Sensor (TAP)
TAP required - HP ProCurve limited SPAN
SiteStore (Standard)
McNary Dam
980 MW · 14 Units · Siemens S7-400
Sensor (TAP)
TAP required - Moxa unmanaged
SiteStore (Compact)
6 Sensors + 4 SiteStores + 1 CentralStore (VM) = 10 Hardware Appliances
5,970 MW Combined · 70 Generating Units · 4 Controller Platforms · ~$780K Year 1 FFP
Dragos Sensor (passive)
SiteStore / CentralStore
DISA MPLS WAN
Red = TAP required
Green = PoC validated
Data Flow: Sensors → SiteStore (encrypted metadata, local PCAP) → CentralStore (aggregated analytics) → Splunk (syslog/CEF alerts only)
All traffic between sites traverses encrypted DISA WAN. No data leaves the USACE network boundary except Neighborhood Keeper telemetry (anonymized).
CUI // FOUO - Dragos Internal + Carahsoft
Solution Architecture v1.0 - DRG-FED-2026-0847