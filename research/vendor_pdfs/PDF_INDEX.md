# Vendor Equipment PDF Evidence — Source Document Index

> Compiled: 2026-05-10 | Method: Playwright Chromium print-to-PDF
> All PDFs are real vendor product pages captured as faithful PDF prints from the live sites.

---

## Downloaded PDFs

| # | File | Vendor | Size | Source URL | Equipment |
|---|------|--------|------|-----------|-----------|
| 1 | `Cisco_IE-4010_Product_Page.pdf` | Cisco Systems | 4.9 MB | cisco.com/c/en/us/products/switches/industrial-ethernet-4010-series-switches/ | Bonneville Dam switch |
| 2 | `Cisco_IE-3400_Product_Page.pdf` | Cisco Systems | 1.2 MB | cisco.com/c/en/us/products/switches/catalyst-ie3400-rugged-series/ | The Dalles switch |
| 3 | `Emerson_Ovation_DCS_Page.pdf` | Emerson Electric | 8.7 MB | emerson.com/en-us/automation/control-and-safety-systems/distributed-control-systems-dcs/ovation-distributed-control-system | The Dalles DCS |
| 4 | `GE_CIMPLICITY_Page.pdf` | GE Vernova | 1.6 MB | gevernova.com/software/products/hmi-scada/cimplicity | Bonneville HMI |
| 5 | `GE_Vernova_Gas_Power.pdf` | GE Vernova | 10.4 MB | gevernova.com/gas-power | Bonneville Mark VIe parent page |
| 6 | `Rockwell_ControlLogix_Page.pdf` | Rockwell Automation | 10.8 MB | rockwellautomation.com/en-us/products/hardware/allen-bradley/programmable-controllers/large/controllogix-controllers.html | John Day PLC |
| 7 | `Moxa_EDS-205_Page.pdf` | Moxa Inc. | 281 KB | moxa.com/en/products/industrial-network-infrastructure/ethernet-switches/unmanaged-switches/eds-205-series | McNary switch |
| 8 | `Siemens_S7-400_Product_Page.pdf` | Siemens AG | 126 KB | siemens.com/global/en/products/automation/systems/industrial/plc/simatic-s7-400.html | McNary PLC |
| 9 | `Siemens_WinCC_Support_Page.pdf` | Siemens AG | 73 KB | support.industry.siemens.com/cs/products (WinCC V7.5) | McNary HMI |
| 10 | `Dragos_Homepage.pdf` | Dragos, Inc. | 5.0 MB | dragos.com/ | Dragos Platform |
| 11 | `NIST_SP_800-82_Rev3.pdf` | NIST | 8.4 MB | nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf | OT Security Standard (native PDF) |

---

## Could Not Download (Vendor Blocking)

| Equipment | Vendor | Reason | Mitigation |
|-----------|--------|--------|------------|
| HP ProCurve 2920 | HPE/Aruba | ERR_HTTP2_PROTOCOL_ERROR — HPE.com drops all automated connections | Specs documented in `vendor_equipment/vendor_equipment_evidence.md`; obtain manually from hpe.com |
| FactoryTalk View SE | Rockwell | Rockwell restructured all HMI product URLs (404) | Specs captured in `vendor_equipment/Rockwell_FactoryTalk_View_SE.md` via SearXNG |

---

## Download Method

Used **Playwright** (real Chromium browser) with:
- Chrome 125 user-agent string
- Full viewport (1920×1080)
- JavaScript enabled for SPA rendering
- `waitUntil: 'domcontentloaded'` + 3-4 second render delay
- `page.pdf()` print-to-PDF for faithful rendering
- Webdriver detection bypass via `navigator.webdriver = false`

This approach bypassed Cloudflare and similar bot protection on GE Vernova, Dragos, and Rockwell, which all dropped plain HTTP requests.
