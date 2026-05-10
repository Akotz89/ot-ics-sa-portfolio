# GE Vernova Mark VIe Turbine Control System — Product Specifications

> Source: GE Vernova official product data (gevernova.com, multiple pages)
> Note: GE Vernova restructured their website in 2025; direct product page URLs are no longer available.
> Specs verified via web search against multiple GE Vernova source documents (2026-05-10).
> Reference documents: GEH-6721 (Mark VIe System Guide), GEA-34191 (Fact Sheet)

---

## System Overview

The Mark VIe is an integrated, 100% Ethernet-based control system designed for high-performance turbine and plant-level control. Used across gas turbines, steam turbines, hydro, wind, nuclear, combined cycle power plants, and balance-of-plant (BoP) processes.

## Controller Architecture

| Specification | Value |
|---------------|-------|
| Controller | Mark VIe UCSE |
| Operating System | QNX Neutrino RTOS (real-time, multitasking) |
| Architecture | Modular, stand-alone — no battery or jumper settings |
| Networking | 100% Ethernet-based |
| I/O Network | Dedicated full-duplex IONet for deterministic communication |
| Clock Sync | IEEE 1588 PTP (±100 microseconds) |
| SOE Resolution | 1ms Sequence of Events timestamping |

## Redundancy & Reliability

- Supports simplex, dual, and triple redundant configurations
- Mission-critical reliability for continuous power generation
- Hot-standby controller failover

## Communication Protocols

| Protocol | Use Case |
|----------|----------|
| GE SRTP | Configuration, diagnostics, firmware updates (proprietary) |
| EGD (Ethernet Global Data) | Real-time process data broadcast between controllers and HMIs |
| Modbus TCP | Device integration, third-party communication |
| OPC-UA | Enterprise data exchange, historian integration |
| PROFINET | Fieldbus integration |
| PROFIBUS | Legacy fieldbus support |
| Foundation Fieldbus | Process instrumentation |
| IEC 61850 | Substation automation |

## I/O Capabilities

- Digital I/O (24V DC, 48V DC, 125V DC)
- Analog I/O (4-20mA, 0-10V, RTD, thermocouple)
- Specialized: vibration, speed, flame detection
- Native fieldbus protocol support

## Cybersecurity Features

| Feature | Detail |
|---------|--------|
| Achilles Level 2 | Certified for industrial network robustness |
| TPM | Trusted Platform Module for hardware-based security |
| Secure Boot | Measured/secure boot firmware validation |
| Firmware Updates | Encrypted firmware update mechanism |
| Architecture | Defense-in-depth design |

## Environmental Ratings

| Parameter | Rating |
|-----------|--------|
| Operating Temperature | Up to 65°C–70°C (module dependent) |
| Storage Temperature | -40°C to +85°C (-40°F to +185°F) |

## Diagnostics & Tooling

- **ToolboxST** — primary engineering/configuration software
- **ControlST** — control system tuning and monitoring
- **WorkstationST** — operator interface
- Trip History, Dynamic Data Recorders, Trender for root cause analysis

## Associated HMI

- **GE CIMPLICITY** — standard HMI/SCADA for Mark VIe power generation environments
- Runs on Windows; communicates via SRTP and EGD
- HTML5 capable; enterprise SCADA deployment
- See: `GE_CIMPLICITY_HMI.md` for detailed CIMPLICITY specs

## Integration with Dragos

- Dragos Platform natively parses GE SRTP and EGD protocols
- Passive monitoring via SPAN or network TAP captures all Mark VIe control traffic
- Asset identification includes controller firmware version, I/O module inventory
- Vulnerability mapping against GE ICS-CERT advisories

## Source Citations

1. gevernova.com — Mark VIe product pages (multiple, restructured 2025)
2. GEH-6721 — Mark VIe System Guide (GE technical documentation)
3. GEA-34191 — Mark VIe Fact Sheet
4. Web search verification: 2026-05-10
