# Whiteboard Scenario Alignment QA

Purpose: prove the interactive whiteboard is a USACE hydropower Dragos SA workshop artifact, not a generic network diagram.

| Whiteboard item | Portfolio scenario claim | Evidence anchors | Status |
|---|---|---|---|
| Customer SOC / Enterprise | The customer already has Splunk/workflow, identity, tickets, and enterprise-side handoff systems. | `discovery-as-found`, `demo-thesis`, `pov-success` | PASS |
| Authorization Boundary | The customer needs controlled OT access paths through firewall and jump host workflows. | `discovery-as-found`, `passive-span-tap`, `nist-800-82` | PASS |
| Plant Operations / Control / Field zones | OT architecture should separate operations services, control services, and process equipment/data flows. | `scenario-overview`, `discovery-as-found`, `hydropower-protocols`, `nist-800-82` | PASS |
| GE Mark VIe, ControlLogix, S7-400, protocol labels | The scenario and demo use hydropower-relevant controller/protocol examples. | `hydropower-protocols`, `demo-thesis` | PASS |
| Dragos Sensors, SiteStore, CentralStore | The proposed architecture uses passive sensors, local SiteStore analysis, and CentralStore aggregation. | `architecture-design`, `dragos-appliances`, `dragos-centralstore`, `passive-span-tap` | PASS |
| Boundary/control SPAN paths | The customer constraint is passive-only collection through SPAN/TAP, with no active scanning or PLC agents. | `passive-span-tap`, `discovery-as-found`, `demo-thesis` | PASS |
| SOC/ticket handoff | The close should connect detections and metadata into customer SOC workflow and ticket review. | `pov-success`, `dragos-centralstore`, `architecture-design` | PASS |
| 24-step guided walkthrough | The whiteboard follows customer discovery, topology, Dragos placement, SOC handoff, and PoV close. | `scenario-overview`, `demo-thesis`, `pov-success` | PASS |

Validation gates:

- `npm run audit:whiteboard:scenario` requires evidence references on every zone, entity, link, and step.
- `npm run audit:whiteboard` includes scenario alignment, TypeScript, production build, and 24-step browser QA at five viewports.
- Public copy must not describe the whiteboard as an 8-step Purdue walkthrough or link to the removed `diagrams.html` page.
- Runtime route rendering must remain canvas/HTML only: no tldraw dependency and no SVG route runtime.
