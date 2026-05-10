// whiteboard.js — Step-through USACE architecture whiteboard
// Each step reveals layers + components with narration

const STEPS = [
  {
    narration: '<span class="tag talk">TALK</span> "Let me walk you through the architecture. We start at the bottom — <strong>Level 0 is the physical process</strong>. Turbines, generators, gate actuators, water level sensors. This is the physics — we never touch this layer."',
    show: ['l0'],
    comps: ['l0-devices']
  },
  {
    narration: '<span class="tag draw">DRAW</span> "Above that, <strong>Level 1 — Basic Control</strong>. These are the PLCs and RTUs that directly control the physical process. At Bonneville, that\'s GE Mark VIe for turbine control and Allen-Bradley ControlLogix for balance-of-plant. At McNary, Siemens S7-400."',
    show: ['l0','l1'],
    comps: ['l0-devices','l1-devices']
  },
  {
    narration: '<span class="tag draw">DRAW</span> "<strong>Level 2 — Supervisory Control</strong>. SCADA servers, HMIs, historians. This is where operators monitor and control the process. FactoryTalk View SE at Bonneville, GE iFIX at The Dalles and John Day."',
    show: ['l0','l1','l2'],
    comps: ['l0-devices','l1-devices','l2-devices']
  },
  {
    narration: '<span class="tag point">POINT</span> "Now here\'s the critical boundary — the <strong>Industrial DMZ at Level 3.5</strong>. Firewall, jump server, data diode. This separates the OT network from the business network. Everything below this line is the authorization boundary we care about."',
    show: ['l0','l1','l2','dmz'],
    comps: ['l0-devices','l1-devices','l2-devices','dmz-devices']
  },
  {
    narration: '<span class="tag draw">DRAW</span> "<strong>Level 3 — Site Operations</strong>. Historian server, engineering workstations, patch management. And this is where we place the <strong>Dragos SiteStore</strong> — it does local analysis, detection, and asset inventory for the site."',
    show: ['l0','l1','l2','dmz','l3'],
    comps: ['l0-devices','l1-devices','l2-devices','dmz-devices','l3-devices','l3-sitestore']
  },
  {
    narration: '<span class="tag draw">DRAW</span> "Now the key piece — <strong>Dragos Sensors</strong>. One at L2 monitoring process control traffic via network TAP. One at L3 monitoring operations traffic via SPAN port. <strong>These are passive, receive-only</strong> — no transmit path to the OT network. Zero risk of disruption."',
    show: ['l0','l1','l2','dmz','l3'],
    comps: ['l0-devices','l1-devices','l2-devices','dmz-devices','l3-devices','l3-sitestore','sensor-l2','sensor-l3'],
    flows: ['sensor-to-site']
  },
  {
    narration: '<span class="tag draw">DRAW</span> "<strong>Levels 4-5 — Business and Enterprise</strong>. ERP, Active Directory, and critically — the SIEM (Splunk Cloud). The <strong>CentralStore</strong> sits at L5, aggregating all four dam sites into a single enterprise view."',
    show: ['l0','l1','l2','dmz','l3','l4','l5'],
    comps: ['l0-devices','l1-devices','l2-devices','dmz-devices','l3-devices','l3-sitestore','sensor-l2','sensor-l3','l4-devices','l5-devices','l5-centralstore'],
    flows: ['sensor-to-site','site-to-central']
  },
  {
    narration: '<span class="tag talk">TALK</span> "<strong>Data flow is one-way up</strong>. Sensors capture passively → metadata flows to SiteStore → aggregated analytics to CentralStore → alert metadata forwarded to Splunk via Syslog/CEF over TLS. <strong>No raw PCAP leaves the site. No data goes to any cloud.</strong>"',
    show: ['l0','l1','l2','dmz','l3','l4','l5'],
    comps: ['l0-devices','l1-devices','l2-devices','dmz-devices','l3-devices','l3-sitestore','sensor-l2','sensor-l3','l4-devices','l5-devices','l5-centralstore'],
    flows: ['sensor-to-site','site-to-central','central-to-siem'],
    legend: true
  }
];

let currentStep = -1;

function init() {
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-reset').addEventListener('click', resetBoard);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextStep(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
    if (e.key === 'r') resetBoard();
  });
  resetBoard();
}

function nextStep() {
  if (currentStep >= STEPS.length - 1) return;
  currentStep++;
  render();
}

function prevStep() {
  if (currentStep <= 0) return;
  currentStep--;
  render();
}

function resetBoard() {
  currentStep = -1;
  document.querySelectorAll('.layer').forEach(l => l.classList.remove('visible'));
  document.querySelectorAll('.comp').forEach(c => c.classList.remove('visible'));
  document.querySelectorAll('.flow-svg').forEach(f => f.classList.remove('visible'));
  document.querySelector('.legend')?.classList.remove('visible');
  document.querySelector('.narration p').innerHTML = 'Press <strong>→ Next</strong> or <strong>spacebar</strong> to begin the architecture walkthrough.';
  updateIndicator();
}

function render() {
  const step = STEPS[currentStep];
  if (!step) return;

  // Narration
  document.querySelector('.narration p').innerHTML = step.narration;

  // Layers
  document.querySelectorAll('.layer').forEach(l => {
    const id = l.dataset.layer;
    l.classList.toggle('visible', step.show.includes(id));
  });

  // Components
  document.querySelectorAll('.comp').forEach(c => {
    const group = c.dataset.group;
    c.classList.toggle('visible', step.comps.includes(group));
  });

  // Flows
  document.querySelectorAll('.flow-svg').forEach(f => {
    const id = f.dataset.flow;
    f.classList.toggle('visible', step.flows?.includes(id) || false);
  });

  // Legend
  const legend = document.querySelector('.legend');
  if (legend) legend.classList.toggle('visible', step.legend || false);

  updateIndicator();
}

function updateIndicator() {
  const total = STEPS.length;
  const cur = currentStep + 1;
  document.querySelector('.step-indicator').textContent = currentStep < 0 ? 'Ready' : `Step ${cur} / ${total}`;
  document.getElementById('btn-prev').disabled = currentStep <= 0;
  document.getElementById('btn-next').disabled = currentStep >= total - 1;
}

document.addEventListener('DOMContentLoaded', init);
