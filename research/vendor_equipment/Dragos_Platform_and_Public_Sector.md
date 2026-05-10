# Dragos Platform & Public Sector LLC — Product Documentation

> Source: dragos.com (pages blocked for automated access), Carahsoft partner page, press releases
> Verified via web search 2026-05-10 from intelligencecommunitynews.com, executivebiz.com, carahsoft.com

---

## Dragos Platform Overview

The Dragos Platform is an OT cybersecurity technology providing asset visibility, threat detection, and vulnerability management purpose-built for industrial control system (ICS) and operational technology (OT) environments.

### Platform Architecture

| Component | Function |
|-----------|----------|
| **Sensors** | Passive network sensors deployed at each site; capture and analyze OT network traffic |
| **SiteStore** | Per-site aggregation appliance; stores asset data, alerts, PCAP, vulnerability findings |
| **CentralStore** | Enterprise "manager of managers"; aggregates data from multiple SiteStores |

### Current SiteStore Hardware

| Specification | STS-550-E |
|---------------|-----------|
| Traffic Capacity | Up to 20 Gbps monitored |
| Max Monitored Assets | 500,000 |
| Form Factor | 1U Rackmount |
| Power Supply | Dual 1100W (100-240 VAC), hot-plug redundant |
| Power Consumption | 350W avg / 1000W max |
| Dimensions (HxDxW) | 1.68 x 17.08 x 27.26 inches |
| Weight | 30.2 lb (13.7 kg) |
| Management | 1x Management Interface; IPMI remote management |
| Console | VGA; USB-A (Front: 1x 2.0; Back: 2x 3.0) |
| Warranty | 5 years |

> ⚠️ **PORTFOLIO CORRECTION:** The architecture doc uses "DS-1000" and "DS-500" model names. These are NOT current Dragos identifiers. The current SiteStore model line is STS-xxx (e.g., STS-550-E). Use "SiteStore appliance" in interviews rather than fabricated model numbers.

### Protocol Support (Relevant to Portfolio)

| Protocol | Vendor | Parsed Natively |
|----------|--------|-----------------|
| GE SRTP | GE Vernova | ✅ |
| EGD | GE Vernova | ✅ |
| OPC-UA | Universal | ✅ |
| Modbus TCP | Universal | ✅ |
| EtherNet/IP (CIP) | Rockwell | ✅ |
| S7comm | Siemens | ✅ |
| DNP3 | Utility standard | ✅ |
| IEC 61850 | Utility standard | ✅ |

### Key Capabilities

- **Asset Inventory:** Automatic discovery and classification of OT assets
- **Threat Detection:** Behavioral analytics + signature-based detection
- **Vulnerability Management:** Now/Next/Never prioritization (replaces raw CVSS)
- **PCAP Forensics:** Full packet capture with 90-day default retention
- **SIEM Integration:** Syslog/CEF output to Splunk, QRadar, etc.
- **Compliance:** DISA STIG baseline available (Dragos Platform 2.x STIG on public.cyber.mil)

---

## Dragos Public Sector LLC

| Field | Value |
|-------|-------|
| Launched | October 9, 2024 |
| Purpose | Dedicated federal subsidiary for US government OT cybersecurity |
| Facility Clearance | Top Secret |
| General Manager | Daniel Dorchinsky |
| Master Gov Aggregator | Carahsoft Technology Corp (December 2024) |

### Federal Procurement Vehicles

| Vehicle | Status |
|---------|--------|
| NASA SEWP V/VI | Available via Carahsoft |
| GSA Schedule | Available via Carahsoft |
| DISA STIG | Dragos Platform 2.x published on public.cyber.mil |

### Concurrent Milestone

At the time of Dragos Public Sector LLC launch, DISA released the Dragos Platform 2.x STIG, enabling federal agencies to apply a pre-built hardening baseline and accelerate ATO timelines.

---

## Source Citations

1. Carahsoft Dragos partner page — carahsoft.com/dragos (downloaded 2026-05-10)
2. intelligencecommunitynews.com — Dragos PS LLC launch (Oct 2024)
3. executivebiz.com — Dragos PS LLC coverage (Oct 2024)
4. Dragos STS-550-E datasheet — scribd.com hosted (verified 2026-05-10)
5. dragos.com/threat/voltzite/ — protocol support confirmation (downloaded)
