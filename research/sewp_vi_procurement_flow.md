# Federal Procurement Flow — SEWP VI Task Order Process

> SA interview prep: "Walk me through how a SEWP order works"

---

## The Cast

| Role | Who | What They Do |
|------|-----|-------------|
| **Customer CO** | USACE Contracting Officer | Only person who can commit government funds. Signs the task order. |
| **Customer COR** | Technical representative | Monitors contract performance, validates deliverables |
| **Carahsoft** | Channel partner / authorized reseller | Holds the SEWP VI contract, generates the quote, processes the order |
| **Dragos AE** | Account Executive | Owns the relationship, coordinates with Carahsoft on pricing |
| **Dragos SA** | You | Sizes the architecture, writes technical requirements, supports evaluation |
| **Dragos Deal Desk** | Internal pricing authority | Approves discounts, sets final pricing |
| **SEWP PMO** | NASA Program Management Office | Processes task orders, assigns tracking numbers, collects admin fee (0.34%) |

---

## The 8-Step Flow

```
Customer Need → Market Research → RFQ via SEWP QRT → Carahsoft Quote →
CO Evaluation → Task Order Issued → SEWP PMO Processing → Delivery/Performance
```

### Step 1: Requirement Definition
- **Who:** Customer (SCADA PM + ISSO + CO)
- **What:** Customer identifies the need for OT cybersecurity monitoring
- **SA's role:** You've already done the discovery call and architecture doc. The customer uses YOUR architecture doc + BoM to define their technical requirements.

### Step 2: Market Research
- **Who:** Customer CO
- **What:** CO documents that SEWP VI is the appropriate vehicle and that the required products are available on it
- **SA's role:** Confirm Dragos products are listed on SEWP VI catalog via Carahsoft. Provide the CO with catalog references if needed.
- **Key detail:** The CO must document why SEWP VI is the best vehicle (vs. GSA Schedule, BPA, open competition). SEWP's technology focus and competitive pricing typically satisfy this.

### Step 3: Fair Opportunity / RFQ
- **Who:** Customer CO via SEWP Quote Request Tool (QRT)
- **What:** Per FAR 16.505(b)(1), orders over $10K must give all contract holders "fair opportunity" to compete
- **In practice for Dragos:** The CO posts an RFQ through the SEWP QRT system. Carahsoft (as the SEWP contract holder) responds with a formal quote.
- **SA's role:** Help the customer write the technical requirements in the RFQ so they accurately describe the need. You're NOT sole-sourcing — you're ensuring the requirements reflect the actual environment.

### Step 4: Carahsoft Quote
- **Who:** Carahsoft (coordinating with Dragos AE + Deal Desk)
- **What:** Carahsoft generates the formal SEWP-compliant quote based on the BoM you sized
- **Flow:** SA submits BoM → Dragos Deal Desk approves pricing → AE sends to Carahsoft → Carahsoft formats as SEWP quote with all required contract clauses
- **SA's role:** Verify the quote matches the architecture you designed. Flag any mismatches.

### Step 5: CO Evaluation
- **Who:** Customer CO + COR
- **What:** CO evaluates quotes received, selects best value
- **SA's role:** Be available for technical clarifications. The COR may ask follow-up questions about the architecture.

### Step 6: Task Order Issuance
- **Who:** Customer CO
- **What:** CO issues a delivery order / task order referencing the SEWP VI contract
- **Contract type:** FFP (Firm Fixed Price) recommended for Year 1 — simplifies procurement, transfers cost risk to vendor
- **SA's role:** Confirm the task order scope matches the architecture. Ensure all line items (hardware, software, subscriptions, services) are included.

### Step 7: SEWP PMO Processing
- **Who:** NASA SEWP PMO (sewporders@sewp.nasa.gov)
- **What:** Task order routed through SEWP PMO for processing. They assign a SEWP Tracking Number (STN) and collect the 0.34% admin fee.
- **Timeline:** Typically < 1 business day
- **SA's role:** None — this is between the CO and SEWP PMO

### Step 8: Delivery & Performance
- **Who:** Dragos + Carahsoft
- **What:** Hardware shipped, licenses provisioned, Professional Services scheduled
- **SA's role:** Coordinate deployment — you're now transitioning from pre-sales to delivery. Schedule the Architecture Assessment, plan the PoC at Bonneville, coordinate IATT with the ISSO.

---

## Key Terms the CO Will Use

| Term | Meaning |
|------|---------|
| **GWAC** | Government-Wide Acquisition Contract — pre-competed vehicle available to all federal agencies |
| **FFP** | Firm Fixed Price — price agreed in advance, doesn't change regardless of actual costs |
| **T&M** | Time and Materials — hourly rate + materials, used when scope is uncertain (NOT recommended here) |
| **CLIN** | Contract Line Item Number — each line in the task order |
| **Period of Performance (PoP)** | Contract duration — typically 1 base year + option years |
| **Fair Opportunity** | FAR requirement to give all contract holders a chance to compete |
| **Sole Source** | Exception to fair opportunity — requires justification (e.g., only one vendor meets requirements). Harder to execute, avoid if possible. |
| **QRT** | Quote Request Tool — SEWP's online system for managing RFQs |
| **STN** | SEWP Tracking Number — assigned by SEWP PMO to every task order |

---

## Your Interview Answer

> "The SEWP VI ordering process starts with the customer defining their requirements — which is where the SA's architecture document and BoM come in. The CO then posts an RFQ through the SEWP Quote Request Tool, Carahsoft responds with a compliant quote based on our Deal Desk-approved pricing, and once the CO evaluates and selects, they issue a task order that gets processed through the SEWP PMO. For this engagement, I'd recommend FFP contract type for Year 1 to simplify procurement and give the CO cost certainty. The whole process can move in 4-6 weeks if the RFQ is clean, which is why getting the architecture document and BoM finalized early is critical path."
