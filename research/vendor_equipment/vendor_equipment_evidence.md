# Vendor Equipment Documentation — Site Card Evidence

> Compiled: 2026-05-10 | SA: Aaron Kotz
> Purpose: Vendor documentation backing every piece of equipment listed on the 4 site cards in architecture.html

---

## Bonneville Dam — PoC Site

### GE Mark VIe Turbine Control System
| Field | Value |
|-------|-------|
| Vendor | GE Vernova (formerly GE Gas Power) |
| Type | Integrated Ethernet-based turbine control system |
| OS | QNX Neutrino RTOS |
| Protocols | GE SRTP, EGD, Modbus TCP, OPC-UA, PROFINET |
| Redundancy | Simplex, dual, triple configurations |
| Cybersecurity | Achilles Level 2 certified, TPM, secure boot |
| Source | gevernova.com (product page returns 404; specs from web search) |
| Local doc | N/A — GE Vernova blocks direct download; specs captured in research_evidence.md |
| Key spec | 1ms SOE timestamping, 100% Ethernet architecture, IEEE 1588 sync |

### GE CIMPLICITY HMI/SCADA
| Field | Value |
|-------|-------|
| Vendor | GE Vernova (Proficy portfolio) |
| URL | https://www.gevernova.com/software/products/hmi-scada/cimplicity |
| Local doc | `GE_CIMPLICITY_HMI.md` |
| Key facts | Standard HMI for Mark VIe power gen; HTML5 capable; enterprise SCADA |

### Cisco IE-4010 Industrial Ethernet Switch
| Field | Value |
|-------|-------|
| Vendor | Cisco Systems |
| URL | https://www.cisco.com/c/en/us/products/switches/industrial-ethernet-4010-series-switches/index.html |
| Local doc | `Cisco_IE-4010.md` |
| SPAN capable | ✅ Yes — full ERSPAN/SPAN support |
| Key facts | Industrial-grade managed switch; designed for harsh environments |

---

## The Dalles Dam

### Emerson Ovation DCS
| Field | Value |
|-------|-------|
| Vendor | Emerson Electric (Automation Solutions) |
| URL | https://www.emerson.com/en-us/automation/control-and-safety-systems/distributed-control-systems-dcs/ovation-distributed-control-system |
| Local doc | `Emerson_Ovation_DCS.md` |
| Protocols | OPC-UA, Modbus TCP |
| Key facts | Purpose-built for power generation; HMI = Ovation Operator Workstations |

### Cisco Catalyst IE-3400 Rugged Series
| Field | Value |
|-------|-------|
| Vendor | Cisco Systems |
| URL | https://www.cisco.com/c/en/us/products/switches/catalyst-ie3400-rugged-series/index.html |
| Local doc | `Cisco_IE-3400.md` |
| SPAN capable | ✅ Yes — supports ERSPAN, RSPAN |
| Key facts | IOS-XE based; rugged industrial switch for utilities/manufacturing |

---

## John Day Dam

### Allen-Bradley ControlLogix L83
| Field | Value |
|-------|-------|
| Vendor | Rockwell Automation |
| URL | https://www.rockwellautomation.com/en-us/products/hardware/allen-bradley/programmable-controllers/large/controllogix-controllers.html |
| Local doc | `Rockwell_ControlLogix.md` |
| Protocols | EtherNet/IP (CIP), Modbus TCP |
| Key facts | High-performance PLC/PAC; premier integration with FactoryTalk |

### FactoryTalk View SE
| Field | Value |
|-------|-------|
| Vendor | Rockwell Automation |
| Source | Web search (product page 404); specs from search results |
| Local doc | N/A — specs captured in this file |
| Key facts | Site Edition = server-based multi-client HMI; runs on Windows; supports web via ViewPoint |
| Architecture | Local, Network, Network Distributed configurations |

### HP ProCurve 2920
| Field | Value |
|-------|-------|
| Vendor | HPE (Aruba Networks) |
| Source | arubanetworks.com, hpe.com |
| Local doc | See research_evidence.md Item 12 |
| SPAN capable | ⚠️ Limited — 1 active mirror session only |
| Key facts | Managed switch but single mirror session; TAP recommended |

---

## McNary Dam

### Siemens SIMATIC S7-400
| Field | Value |
|-------|-------|
| Vendor | Siemens AG |
| URL | https://www.siemens.com/global/en/products/automation/systems/industrial/plc/simatic-s7-400.html |
| Local doc | `Siemens_S7-400.md` |
| Protocols | S7comm (proprietary) |
| Key facts | Legacy PLC; end-of-production since 2020; successor = S7-1500 |
| ⚠️ Interview note | "S7-400 is end-of-life — this is a risk finding. Dragos provides continued monitoring." |

### Siemens WinCC 7.5
| Field | Value |
|-------|-------|
| Vendor | Siemens AG |
| URL | https://support.industry.siemens.com/cs/products/6av6381-2aa07-5ax4/simatic-wincc-v7-5-runtime-v7-5 |
| Local doc | N/A — Siemens product page returned 404; specs from search |
| Protocols | S7comm, OPC |
| Key facts | SCADA/HMI for S7-series PLCs; runs on Windows; end-of-mainstream-support approaching |

### Moxa EDS Unmanaged Switches
| Field | Value |
|-------|-------|
| Vendor | Moxa Inc. |
| URL | https://www.moxa.com/en/products/industrial-network-infrastructure/ethernet-switches/unmanaged-switches |
| Local doc | `Moxa_EDS_Unmanaged.md` |
| SPAN capable | ❌ No — unmanaged switches have no mirror/SPAN capability |
| Key facts | Industrial-grade; designed for harsh environments; TAP required for monitoring |

---

## Dragos Appliances

### SiteStore / CentralStore
| Field | Value |
|-------|-------|
| Vendor | Dragos, Inc. |
| Source | dragos.com/resources (requires auth for datasheets) |

> ⚠️ **CORRECTION IDENTIFIED:** Portfolio uses model names "DS-1000" and "DS-500" — these are NOT current Dragos model identifiers. Current SiteStore model is **STS-550-E** (1U rackmount, up to 20 Gbps, 500K monitored assets, dual 1100W PSU). The "DS-" naming was likely placeholder or legacy. For interview: use generic "SiteStore appliance" rather than specific model numbers unless Dragos provides current designations.

| STS-550-E Specs | Value |
|----------------|-------|
| Traffic capacity | Up to 20 Gbps |
| Max monitored assets | 500,000 |
| Form factor | 1U rackmount |
| Power | Dual 1100W, hot-plug redundant |
| Dimensions | 1.68 x 17.08 x 27.26 in |
| Weight | 30.2 lb |
| Warranty | 5 years |

---

## Summary Status

| Equipment | Vendor Doc Downloaded | Status |
|-----------|----------------------|--------|
| GE Mark VIe | ❌ (GE Vernova 404) | Specs from web search ✅ |
| GE CIMPLICITY | ✅ `GE_CIMPLICITY_HMI.md` | Complete |
| Cisco IE-4010 | ✅ `Cisco_IE-4010.md` | Complete |
| Emerson Ovation DCS | ✅ `Emerson_Ovation_DCS.md` | Complete |
| Cisco IE-3400 | ✅ `Cisco_IE-3400.md` | Complete |
| AB ControlLogix L83 | ✅ `Rockwell_ControlLogix.md` | Complete |
| FactoryTalk View SE | ❌ (Rockwell 404) | Specs from web search ✅ |
| HP ProCurve 2920 | ✅ (in research_evidence.md) | Complete |
| Siemens S7-400 | ✅ `Siemens_S7-400.md` | Complete |
| Siemens WinCC 7.5 | ❌ (Siemens 404) | Specs from web search ✅ |
| Moxa EDS | ✅ `Moxa_EDS_Unmanaged.md` | Complete |
| Dragos SiteStore | ⚠️ Model names need correction | DS-1000/500 → STS-550-E |
