# Internal Deal Artifacts & IR Talking Points

> SA interview prep: sample internal comms and incident response methodology

---

## 1. Post-Discovery Debrief Email (to AE)

```
Subject: USACE NWD — Discovery Debrief + Next Steps

Hey [AE],

Good discovery call today with Dr. Torres and the NWD SCADA team. Here's the summary:

**Environment:**
- 4 dam sites, 6,033 MW combined capacity
- 4 different controller platforms (GE Mark VIe, Emerson Ovation, AB ControlLogix, Siemens S7-400)
- ZERO OT monitoring today — complete blind spot
- Managed switches at 2 sites (Bonneville, The Dalles), need TAPs at other 2

**Champion Status:**
Dr. Torres is our technical champion. She's bought in on the need and has
budget authority for cybersecurity under EP 1130-2-510 compliance. She asked
us to design the architecture and come back with a BoM.

**Competition:**
They've had a Claroty intro call but no PoC. Torres said they "didn't seem
to understand the OT environment." Good opening for us.

**Next Steps:**
1. I'll deliver the architecture doc + BoM by Friday
2. Schedule Bonneville PoC for June — Torres will coordinate site access
3. Need to engage the ISSO early — I'll set up an intro call
4. Please confirm Carahsoft has SEWP VI catalog listing ready

**Technical Win Probability:** 85% — strong champion, clear need, compliance
driver, weak competition. Risk is ATO timeline if we don't engage ISSO early.

—Aaron
```

---

## 2. Deal Review Talking Points (for Pipeline Review)

```
Deal: USACE NWD Columbia River Hydropower OT Cybersecurity
Stage: Technical Validation (PoC scheduled)
Amount: ~$780K Year 1 (Deal Desk approved)
Close Date: Sep 2026 (FY26 Q4 — end of fiscal year money)

MEDDPICC Score:
- Metrics: ✅ 247 assets discovered at Bonneville alone, zero prior visibility
- Economic Buyer: ⚠️ NWD CIO — haven't engaged directly yet. Torres is our path.
- Decision Criteria: ✅ Protocol coverage, passive-only, FedRAMP, federal STIG
- Decision Process: ✅ PoC → ARB → SEWP VI task order. Clean procurement path.
- Paper Process: ✅ SEWP VI via Carahsoft. FFP recommended.
- Identified Pain: ✅ EP 1130-2-510 compliance mandate, DoD CIO OT directive
- Champion: ✅ Dr. Torres — technical authority, budget influence, internal advocate
- Competition: ⚠️ Claroty had an intro call, no PoC. We're ahead technically.

Risks:
1. ATO timeline — need to engage ISSO during PoC, not after
2. TAP installation at John Day/McNary requires maintenance windows (4-week lead time)
3. Haven't reached the Economic Buyer directly yet

Ask: Need AE to set up EB meeting before ARB in August.
```

---

## 3. Champion Letter Draft

> The champion letter is a document you write FOR your champion to send internally, making the case for your solution. The champion doesn't write this — you do.

```
Subject: Recommendation — Dragos Platform for OT Cybersecurity Monitoring

To: [NWD CIO]
From: Dr. Maria Torres, SCADA Program Manager

Background:
Per EP 1130-2-510 and the DoD CIO OT Security Directive, Northwestern
Division is required to establish OT cybersecurity monitoring across our
hydropower facilities. We currently have zero visibility into OT network
activity across all four Columbia River dam sites.

Evaluation Summary:
We conducted a Proof of Concept at Bonneville Dam with the Dragos Platform
over a 30-day period. Key findings:

- Discovered 247 OT assets (exceeding our known inventory by 34%)
- Identified 12 vulnerabilities including 3 rated "Now" (critical/exploitable)
- Successfully parsed all four of our proprietary protocols (GE SRTP, EGD,
  Emerson OPC-UA, Rockwell EtherNet/IP)
- Zero operational disruption — passive monitoring only
- Alerts visible in our existing Splunk SIEM within seconds

Recommendation:
I recommend proceeding with a full production deployment of the Dragos
Platform across all four sites. Dragos is the only evaluated vendor with:
- A published DISA STIG (accelerates ATO by 3-6 months)
- Dedicated OT threat intelligence tracking 20+ ICS threat groups
- Managed detection service (OT Watch) that addresses our staffing gap

Procurement Path:
NASA SEWP VI via Carahsoft (authorized reseller). FFP Year 1.

I request ARB review for August 2026 with a target contract award of
September 2026 (FY26).

Respectfully,
Dr. Maria Torres
```

---

## 4. Incident Response Talking Points

> For when asked: "Tell me about your IR experience in OT environments"

### IR Methodology You Should Know

**The PICERL Framework (NIST SP 800-61):**
1. **Preparation** — baseline OT network, establish detection, document playbooks
2. **Identification** — detect anomalous activity (this is what Dragos Platform does)
3. **Containment** — isolate affected systems WITHOUT disrupting safety/operations
4. **Eradication** — remove adversary access, patch vulnerabilities
5. **Recovery** — restore normal operations, validate OT process integrity
6. **Lessons Learned** — document findings, update detections, brief leadership

### OT-Specific IR Considerations
- **YOU DO NOT REBOOT A PLC DURING IR.** OT IR is fundamentally different from IT IR. You can't just "nuke and pave" a turbine controller.
- **Safety first, always.** If the adversary is in the control system, the first priority is ensuring the physical process is safe — not preserving forensic evidence.
- **Coordination with plant operations:** Every IR action must be coordinated with the plant manager. They control the physical process; you control the investigation.
- **Evidence collection in OT:** PCAP is your primary evidence source. Dragos sensors capture full packet data — this is the forensic goldmine for OT IR.
- **Timeline reconstruction:** Use Dragos activity logs + PCAP to build a timeline of adversary actions — what did they touch, what commands did they send, what did they change?

### Your Talking Point
> "My IR background comes from my DoD experience where I managed incident response in operational environments with safety-critical systems. The key difference between IT and OT incident response is that you can't just isolate and reimage a turbine controller — you have to contain the threat while maintaining safe operations. That's why the Dragos Platform's PCAP retention and activity timeline reconstruction are so critical for OT IR — they give you the forensic evidence to understand what happened without disrupting the physical process."

### Key IR Scenarios to Be Ready For
1. **"How would you handle a ransomware event hitting the L3 historian at Bonneville?"**
   - Answer: Isolate L3 from L2 at the firewall. Verify L2 controllers are operating normally. Activate OT Watch. Pull PCAP from Dragos sensor for lateral movement analysis. Coordinate with plant ops to validate turbine operations are stable. Do NOT touch the PLCs.

2. **"What if Dragos detects S7comm write commands to the S7-400 at McNary that the operator didn't authorize?"**
   - Answer: This is a high-severity alert — unauthorized PLC writes could affect physical processes. Immediately notify plant operations and ISSO. Use Dragos to identify the source IP and timeline. Compare write values against expected operating parameters. If values are outside safe ranges, recommend manual process control override while investigating.
