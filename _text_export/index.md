# Portfolio Index - Technical Readiness Document

Source: index.html

---

Aaron Kotz - Federal SA Technical Readiness
Technical Readiness Document
Federal Solution Architect
Work Product Exercises for Federal Pre-Sales
Aaron Kotz
Candidate - Federal Solution Architect
18-Year Career: USAF Active Duty, ANG Cyber Operations, DoD Contractor · Cybersecurity & Mission Systems Lead (1 of 13+ RPA Mission Sites) · TS/SCI Operations
TS/SCI Cleared
Prepared for Dragos, Inc. · Public Sector Team
May 2026
About This Portfolio
What this is: A set of sample work products I created to demonstrate how I would approach the Federal Solution Architect role at Dragos. The scenario, stakeholders, and engagement details are fictional exercises. No Dragos proprietary data was used.
What I actually bring: 18 years operating in and securing the exact types of classified, availability-critical environments that Dragos sells into. I currently serve as the Cybersecurity and Mission Systems Lead at one of 13+ RPA mission sites. I manage TS/SCI and Secret enclaves, enforce STIGs, run ACAS scans, maintain ATOs, and coordinate across a program with dual-tier firewalls, 14 protocol translators, and 20+ VMs. I have built this kind of infrastructure from nothing and understand what these customers need because I am one of them.
What I am ramping on: I am new to OT/ICS cybersecurity and the Dragos platform. My OT knowledge comes from self-study during interview preparation, not from field experience. The product details are based on publicly available Dragos documentation, webinars, and the 2025 Year in Review.
Why I built this: Nobody asked me to. Reading a resume tells you where I have been. This portfolio shows how I think, how I structure technical work, and how quickly I can ramp on a new domain. Section 6 maps my actual classified infrastructure directly to the Purdue Model to show how the experience transfers.
1. Executive Summary
This portfolio demonstrates my understanding of the Solution Architect pre-sales motion, the OT/ICS cybersecurity landscape, the Dragos product portfolio, and how I would execute a federal proof-of-concept engagement. Each page walks through a stage of the sales cycle with real work products, from discovery through architecture, demo, POC report, RFP response, and ARB brief. It complements my resume and gives the hiring team a clear view of my technical readiness for the Federal Solution Architect role.
My core value proposition: I've spent the majority of my 18-year career in classified DoD environments. I currently serve as the Cybersecurity and Mission Systems Lead at one of 13+ remotely piloted aircraft mission sites, managing TS/SCI and Secret enclaves, vulnerability programs, and STIG enforcement. I want to bring that operational perspective to the pre-sales role because I understand these customers' constraints, speak their language, and can map Dragos capabilities directly to problems I've encountered firsthand.
What I Bring From Day One
Federal Mission Credibility
Active TS/SCI clearance. Career arc from USAF avionics and COMSEC (2008), through ANG cyber operations (2013), to serving as the Cybersecurity and Mission Systems Lead at one of 13+ remotely piloted aircraft mission sites today. I run STIG enforcement, ACAS scanning, ATO compliance, and syslog collection across multiple enclaves.
Architecture That Maps to OT
My environment has four security zones, two hard DMZ boundaries, and isolated circuits. This is the same segmented, availability-first architecture Dragos deploys into for ICS customers, and it maps directly to the Purdue Model.
Technical Depth for Pre-Sales
Cisco and Juniper firewalls, OpenShift, VMware, SIEM deployment, vulnerability scanning, multi-VLAN networks, Linux CLI, Python scripting for automation and log analysis, real-time sensor data processing. I design deployment architectures across segmented, multi-enclave networks and can explain the rationale for each component placement.
Stakeholder Communication
I brief military leadership on risk posture, present my site's status in program-wide reviews covering all 13+ program sites, deliver technical training, and mentor ISSOs on compliance. Adjusting technical depth for the audience is part of the job.
How This Document is Organized
| Section | What It Demonstrates | Job Posting Alignment
| 2. SA Presales Motion | Understanding of the go-to-market motion and where the SA fits | "Engage in pre- and post-sales processes"
| 3. Industry Landscape | OT/ICS threat landscape awareness and regulatory drivers | "Familiarity with the ICS/OT discipline"
| 4. Dragos Platform | Product architecture, deployment model, and portfolio depth | "Conduct tailored product demonstrations"
| 5. POC Methodology | How I would execute a federal proof-of-concept | "Execute proof-of-concept deployments"
| 6. Architecture Bridge | Direct mapping of my environment to OT/ICS | "Strong foundation in networking and systems"
2. The SA Pre-Sales Motion
The Solution Architect owns the technical side of the sales cycle. While the Account Manager owns the relationship and pipeline, the SA owns technical credibility, from first conversation through deployment design. Here is how the 7-stage motion works and where my experience maps at each stage.
Stage 1
Get the Meeting
AM identifies the prospect (DOE, DHS, DoD). The SA prepares by researching the customer's infrastructure and compliance posture.
Stage 2
Earn Trust Early
The customer's technical team evaluates multiple vendor solutions. The SA earns trust by demonstrating real operational experience in their environment.
Stage 3
Listen to Their Pain
The SA diagnoses problems through discovery, asking the right questions about segmentation, visibility, logging, and compliance gaps.
Stage 4
Demo the Solution
Map Dragos capabilities to the specific pain points identified. Show the 3 features that solve their problem, not every feature in the platform.
Stage 5
Design the Deployment
Architect where sensors, SiteStore, and CentralStore fit in the customer's network. Address STIG, ATO, and cross-domain constraints.
Stage 6
Win the Deal
Support the AM with technical sections of the proposal, RFP/RFI responses, SOW development, and POC execution.
Stage 7
Expand & Renew
Post-deployment QBRs, platform health checks, adoption metrics, and expansion planning for additional sites or capabilities.
How My Experience Maps to Each Stage
| Stage | What the SA Does | My Direct Experience
| Earn Trust
| Prove you have operated in their world: classified networks, compliance pressure, real consequences
| TS/SCI cleared. I operate across JWICS, SIPRNet, and unclassified enclaves. I enforce STIGs, run ACAS scans, manage ATOs, and coordinate with site leads at the other 12+ RPA mission sites in the program.
| Listen
| Diagnose the real problem through the right discovery questions
| I built the network documentation for my environment from scratch (VLANs, firewall rules, data flows, VM inventories) because none of it existed. I understand what "no visibility" looks like in practice.
| Demo
| Map platform capabilities to the customer's specific pain, not a generic feature walk
| I present risk posture and architecture decisions to military leadership, deliver technical training to operators, and translate multi-tier firewall and SIEM configurations into executive-level recommendations.
| Design
| Architect where sensors, SiteStore, and CentralStore fit in the customer's segmented network
| I deployed a 20+ VM platform across dual-tier firewalls, load balancers, and 14 protocol translators, then integrated it with SIEM and vulnerability scanning. Same type of placement decision an SA makes in a segmented OT network.
| Win
| Support proposals, RFP responses, and POC execution through the federal procurement process
| I work under FAR-governed DoD contracts, have authored technical documentation for 10 IT programs, and coordinate multi-site deployments with federal stakeholders. I understand the procurement cadence, approval chains, and documentation requirements.
| Expand
| Post-deployment health checks, QBRs, usage adoption, and expansion planning
| I conduct quarterly program reviews across 13+ sites, track platform adoption metrics, identify capability gaps, and plan phased expansions. Same cadence an SA uses to drive renewals and upsell.
The Trust Advantage: "I've spent 18 years working in and around classified DoD environments. I currently serve as the Cybersecurity and Mission Systems Lead at one of 13+ RPA mission sites, running STIG enforcement, syslog collection, multi-vendor firewalls, and real-time sensor data across TS/SCI and Secret enclaves."
3. OT/ICS Industry & Threat Landscape
Understanding the OT/ICS threat landscape is core to the SA role and a primary focus of my ramp-up preparation. Federal customers are not buying cybersecurity products. They are defending national critical infrastructure against state-sponsored adversaries who have demonstrated both the capability and intent to disrupt physical processes. The following reflects my understanding of the landscape and how I would frame it during customer engagements.
The ICS Cyber Kill Chain
Stage 1 IT Network Compromise
Adversary gains initial access through the enterprise network: phishing, supply chain, VPN exploitation, internet-facing assets. Goal: establish foothold and move laterally toward the OT/ICS boundary. This stage mirrors traditional enterprise intrusions.
Stage 2 ICS Attack
Adversary crosses the IT/OT boundary and develops the capability to interact with, disrupt, or destroy the physical process. This requires ICS-specific knowledge: control logic, process dynamics, and safety systems. This is where OT-native detection matters.
Key OT Threat Groups (Dragos-Tracked)
| Group | Target Sectors | Capability | Significance
| CHERNOVITE
| Electric, Oil & Gas, Water
| Stage 2 ICS
| Developed PIPEDREAM/INCONTROLLER, the first cross-industry ICS attack framework targeting safety controllers. Capable of manipulating Schneider, Omron PLCs and OPC UA servers. Sales bridge: This is the example to use with any customer running PLCs from multiple vendors. PIPEDREAM is vendor-agnostic by design, and that changes the risk conversation.
| VOLTZITE
| Electric, Telecom, Defense Industrial Base
| Stage 2 ICS
| PRC-linked group elevated to Stage 2 in 2025. Conducting sustained reconnaissance and pre-positioning in US electric utilities. Manipulates engineering workstation software to extract configuration files. Overlaps CISA-tracked Volt Typhoon (AA24-038A). Sales bridge: When a customer claims they have no OT threat exposure, VOLTZITE is proof that state actors are already inside US critical infrastructure, pre-positioning for future disruption.
| ELECTRUM
| Electric, Energy
| Stage 2 ICS
| Connected to INDUSTROYER/CRASHOVERRIDE, the malware that disrupted Ukraine's power grid in 2016 and 2022. Demonstrated capability to manipulate protection relays and trip breakers to cause physical outages. Sales bridge: ELECTRUM is the proof-of-impact reference. ICS-specific malware caused real-world blackouts. For any energy customer evaluating OT cyber risk, this is the case study that removes ambiguity.
| BENTONITE
| Oil & Gas, Electric
| Stage 1
| Demonstrated pivot from IT to OT networks. Exploiting internet-facing ICS assets. Linked to Middle East tensions. Sales bridge: This group illustrates why IT-only security is insufficient. They start in the enterprise network and cross the boundary into OT.
2025-2026 Landscape Trends
Ecosystem-Based Targeting
Adversaries no longer target single facilities. They map entire ecosystems (supply chains, shared protocols, common vendors) to develop scalable attack capabilities that work across sectors.
Edge Device Exploitation
Routers, firewalls, and VPN concentrators at OT network boundaries are increasingly targeted. CISA BOD 26-02 mandates federal agencies inventory and replace end-of-support edge devices. Note: BOD 26-02 explicitly exempts OT devices from scope, which creates a gap. OT edge devices may not get the same lifecycle management attention, making Dragos monitoring at those boundaries even more critical.
Ransomware Impact on OT
Dragos tracked 60%+ increase in ransomware incidents impacting industrial organizations in 2024. Even when ransomware does not reach OT systems directly, it forces operational shutdowns.
Federal Regulatory Acceleration
NIST SP 800-82r3, CISA CI Fortify initiative, NSA/CISA OT asset inventory guidance, and new CIRCIA reporting requirements are driving federal OT security investment.
SANS 5 Critical Controls for ICS → Dragos Alignment
| SANS Control | Purpose | Dragos Capability
| 1. ICS Incident Response
| Plan and practice OT-specific IR
| Dragos Services: IR retainer, tabletop exercises, Architecture Assessment. Differentiator: Dragos has the largest dedicated OT IR team in the industry. Competitors rely on general-purpose IR resources without ICS process knowledge.
| 2. Defensible Architecture
| Segmentation, monitoring points, visibility
| Platform: network segmentation validation, traffic analysis across zones. Differentiator: Dragos validates actual traffic flows against intended architecture, showing where segmentation policy is violated, not just where firewalls exist.
| 3. ICS Network Monitoring
| Continuous visibility into OT traffic
| Platform sensors: passive monitoring, protocol-aware parsing, behavioral analytics. Differentiator: Dragos parses Modbus function codes, register addresses, and write values, not just "TCP traffic on port 502." The distinction is between a generic network anomaly and identifying that a specific PLC setpoint was changed.
| 4. Secure Remote Access
| Control and audit remote connections to OT
| Platform: remote access detection, anomalous connection alerting. Differentiator: Detects unauthorized remote sessions at the protocol level, not just VPN logins, but actual engineering workstation connections to controllers.
| 5. Risk-Based Vulnerability Mgmt
| Prioritize vulns by OT impact, not CVSS alone
| Platform: Now/Next/Never prioritization with threat intelligence context. Differentiator: Prioritization is informed by the largest dedicated OT intel team (20+ tracked groups). Claroty and Nozomi use generic CVSS; Dragos maps vulnerabilities to the threat groups that actively exploit them.
4. Dragos Platform & Portfolio
Dragos offers a purpose-built OT cybersecurity platform, not a re-skinned IT SIEM or bolted-on module. The following covers the deployment architecture, the four core pillars, and the full portfolio as I would position it during customer engagements.
Deployment Architecture
Dragos Platform: 3-Tier Deployment Architecture
Based on Dragos Platform deployment documentation · dragos.com
Sensors
Passive Network Sensors
Deployed via SPAN / TAP
Zero active scanning
SiteStore
Site-Level Analysis
& Storage
(1 per facility)
CentralStore
Enterprise Dashboard
& Cross-Site Correlation
(HQ / SOC)
Four Pillars
Asset Visibility
Passive discovery of all OT assets: make, model, firmware, comms patterns
Vulnerability Mgmt
Now / Next / Never prioritization with threat intel context
Threat Detection
Behavioral analytics + signatures for OT protocols and process commands
Investigation & Response
PCAP replay, protocol-aware forensics, timeline reconstruction
Figure 1: Dragos Platform 3-tier deployment. Passive sensors feed SiteStore for site-level analysis, aggregated by CentralStore for enterprise visibility.
Sensors
Deployed passively via SPAN/TAP at OT network monitoring points. No active scanning, which is critical for environments where a scan can crash a PLC. Parse 600+ industrial protocols including Modbus, DNP3, OPC-UA, IEC 61850, and Ethernet/IP.
SiteStore
Site-level analysis and storage appliance (physical or VM). Aggregates sensor data, runs detections, manages asset inventory for a single site. Runs on hardened Linux and is available as a DISA STIG-compliant Platform 2.x appliance.
CentralStore
Enterprise-wide correlation and dashboard. Aggregates data from multiple SiteStores for multi-site visibility. Enables centralized asset management, vulnerability tracking, and cross-site threat detection.
Federal Deployment Notes
DISA STIG available (Platform 2.x, multiple releases on public.cyber.mil). Supports air-gapped deployments. Integrates with existing SIEM via syslog forwarding. Compatible with VMware, Hyper-V, and AWS GovCloud. ATO documentation support available.
Dragos Platform Deployment: Purdue Model Reference
The following shows how Dragos components map to the Purdue Model zones in a typical federal OT network:
Federal OT Network: Dragos Sensor Deployment
Based on ISA-99 / IEC 62443 Purdue Reference Architecture
LEVEL 5 · ENTERPRISE
Email / DNS
Active Directory
SIEM / Splunk
⬢ Dragos CentralStore
Enterprise Dashboard · Cross-Site Correlation
▲ Encrypted Metadata
LEVEL 4 · BUSINESS
ERP
LEVEL 3.5 · INDUSTRIAL DMZ
Firewall
Jump Server / VPN
Data Diode
LEVEL 3 · SITE OPERATIONS
Historian
Eng. Workstation
Patch Server
◉ Sensor (SPAN)
⬢ Dragos SiteStore
Analysis · Detection · Asset Inventory
LEVEL 2 · SUPERVISORY CONTROL
SCADA Server
HMI #1
HMI #2
◉ Sensor (TAP)
LEVEL 1 · BASIC CONTROL
PLC #1
PLC #2
RTU
DCS Controller
SIS
LEVEL 0 · PHYSICAL PROCESS
Valves · Pumps · Motors · Actuators · Sensors · Transmitters
Dragos Sensor (passive)
Dragos Platform Component
Metadata Flow
DMZ Boundary
Figure 2: Reference deployment mapping. Passive sensors at L2 and L3 monitoring points, SiteStore at site operations, syslog forwarding to enterprise SIEM.
The Four Pillars
| Pillar | What It Does | Federal Value
| Asset Visibility
| Passive discovery of all OT assets: make, model, firmware, communication patterns. No scanning required.
| Addresses CISA BOD 23-01 (asset inventory mandate). Replaces manual spreadsheet tracking with automated, continuous discovery.
| Vulnerability Management
| OT-specific vulnerability identification with "Now / Next / Never" prioritization based on threat intelligence context.
| Complements ACAS/Tenable for OT assets that cannot be actively scanned. Maps vulnerabilities to Dragos-tracked threat groups for risk-based prioritization.
| Threat Detection
| Behavioral analytics and signature-based detection for OT protocols. Detects abnormal process commands, not just network anomalies.
| Goes beyond IT SIEM alerting. Detects "firmware update to PLC" not just "port scan detected." Integrates Dragos threat intelligence.
| Investigation & Response
| Forensic tools for OT incident investigation. PCAP replay, protocol-aware search, timeline reconstruction.
| Enables OT-specific incident response without disrupting physical processes. Supports CIRCIA reporting requirements.
Full Portfolio
| Offering | Description | SA Relevance
| Platform | Core OT visibility, detection, and response | Primary product in every engagement
| WorldView | OT threat intelligence subscription. Tracks 20+ threat groups, vulnerability advisories, and strategic reports | Differentiator vs. Claroty/Nozomi: Dragos has the largest dedicated OT intel team
| OT Watch | Managed detection service. Dragos analysts monitor customer environments 24/7 | For customers without OT SOC capability (most federal agencies)
| Neighborhood Keeper | Community defense program for anonymized threat data sharing across participants. NSA/CISA are trusted advisors. | Unique federal value: collective defense for critical infrastructure sectors
| Professional Services | Architecture assessment, penetration testing, tabletop exercises, incident response retainer | Supports SANS Control 1 (ICS IR) and NIST CSF assessment requirements
| Dragos Public Sector LLC | Subsidiary launched Oct 2024, dedicated to federal and SLTT customers. SAM registered, Carahsoft contract vehicles. | Procurement pathway: NASA SEWP V (extended through Sep 30, 2026; option periods to Apr 2027. SEWP VI not yet awarded due to active GAO protests), Carahsoft as channel partner
5. Proof-of-Concept Methodology
A successful federal POC validates platform performance within the customer's environment, protocols, and security constraints. The following outlines how I would structure a Dragos POC for a federal customer.
Federal POC Methodology: 5 Phases / ~7 Weeks
Adapted from Dragos pre-sales engagement methodology
Phase 1
Pre-POC Discovery
Week 0
Scope · Success criteria · Architecture review
Phase 2
Environment Prep
Week 1-2
SPAN/TAP · SiteStore deploy · ATO artifacts
Phase 3
Deploy & Baseline
Week 2-3
72hr baseline · Asset discovery · Protocol parsing
Phase 4
Evaluation
Week 3-6
Monitoring · Vuln analysis · Detection demos · SIEM integration
Phase 5
Executive Readout
Week 7
Findings brief · Architecture proposal · ROI · Transition plan
Figure 3: Federal POC methodology. Five phases over approximately 7 weeks, adapted for ATO and classification constraints.
Phase Details
| Phase | Duration | Activities | Deliverables
| 1. Pre-POC Discovery
| Week 0
|
• Architecture review: network diagrams, segmentation, data flows
• Identify "crown jewel" assets and determine what can't go down
• Define success criteria with customer (what does "pass" look like?)
• Assess classification/ATO constraints for sensor placement
| POC scope document, success criteria matrix, preliminary deployment design
| 2. Environment Prep
| Week 1-2
|
• Configure SPAN/TAP access at identified monitoring points
• Deploy SiteStore (VM or appliance) per STIG requirements
• Firewall rules for sensor → SiteStore communication
• Coordinate IATT (Interim Authority to Test) package with ISSO for eMASS submission
• Submit FIPS 199 system categorization for ISSO concurrence
• Coordinate site access (PIV/CAC or government escort) for deployment personnel
• Validate no active scanning occurs (passive only)
| Deployed infrastructure, connectivity validation, IATT package, FIPS 199 categorization
| 3. Deploy & Baseline
| Week 2-3
|
• Activate sensors and begin passive discovery
• 72-hour baseline collection: learn normal traffic patterns
• Initial asset inventory review with customer
• Verify protocol parsing (Modbus, DNP3, OPC-UA, etc.)
| Initial asset inventory, baseline traffic profile, protocol coverage report
| 4. Evaluation
| Week 3-6
|
• Ongoing monitoring against success criteria
• Weekly check-in calls with customer technical team
• Vulnerability analysis with Now/Next/Never prioritization
• Threat detection demonstrations (simulated or historical)
• Network segmentation validation: expected vs. actual traffic
• SIEM integration testing (syslog forwarding)
| Weekly status reports, vulnerability findings, detection examples, integration validation
| 5. Executive Readout
| Week 7
|
• Compile findings into executive summary
• Present to decision-makers: CISO, mission owner, contracting
• Architecture proposal for full deployment
• ROI analysis: manual process cost vs. platform automation
• Transition plan: POC → production (licensing, support, training)
| Executive summary, findings brief, deployment architecture proposal, commercial proposal
Why My Background Matters for POC Execution: I manage platform deployments, firewall rule coordination, ATO documentation, ISSO approvals, and STIG enforcement across classified enclaves every day. Federal POC timelines are governed by process as much as technology - coordinating network changes through ISSOs, aligning with contracting timelines, and navigating classification constraints. That process navigation is my current job.
Federal-Specific POC Considerations
IATT / Authorization Path
Federal PoC deployments require an Interim Authority to Test (IATT) before sensors touch the network. The SA prepares the IATT package (STIG checklist, network diagrams, data flow documentation, ports/protocols matrix) and coordinates eMASS submission with the customer's ISSO. Dragos Platform 2.x STIG on public.cyber.mil accelerates this process. I would begin IATT coordination during Phase 1 to avoid deployment delays.
FIPS 199 / System Categorization
RMF Step 1 requires FIPS 199 categorization before control selection can begin. For OT monitoring at safety-critical infrastructure, I would recommend Moderate-Moderate-High (availability drives the HIGH baseline). Getting ISSO concurrence on categorization early prevents control selection surprises later in the authorization process.
Site Access / PIV/CAC
Federal facilities require PIV/CAC for unescorted access or government escort for each site visit. Access requests typically require 14 days advance notice through the site's Physical Security Office. The SA coordinates access logistics during Phase 2 to prevent deployment schedule slips. My current role at restricted military installations means I navigate these processes daily.
Supply Chain / Section 889
The contracting officer requires Section 889 (NDAA FY2019) compliance certification before award. All Dragos hardware (Dell/HPE platforms) is 889-compliant with documented supply chain provenance. The SA proactively provides the compliance letter to the CO during the procurement phase, not waiting to be asked. This demonstrates procurement maturity and avoids delays.
Classification Constraints
Classified environments restrict data export, remote access, and vendor support models. POC design must account for air-gapped operation, secure media transfer for content updates, and on-site-only support. My current environment operates under the same restrictions across TS/SCI and Secret enclaves.
Multi-Stakeholder Alignment
Federal POCs involve CISO, mission owners, network engineers, ISSOs, contracting officers, and sometimes the Authorizing Official's designated representative (AODR). The SA manages the technical track while the AM manages the commercial track. My current role requires identical coordination across all of these at the site and program level.
6. Architecture Bridge
This section maps my operational environment to the Purdue Model architecture that Dragos deploys into. The zone labels differ, but the architecture, segmentation philosophy, and operational stakes run parallel.
Zone mapping based on ISA-99 / IEC 62443 Purdue Reference Architecture
My Architecture (RPA-SOC)
Purdue Model (ICS/OT)
Enterprise / NIPR
Level 5
Enterprise Network
Level 5
Enterprise Services
Level 4
Business Planning
Level 4
DMZ #2 - Firewall / Router Boundary
Enterprise DMZ
Level 3.5
Collateral Network
SIEM · ACAS · Mission VMs
Site Operations
Level 3 · HMIs · Historians
DMZ #1 - MISP VNI Boundary
Dual firewalls · 14 protocol translators
Industrial DMZ
Level 3.5
GCS / C2 / SPDN Networks
Level 2 · Isolated control circuits
Supervisory Control
Level 2 · SCADA / DCS
Aircraft / Physical Platform
Level 0-1 · Encrypted fiber · Real-time control
Basic Control / Physical Process
Level 0-1 · PLCs · Sensors · Actuators
Figure 4: Side-by-side mapping. Same zones, same segmentation philosophy, same stakes.
Zone-by-Zone Mapping
| My Environment | Purdue Equivalent | Why It Matters to Dragos
| Aircraft / Physical Platform - encrypted fiber, real-time control
| Level 0-1: Physical Process / Basic Control
| Logically isolated on dedicated encrypted fiber. No external network access permitted. Same isolation model as SIS/PLC networks in industrial environments.
| GCS with C2 & SPDN circuits - isolated control networks
| Level 2: Supervisory Control
| Where process control happens. Separate circuits for separate functions. Same as DCS/SCADA control networks.
| MISP VNI Boundary - dual firewalls, 14 protocol translators, load balancer
| Level 3.5: Industrial DMZ
| This is the boundary Dragos monitors. Controlled bidirectional traffic, protocol translation, data inspection.
| Collateral Network - SIEM, ACAS, mission VMs, CAVOK
| Level 3: Site Operations
| Where humans view data and make decisions. SCADA servers, HMIs, analysis workstations.
| Second Firewall Boundary → Enterprise
| Level 3.5-4: Enterprise DMZ
| The second hard boundary between operations and business networks. Two DMZs, not one.
Architectural Parallels
Availability-First Operations
My systems support 24/7 national defense operations. Unplanned downtime has operational consequences beyond IT, just like electric grid, water treatment, and manufacturing OT environments.
No-Scan Environments
Active scanning can disrupt my mission systems just as it can crash a PLC. I manage vulnerability assessment through passive observation, careful testing windows, and compensating controls.
Segmented by Design
Four zones, two hard DMZ boundaries, physically isolated circuits. Data flows are controlled, inspected, and logged at each boundary. Physical and logical isolation with controlled data paths between zones.
Real-Time Sensor Data
I process real-time video, telemetry, and sensor data with hard latency requirements and zero tolerance for outages. That parallels the process control telemetry in OT: live data flowing between PLCs, RTUs, and SCADA servers that Dragos sensors passively monitor.
Domain Transition Track Record
Beyond the architecture mapping, I have made this type of domain transition before and delivered results each time.
The Pattern: Learn the system architecture, map existing cybersecurity fundamentals to the new domain, and deliver while ramping on protocol-level specifics.
| Transition | What I Walked Into | What I Delivered
| Avionics &rarr; Municipal Cybersecurity
(City of La Marque, TX)
| Zero municipal IT experience. Hired to manage city infrastructure and inherited an environment with no segmentation, no centralized security, and an active ransomware threat. I was there for six months.
| &bull; Stood up the city's cybersecurity program with no existing baseline
&bull; Designed network segmentation with unified security gateways at each city site
&bull; Deployed LAN encryption hardware for all wireless traffic
&bull; Built hot/cold storage backup schema that recovered the wastewater treatment department's data after a ransomware attack hit before full security implementation was complete
&bull; Prevented phishing attacks targeting the finance department
&bull; Isolated the wastewater treatment SCADA system after the incident, using the same network isolation approach applied in OT environments
| 13 Years at the RPA Mission
(2013 - Present)
| Joined the TX ANG RPA SOC unit in 2013 straight from active duty avionics and never left. Progressed through every status the Guard offers: traditional guardsman, full-time Title 10, GS-11 dual-status technician, then transitioned to contractor (Cape Fox 2019, Tenax 2024). Promoted to site lead at the Tenax contract transition.
| &bull; Own security posture for the entire site across TS/SCI and Secret enclaves
&bull; Built the network documentation from scratch (VLANs, firewall rules, data flows, VM inventories) because none existed
&bull; Deploy and manage a 20+ VM platform across dual-tier firewalls with 14 protocol translators
&bull; Manage STIG enforcement, ACAS vulnerability scanning, and ATO compliance
&bull; Authored 10 IT management program books for the site
&bull; Mentor the site ISSO and coordinate with leads at the other 12+ program sites
Each transition followed the same pattern: understand the architecture, map existing cybersecurity knowledge to the new domain, and deliver while ramping on the specifics.
"I don't operate PLCs, but I operate a four-zone architecture with two hard firewall boundaries, isolated circuits, protocol translation, and controlled data flows. Aircraft control runs on dedicated encrypted fiber, logically isolated from everything else. Mission processing networks are behind boundary protection. The collateral operations zone runs our SIEM and vulnerability scanning. Then another firewall boundary separates all of that from enterprise. That maps directly to the Purdue Model. The protocols differ, but the architecture, the segmentation philosophy, and the stakes are the same."
This document was prepared using publicly available information from dragos.com, NIST, CISA, and SANS Institute publications.
All architecture references use sanitized, unclassified concepts consistent with OPSEC best practices.
No classified or proprietary information is contained in this document.
Dragos, WorldView, OT Watch, Neighborhood Keeper, SiteStore, and CentralStore are trademarks of Dragos, Inc.
Aaron Kotz &middot; May 2026 &middot; Prepared for Dragos, Inc. Public Sector Team