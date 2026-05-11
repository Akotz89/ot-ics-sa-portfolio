# Competitive Battle Cards  -  Dragos vs. Field

> For SA interview prep and customer objection handling.  
> Last updated: 2026-05-10

---

## 🆚 Dragos vs. Claroty

### Claroty Strengths (Acknowledge These)
- **Broadest asset coverage scope**  -  covers OT, IoT, IIoT, BMS, and medical devices (Medigate acquisition) under their "xDome" platform
- **Enterprise-friendly workflows**  -  designed to bridge IT SOC and OT engineering teams
- **Strong secure remote access** (SRA) product  -  dedicated jump server alternative
- **Gartner/Forrester visibility**  -  frequently positioned well in analyst reports for breadth

### Claroty Weaknesses (Your Ammunition)
| Area | Claroty Limitation | Dragos Advantage |
|------|-------------------|------------------|
| **Threat Intelligence** | Relies on Team82 research team  -  smaller, focused on vulnerability disclosure, not threat group tracking | Dragos has the **largest dedicated OT threat intel team** in the industry. Tracks 20+ named ICS threat groups (VOLTZITE, CHERNOVITE, ELECTRUM). WorldView provides group-level TTPs, not just CVEs |
| **Incident Response** | No dedicated OT IR capability; partners with third parties | Dragos has a **dedicated OT Professional Services team** for IR, threat hunting, architecture assessments. Former NSA/DoD/IC practitioners |
| **Protocol Depth** | Broad protocol support but "wide and shallow"  -  prioritizes asset enumeration over deep protocol parsing | Dragos has **deep protocol parsing** for ICS-specific protocols (GE SRTP, EGD, S7comm, EtherNet/IP CIP, DNP3, GOOSE/MMS). Can extract firmware versions, configuration states, and command sequences |
| **Managed Detection** | No equivalent to OT Watch; customers must build their own OT SOC or use generic MSSP | **OT Watch** is a dedicated managed detection service staffed by OT security analysts  -  addresses the federal staffing gap directly |
| **Federal Presence** | Growing but less mature federal practice; no published DISA STIG | Dragos has **published DISA STIG on public.cyber.mil**, completed ATO at 13+ federal sites, and has dedicated Federal team with clearances |

### The Positioning Line
> "Claroty is a strong platform when the customer's primary need is broad IoT/OT asset visibility across a converged enterprise environment. Where Dragos differentiates is in **threat-intelligence-driven defense for high-consequence environments**. We track the adversaries, not just the assets. For a power generation facility like USACE where the threat is a nation-state actor, you need threat group tracking, deep protocol parsing, and IR capability  -  that's our core."

---

## 🆚 Dragos vs. Nozomi Networks

### Nozomi Strengths (Acknowledge These)
- **Ease of deployment and UI**  -  frequently praised by users for intuitive interface
- **AI/ML anomaly detection**  -  strong behavioral analytics and "Smart Polling" for active queries
- **Scalability**  -  Guardian/Vantage architecture scales well for large distributed environments
- **Flexible licensing**  -  simpler pricing model, sometimes undercuts on per-asset pricing

### Nozomi Weaknesses (Your Ammunition)
| Area | Nozomi Limitation | Dragos Advantage |
|------|-------------------|------------------|
| **Threat Intelligence** | Smaller OT-specific intel team; relies more on anomaly detection and open-source feeds | Dragos **WorldView** provides curated, human-analyzed OT threat intelligence with named threat group tracking, campaign advisories, and IOC feeds |
| **Managed Detection** | No equivalent to OT Watch; limited professional services | **OT Watch** + **Professional Services** (architecture assessments, tabletop exercises, IR retainers) |
| **Detection Philosophy** | Heavy reliance on ML anomaly detection → higher false positive rates in noisy OT environments | Dragos uses **signature + behavior + threat-intel-driven** detection  -  lower false positive rate because detections are mapped to known adversary TTPs, not just statistical anomalies |
| **Federal Track Record** | Smaller federal installed base; no published STIG | Dragos has **13+ federal ATOs**, published STIG, and a dedicated Government team |
| **Community Defense** | No equivalent to Neighborhood Keeper | **Neighborhood Keeper** provides anonymized cross-sector collective defense with NSA/CISA participation |
| **Active Scanning Risk** | Smart Polling sends queries to OT devices  -  some customers have concerns about active queries touching safety-critical systems | Dragos sensors are **passive-only by default**  -  zero risk of disrupting OT operations. Active features are optional and operator-controlled |

### The Positioning Line
> "Nozomi is a solid platform  -  great UI, easy to deploy, good anomaly detection. The question is: when the anomaly fires, what does your team do next? Nozomi gives you the alert. Dragos gives you the alert **plus** threat group context (who's doing this, what's their playbook, what's the next step), plus managed detection through OT Watch, plus a phone number to call for OT incident response. For critical infrastructure operators, the response capability is the differentiation."

---

## 🆚 Dragos vs. Microsoft Defender for IoT (D4IoT)

### Microsoft Strengths (Acknowledge These)
- **E5 bundle pricing**  -  often "free" for agencies already on M365 E5, massively undercuts on cost
- **Native Microsoft ecosystem integration**  -  Sentinel, Defender XDR, Azure Arc, Entra ID
- **Azure Government**  -  DoD IL4/IL5 provisional authorization already in place
- **Global scale**  -  massive R&D investment, continuous feature releases

### Microsoft Weaknesses (Your Ammunition)
| Area | Microsoft D4IoT Limitation | Dragos Advantage |
|------|---------------------------|------------------|
| **OT Protocol Depth** | Supports common protocols but "broad and generic"  -  limited depth on proprietary ICS protocols | Dragos has **deep parsing for 100+ industrial protocols** including niche/proprietary ones (GE SRTP/EGD, Emerson Ovation, S7comm variants) |
| **OT-Specific Threat Intel** | Section 52 (Israel-based team) provides some OT research, but threat intel is primarily IT-focused | **WorldView** is exclusively OT-focused. Tracks 20+ ICS threat groups with sector-specific advisories |
| **Alert Tuning** | Users report "significant ongoing tuning required" to reduce noise (Gartner Peer Insights) | Dragos detections are purpose-built for OT environments  -  lower noise because they're based on OT behavioral baselines, not IT-derived ML models |
| **Professional Services** | No dedicated OT IR or assessment capability; relies on partners (Mandiant, etc.) | **Dragos PS team**  -  OT architecture assessments, tabletop exercises, incident response, threat hunting |
| **Vendor Lock-In** | Tight Microsoft ecosystem dependency  -  requires Sentinel/Azure for full capability | Dragos is **vendor-agnostic**  -  integrates with any SIEM (Splunk, QRadar, Sentinel), any EDR (CrowdStrike, SentinelOne, Carbon Black) |
| **OT Safety Focus** | Built as a cybersecurity tool; limited understanding of operational impact | Dragos is built by **OT practitioners** who understand safety systems, process control, and the consequences of actions in physical environments |
| **STIG** | No published DISA STIG for D4IoT OT sensors | Dragos has a **published STIG on public.cyber.mil**  -  accelerates federal ATO by months |

### The Positioning Line
> "Microsoft D4IoT is a reasonable choice for organizations that are deeply committed to the Microsoft ecosystem and need basic OT visibility at low incremental cost. But for a high-consequence environment like hydropower generation  -  where the adversary is a nation-state actor and the consequences of a missed alert include dam safety  -  you need a platform built by OT practitioners, backed by the deepest OT threat intelligence in the industry, with a published federal STIG and a team you can call at 2 AM for an OT incident. That's what Dragos provides."

---

## 🆚 Also-Rans (Brief Positioning)

### Forescout (eyeInspect, formerly SecurityMatters)
- **When it comes up:** Customer already has Forescout for NAC/device profiling
- **Positioning:** "Forescout is an IT NAC platform that added OT via acquisition. Their OT depth is limited compared to purpose-built OT platforms. We integrate with Forescout  -  it does device profiling, Dragos does OT threat detection. Complementary, not competitive."

### Cisco Cyber Vision
- **When it comes up:** Customer is a Cisco shop, Cyber Vision is embedded in their switches
- **Positioning:** "Cyber Vision provides basic OT asset visibility embedded in Cisco infrastructure  -  great for awareness. It's not a substitute for a dedicated OT security platform. No threat intelligence, no managed detection, no IR capability, no federal STIG. We integrate with Cisco infrastructure (IE-4010, IE-3400 SPAN ports) and add the security layer on top."

### Tenable OT Security (formerly Indegy)
- **When it comes up:** Customer uses Tenable for IT vulnerability management
- **Positioning:** "Tenable OT is primarily a vulnerability-focused tool  -  it's good at scanning for misconfigurations and unpatched firmware. Dragos provides vulnerability management AND network monitoring AND threat detection AND response services. Different category of tool."

---

## 📋 Quick Reference Matrix

| Capability | Dragos | Claroty | Nozomi | MSFT D4IoT |
|-----------|--------|---------|--------|-----------|
| Dedicated OT Threat Intel | ✅ WorldView (20+ groups) | ⚠️ Team82 (vuln-focused) | ⚠️ Limited | ❌ IT-centric |
| Managed OT Detection | ✅ OT Watch | ❌ | ❌ | ❌ |
| OT Incident Response | ✅ PS Team | ❌ Partners | ❌ Partners | ❌ Partners |
| Published DISA STIG | ✅ public.cyber.mil | ❌ | ❌ | ❌ |
| Federal ATO Precedent | ✅ 13+ sites | ⚠️ Growing | ⚠️ Limited | ✅ Via Azure Gov |
| Passive-Only Option | ✅ Default | ✅ Available | ⚠️ Smart Polling | ✅ Available |
| Deep ICS Protocol Parsing | ✅ 100+ protocols | ⚠️ Broad/shallow | ✅ Strong | ⚠️ Common only |
| Community Defense | ✅ Neighborhood Keeper | ❌ | ❌ | ❌ |
| IoT/BMS/Medical | ❌ OT-only focus | ✅ xDome | ⚠️ Growing | ✅ Defender IoT |
| SIEM Vendor Lock-In | ✅ Agnostic | ✅ Agnostic | ✅ Agnostic | ❌ Sentinel-centric |
