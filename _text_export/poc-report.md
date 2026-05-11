# Proof of Value Findings Report

Source: poc-report.html

---

PoC Findings Report - Bonneville Dam
Dragos, Inc. - Public Sector
Proof of Value - Findings Report
U.S. Army Corps of Engineers - Bonneville Dam
Dragos Platform PoC · June 23 - July 23, 2026
Prepared ByAaron Kotz, Solutions Architect (Federal) [Exercise Role]
Customer ChampionDr. Rebecca Torres, Chief, Cybersecurity Division (NWD)
PoC Duration30 days (Jun 23 - Jul 23, 2026)
SiteBonneville Dam - 1,050 MW, 18 units
Sensors Deployed2 (L2 process + L3 operations)
SiteStore1× SiteStore VM (evaluation deployment)
Opportunity IDDRG-FED-2026-0847
AuthorizationIATT granted Jun 18, 2026 (90-day, expires Sep 16)
Version1.0 - Final Report
PORTFOLIO EXERCISE - Sample work product created for interview preparation. Not a Dragos engagement.
CUI // FOUO - Distribution Limited to Named Parties
1. Executive Summary
Over a 30-day Proof of Value engagement at Bonneville Dam, the Dragos Platform exceeded all five agreed-upon success criteria. The platform discovered 247 OT assets (12% more than the customer's manual inventory), identified 3 previously unknown communication paths, and demonstrated deep protocol parsing across all four site-relevant protocols - with zero operational disruptions.
Bottom Line: The Dragos Platform provides the OT visibility that USACE NWD currently lacks, validated at the most complex site in the Columbia River system. The architecture is proven and ready for full deployment across all four dam sites.
2. Success Criteria Results
All five success criteria, agreed with Dr. Torres prior to deployment, were met or exceeded:
1
Discover ≥90% of known OT assets within 72 hours of sensor activation
✓ 97% (214/220) - exceeded in 48 hours
2
Identify ≥1 previously unknown device or communication path
✓ 3 unknown paths + 27 undocumented assets
3
Demonstrate protocol-specific parsing for ≥3 site-relevant OT protocols
✓ 4/4 protocols parsed (SRTP, EGD, Modbus, OPC-UA)
4
Generate zero operational disruptions - no turbine trips, no HMI impacts
✓ Zero disruptions across 30 days
5
Produce findings report within 5 business days of PoC completion
✓ Delivered Day 3 (this document)
3. Asset Discovery
247
Total Assets Discovered
27
Previously Unknown
48h
Time to 90% Discovery
4
Protocols Parsed
| Purdue Level | Asset Type | Known (Pre-PoC) | Discovered | Delta
| Level 1 | PLCs / Controllers (GE Mark VIe) | 36 | 40 | +4 undocumented I/O modules
| Level 2 | HMIs / SCADA Servers | 28 | 38 | +10 (incl. 2 legacy Windows XP HMIs, 8 operator terminals)
| Level 2 | Network Infrastructure | 62 | 72 | +10 unmanaged switches and access points
| Level 3 | Historians / Engineering Workstations | 52 | 54 | +2 vendor laptop connections
| Level 3 | IT/OT Boundary Devices | 42 | 43 | +1 undocumented jump server
| Total | 220 | 247 | +27 (12.3%)
4. Critical Findings
CRITICAL Undocumented Jump Server
Discovery identified an undocumented Windows Server 2016 host bridging the L3/L4 boundary with active RDP sessions. This device was not in the customer's asset inventory and had no associated ATO. Recommendation: immediate investigation and remediation.
HIGH Legacy Windows XP HMIs
Two Windows XP HMI workstations discovered on the L2 process network. These systems have no security patches since 2014 and were communicating with GE Mark VIe controllers via unencrypted SRTP. Recommendation: network segmentation controls + compensating monitoring.
HIGH Unexpected Cross-Zone Traffic
Dragos detected SMB file-sharing traffic traversing from the L4 enterprise zone directly to L2 process network HMIs. This traffic bypasses the industrial DMZ and indicates a segmentation gap. Recommendation: firewall rule audit + ACL hardening.
MEDIUM Vendor Laptop Connections
Two vendor laptop MAC addresses observed connecting to the L3 engineering workstation VLAN during maintenance windows. These connections were authorized but not logged by existing controls. Recommendation: implement secure remote access monitoring per SANS Critical Control #4.
5. Vulnerability Assessment
The platform identified 34 vulnerabilities across Bonneville OT assets, prioritized using Dragos' Now/Next/Never framework:
| Priority | Count | Example | Action
| NOW | 2 | CVE-2023-3595 - ControlLogix CIP RCE (CVSS 9.8). Identified during platform vulnerability database review for future deployment sites. Affects AB ControlLogix at John Day, not Bonneville GE controllers. Flagged here for pre-deployment remediation planning. | Coordinate patch with John Day site during next scheduled maintenance window, prior to sensor deployment
| NEXT | 8 | GE Mark VIe firmware versions with known auth bypass (GE advisory GES-2024-003) | Schedule firmware update with GE field service
| NEVER | 24 | Informational CVEs requiring physical access or specific configurations not present | Monitor - no action required
6. Integration Validation
| Integration | Status | Validation
| Splunk Cloud (Syslog/CEF over TLS) | ✓ Operational | Alert metadata flowing to Splunk within 30 seconds of detection. 127 events forwarded during PoC. SOC confirmed visibility in existing dashboards.
| CrowdStrike Falcon (REST API) | ✓ Operational | Bi-directional IOC exchange validated. 14 OT assets correlated with Falcon Discover for IoT endpoint data.
| Neighborhood Keeper | ✓ Enrolled | Anonymized telemetry flowing. Customer identifiers confirmed stripped per NK data handling policy.
7. Recommendations
| # | Recommendation | Priority | Timeline
| 1 | Proceed to full deployment - all success criteria met. Architecture validated at the most complex site. | IMMEDIATE | ARB Brief → Aug 2026
| 2 | Remediate undocumented jump server - investigate, ATO or decommission. | IMMEDIATE | Within 30 days
| 3 | Segment Windows XP HMIs - implement compensating controls until replacement. | HIGH | Within 60 days
| 4 | Close SMB cross-zone path - firewall rule audit, remove unnecessary L4→L2 traffic. | HIGH | Within 60 days
| 5 | Initiate TAP procurement for John Day and McNary - long lead time for change control. | MEDIUM | Begin immediately
| 6 | Begin full ATO package preparation - transition from IATT to production ATO. SA provides SSP contribution sections, POA&M, and PPSM registration data to ISSO for eMASS submission. | MEDIUM | Begin after ARB endorsement
Next Step: Present these findings to the NWD Architecture Review Board (August 2026) for endorsement of full 4-site deployment. The architecture document and Bill of Materials are ready for ARB review. Upon endorsement, transition the Bonneville IATT to a production ATO and begin IATT preparation for The Dalles, John Day, and McNary.
CUI // FOUO - Distribution Limited to Named Parties · PoC Findings Report v1.0 · DRG-FED-2026-0847