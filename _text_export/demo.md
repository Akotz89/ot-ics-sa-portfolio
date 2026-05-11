# Tailored Demo Agenda and Script

Source: demo.html

---

Demo Agenda - USACE Columbia River Hydropower
Dragos, Inc. - Public Sector
Tailored Demo Agenda
U.S. Army Corps of Engineers - Northwestern Division
Dragos Platform Demonstration for Columbia River Hydropower Team
Prepared ByAaron Kotz, Solutions Architect (Federal) [Exercise Role]
Demo DateJune 9, 2026 · 1300-1400 ET
FormatMicrosoft Teams (screen share from Dragos demo lab)
AudienceDr. Torres (Champion), Mike Osterman (OT Eng), Brian Knox (GS-12)
Demo EnvironmentDragos Demo Lab - configured for GE Mark VIe / SRTP / EGD
Version1.0
EXERCISE - Not a real engagement
1. Demo Strategy
This demo follows the 3-Feature Rule: show only the capabilities that solve USACE NWD's specific pain points identified during discovery. No generic feature walks.
Demo thesis: "You have 70 turbine controllers across 4 dams with zero network visibility. Today I'll show you how Dragos discovers every asset, parses your exact protocols, and gives you the vulnerability context your team needs - all without touching a single controller."
Pre-Demo Preparation Checklist
Demo environment configured with GE SRTP, EGD, Modbus TCP, and OPC-UA traffic captures
Asset inventory pre-loaded with hydropower-relevant equipment (turbine controllers, excitation systems, governor controls)
VOLTZITE threat intelligence page bookmarked for live pivot during threat context discussion
Now/Next/Never vulnerability view pre-filtered to show GE Mark VIe and Emerson Ovation advisories
Splunk integration mock dashboard ready (syslog/CEF forwarding visualization)
Backup screenshots prepared in case of network latency during live demo
Screen recording of full demo flow saved locally in case of lab connectivity failure
2. 60-Minute Agenda
0:00-0:05
Opening - The Trust Bridge
Introduce yourself with the trust bridge. Do not read this verbatim; deliver it in your own words:
"Before we jump into the platform, quick background on me. I've spent my whole career in DoD mission systems. Started on F-16 avionics in the Air Force, moved into cyber operations with the Air National Guard, and for the last several years I've been the Cybersecurity and Mission Systems Lead at one of the RPA sites in the program. I run a site with 4 security zones, 2 hard DMZ boundaries, TS/SCI and Secret enclaves, STIG enforcement, ACAS scans, the whole compliance stack. So when I show you this platform, I'm looking at it from the perspective of someone who's been on your side of the table - managing the infrastructure that actually has to stay running."
Transition: "Let me show you what this platform actually does for a hydropower environment like yours."
0:05-0:20
Pillar 1: Asset Visibility - "What's actually on your network?"
Live demo actions:
• Open Asset Inventory → filter by "Turbine Controller" → show GE Mark VIe units auto-discovered
• Highlight firmware versions, communication patterns, and last-seen timestamps
• Show a communication map - "See this connection? That's an engineering workstation talking directly to a controller, bypassing your historian. Was that authorized?"
• Show asset detail: make, model, firmware version, all protocols observed
Pain point addressed: "You told us you have a spreadsheet with 220 assets. In 48 hours, we found 247 - including 27 you didn't know about."
0:20-0:35
Pillar 2: Threat Detection - "Your protocols, your threat landscape"
Live demo actions:
• Show GE SRTP parsing - deep packet inspection showing controller register reads/writes
• Trigger a detection rule: "Unauthorized firmware download to Mark VIe controller"
• Pivot to VOLTZITE threat page in WorldView - "This is the group that's pre-positioning in electric utilities right now. Here's what they're looking for."
• Show behavioral baseline: "The platform learned what normal looks like in 72 hours. Now it alerts on deviations."
Pain point addressed: "Your existing SIEM sees port scans. Dragos sees 'someone just tried to download firmware to turbine controller #7.'"
0:35-0:45
Pillar 3: Vulnerability Management - "Not CVSS. Actual OT risk."
Live demo actions:
• Open Vulnerability dashboard → show Now/Next/Never prioritization
• Highlight a "Now" vulnerability: CVE-2023-3595 (ControlLogix) → "This affects your John Day site. Here's why it's 'Now' and not just another CVSS 9.8."
• Contrast with a "Never" vulnerability → "This CVE requires physical access to the controller backplane. In your environment, that means getting past card readers and armed guards. It's never."
• Show WorldView advisory enrichment - Dragos intelligence context on each CVE
Pain point addressed: "ACAS gives you 10,000 findings. Dragos gives you 2 that matter right now and tells you why the other 32 can wait."
0:45-0:55
Integration + Enterprise Value
Live demo actions:
• Show Syslog/CEF integration → "OT alerts appear in your existing Splunk dashboards. No new SOC tool to learn."
• Show CrowdStrike integration → "IOCs flow both ways. Your SOC gets OT context without needing OT expertise."
• Mention Neighborhood Keeper → "When another utility in the Columbia Basin sees an attack, you'll know about it before the advisory drops."
Pain point addressed: "This isn't another siloed tool. It feeds your existing stack."
0:55-1:00
Close - Next Steps
Propose the PoC: "We've shown you the platform on lab data. The next step is proving it on your network. We'd deploy 2 sensors at Bonneville via SPAN - zero active scanning, zero operational impact. In 72 hours, you'll have a real asset inventory. In 7 weeks, you'll have a findings report. Shall we discuss the PoC scope?"
3. Persona-Specific Talk Tracks
Dr. Rebecca Torres - Chief, Cybersecurity Division (Champion)
Priorities: Compliance reporting, executive visibility, program justification
Key message: "The platform generates the compliance evidence you need for EP 1130-2-510 and the DoD CIO directive - automatically, continuously. No more spreadsheets, no more manual audits. You'll have real-time dashboards you can show USACE HQ."
Mike Osterman - SCADA Program Manager (Skeptic)
Priorities: No operational disruption, no IT tools on OT networks, hands-on proof
Key message: "Mike, this is passive only. SPAN port mirroring - we're reading a copy of your traffic. We never inject packets, we never scan, we never touch your controllers. The platform was built by people who've operated these environments. Let me show you the protocol parsing for your exact GE SRTP traffic."
Brian Knox - GS-12 Network Analyst (Hands-On Evaluator)
Priorities: Practical operation, day-to-day usability, integration with his toolset
Key message: "Brian, let me show you the investigation workflow. You get an alert - click through to the PCAP, see exactly which controller register was accessed, replay the traffic, build your timeline. It integrates with your Splunk instance via syslog - you'll see OT alerts right next to your IT alerts."
4. Objection Handling
"We can't put anything new on the OT network."
The sensors are passive only - SPAN port mirroring. Zero injection, zero active scanning. The sensor receives a copy of traffic; it has no path to send data to your controllers. It's architecturally identical to the SIEM you already have on the IT side.
"Our SIEM already monitors the network."
Your SIEM sees IP addresses and ports. Dragos sees "write multiple registers to PLC address 40001." IT tools can't parse SRTP or EGD - that's not a criticism, it's a design reality. Dragos complements your SIEM; it doesn't replace it.
"How long does the ATO process take?"
Dragos Platform 2.x has a published DISA STIG. That means your ISSO has a pre-built assessment baseline, not a blank spreadsheet. For a PoC, we request an IATT (Interim Authority to Test), which typically clears in 2-3 weeks when you have a published STIG to reference. From my own experience managing ATO compliance at my site: the STIG is the single biggest accelerator. Without one, you're writing custom control implementations from scratch. With one, your ISSO can import the benchmark results directly into eMASS.
"Why not Claroty or Nozomi?"
Three differentiators worth knowing:
1. Threat intelligence is built in-house, not bought. Dragos tracks 20+ named OT threat groups with their own analysts. Claroty and Nozomi license third-party feeds. Concrete example: Dragos discovered PIPEDREAM/INCONTROLLER (the first cross-industry ICS attack framework) before it was deployed. That came from Dragos intel, not a feed.
2. Federal-specific commitment. Dragos launched a dedicated Public Sector subsidiary (Oct 2024), has a published DISA STIG, and NSA/CISA participate as trusted advisors in Neighborhood Keeper. Neither Claroty nor Nozomi has a government collective defense program at that level.
3. Neighborhood Keeper has no competitor equivalent. It is an opt-in, anonymized threat telemetry sharing network across Dragos customers. CISA and NSA can push threat indicators to all participants simultaneously. No other OT vendor offers collective defense at this scale.
"What about supply chain compliance?"
All Dragos hardware is built on Dell/HPE server platforms with documented provenance. We're Section 889 compliant across the entire bill of materials, including Gigamon TAPs and Cisco switches. I can provide a supply chain compliance letter for your contracting officer when we get to the procurement phase.
"How does this fit our existing authorization boundary?"
We recommend the Dragos Platform be categorized as a separate authorization boundary at Moderate-Moderate-High under FIPS 199. The passive-only architecture means we don't affect your existing OT system's authorization boundary. I'll provide the SSP contribution sections and SIA documentation proactively so your ISSO can start the eMASS package early.
EXERCISE - Not a real engagement · Demo Agenda v1.0 · DRG-FED-2026-0847