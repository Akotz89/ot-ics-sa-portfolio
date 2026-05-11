# RFP Technical Volume Response

Source: rfp-response.html

---

RFP Technical Volume - USACE OT Cybersecurity
Dragos, Inc. - Public Sector
Technical Volume
Response to USACE NWD Solicitation: OT Cybersecurity Monitoring Platform
RFP No. W912EF-26-R-0042 (Exercise)
OfferorDragos Public Sector LLC
VolumeVolume I - Technical
UEI[Populated by contracts team at submission]
CAGE Code[Populated by contracts team at submission]
Contract VehicleNASA SEWP V (via Carahsoft)
Version1.0 - Initial Submission
PORTFOLIO EXERCISE - Sample work product created for interview preparation. Not a Dragos engagement.
CUI // FOUO - Source Selection Sensitive
Table of Contents
Section 1: Understanding of Requirements Factor 1
Section 2: Technical Approach Factor 1
Section 3: Deployment Methodology Factor 2
Section 4: Staffing & Key Personnel Factor 3
Section 5: Risk Mitigation Factor 2
Section 6: Requirements Compliance Matrix Attachment A
Section 7: Past Performance References Factor 4
Section 1: Understanding of Requirements
The U.S. Army Corps of Engineers - Northwestern Division requires a purpose-built OT cybersecurity platform to provide continuous network monitoring, asset visibility, and vulnerability management across four Columbia River hydropower facilities generating 5,970 MW of combined capacity.
We understand the critical constraints:
Zero operational disruption - turbines cannot be scanned, crashed, or interrupted. Passive monitoring is non-negotiable.
Multi-vendor environment - GE Mark VIe, Emerson Ovation, AB ControlLogix, and Siemens S7-400 controllers require protocol-native parsing.
Federal compliance - USACE EP 1130-2-510, DoD CIO OT Directive, NIST 800-82 Rev 3, and NIST 800-53 Rev 5 controls.
Existing security tools - solution must integrate with Splunk Cloud (FedRAMP High / DoD IL5) and CrowdStrike Falcon.
Not NERC CIP - federal hydropower facilities under USACE operate under DoD authority, not FERC/NERC. Compliance framework is EP 1130-2-510 and DoD CIO guidance.
Section 2: Technical Approach
Dragos proposes its purpose-built OT cybersecurity platform with the following architecture:
| Component | Quantity | Placement | Function
| Passive Sensors | 6 | L1-L3 at each dam site | Traffic capture via SPAN/TAP, 600+ protocol parsers
| SiteStore | 4 | 1 per dam facility | Local analysis, detection, asset inventory
| CentralStore | 1 | NWD HQ (Portland) | Enterprise aggregation, cross-site correlation, SIEM integration
The platform addresses all four SANS 5 Critical Controls relevant to this requirement: Defensible Architecture, ICS Network Monitoring, Secure Remote Access Detection, and Risk-Based Vulnerability Management.
Section 3: Deployment Methodology
Phase 1Pre-Deployment Planning
Week 0
Phase 2Environment Prep
Week 1-2
Phase 3Deploy & Baseline
Week 2-3
Phase 4Validation
Week 3-6
Phase 5Acceptance
Week 7
Sites are deployed sequentially: Bonneville (proven PoC) → The Dalles → John Day → McNary. John Day and McNary require network TAP installation during scheduled maintenance windows. Total deployment timeline: 16 weeks from contract award to full operational capability across all 4 sites.
Section 4: Staffing & Key Personnel
Solutions Architect (Federal) - Primary Technical Lead
Responsible for architecture design, deployment oversight, and customer technical engagement. Requirements: Active TS/SCI clearance, 5+ years federal infrastructure experience, OT/ICS protocol knowledge.
Deployment Engineer - Platform Installation
On-site sensor and SiteStore deployment, STIG application, integration configuration. Requirements: Dragos Platform certification, Linux administration, network TAP installation experience.
OT Threat Analyst - Post-Deployment Support
Alert triage, threat hunting, vulnerability advisory analysis via OT Watch managed service. Requirements: ICS/OT protocol expertise, Dragos WorldView intelligence access.
Section 5: Risk Mitigation
| Risk | Probability | Impact | Mitigation
| TAP installation delays (change control) | MEDIUM | Schedule slip | Initiate change control requests during pre-deployment phase; coordinate with dam maintenance schedules
| ATO timeline extension | MEDIUM | Deployment delay | DISA STIG pre-built; IATT for PoC, full ATO for production. ATO artifact package prepared during Phase 1; early ISSO engagement for eMASS submission
| Protocol parsing gaps | LOW | Reduced visibility | All 4 controller platforms (GE, Emerson, AB, Siemens) are natively supported; validated during PoC
| Staff clearance requirements | LOW | Personnel delay | All proposed key personnel hold active clearances; Dragos maintains cleared bench depth
Section 6: Requirements Compliance Matrix
The following matrix demonstrates compliance with each SOW requirement:
| Req ID | Requirement | Status | Proposed Solution
| SOW-01 | Continuous passive OT network monitoring across all 4 dam sites | FULL | 6 passive sensors deployed via SPAN/TAP. Zero active scanning. 24/7 monitoring via OT Watch.
| SOW-02 | Automated OT asset discovery and inventory management | FULL | Passive asset discovery with 600+ protocol parsers. Continuous inventory updates. PoC validated 97% discovery in 48 hours.
| SOW-03 | OT vulnerability identification and prioritization | FULL | Now/Next/Never prioritization framework with Dragos WorldView threat intelligence context. OT-corrected CVSS scoring.
| SOW-04 | Integration with existing SIEM (Splunk Cloud) | FULL | Syslog/CEF over TLS from CentralStore. Alert metadata only - no raw PCAP exported. Validated during PoC.
| SOW-05 | Integration with existing EDR (CrowdStrike Falcon) | FULL | REST API bi-directional integration. OT IOCs → Falcon; EDR context → Dragos asset enrichment.
| SOW-06 | Support for 4 controller platforms (GE, Emerson, AB, Siemens) | FULL | Native protocol parsing for SRTP, EGD, OPC-UA, Modbus TCP, EtherNet/IP (CIP), S7comm. All validated.
| SOW-07 | DISA STIG-compliant deployment | FULL | Platform 2.x STIG published on public.cyber.mil. Pre-hardened appliances.
| SOW-08 | Incident response forensic capability | FULL | Full PCAP replay, protocol-aware search, timeline reconstruction. On-prem evidence retention.
| SOW-09 | Air-gapped operation capability | PARTIAL | Platform operates fully offline. Content updates (threat signatures, vulnerability advisories) require manual secure media transfer on a defined schedule. Automated update mechanisms are not available in air-gapped mode. NK enrollment requires outbound connectivity and is not available in fully air-gapped deployments.
| SOW-10 | 24/7 managed monitoring service | PARTIAL | OT Watch managed detection service available for sites with outbound connectivity to Dragos cloud infrastructure. Air-gapped sites (if applicable) would require on-site analyst staffing or periodic PCAP export for remote analysis. OT Watch connectivity requirements should be validated against site network policy during deployment planning.
| SOW-11 | Supply chain compliance (§889 NDAA) | FULL | All Dragos hardware (Dell/HPE platforms) certified §889-compliant. Supply chain provenance documentation available. No prohibited telecommunications components.
| SOW-12 | RMF authorization support artifacts | FULL | Published DISA STIG (public.cyber.mil). Pre-built SSP contribution sections, POA&M templates, FIPS 199 categorization guidance, and PPSM registration data. SA provides direct ISSO support through ATO.
Section 7: Past Performance (Sanitized)
| Reference | Sector | Scope | Outcome
| Federal Electric Utility (DoD) | Energy / Defense | Multi-site OT monitoring, 12 substations | Full deployment, renewed Year 2. Zero operational disruptions.
| Federal Water Authority | Water / Wastewater | SCADA monitoring, 8 treatment plants | Identified 3 critical vulnerabilities in first 72 hours. Platform credited with preventing potential incident.
| Defense Industrial Base | Manufacturing / Defense | OT visibility for classified manufacturing | Air-gapped deployment. Met all ATO requirements. Integrated with existing SIEM.
Past performance references above are representative engagement profiles created for this portfolio exercise. In a real RFP response, this section would be populated by the contracts team with verified CPARS-rated references. The SA's role is to ensure the technical scope descriptions accurately reflect delivered capabilities. These examples illustrate the types of federal OT engagements Dragos would reference.
CUI // FOUO - Source Selection Sensitive · Technical Volume v1.0 · RFP W912EF-26-R-0042 (Exercise)