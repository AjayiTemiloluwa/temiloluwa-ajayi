import { countWord } from '@/lib/words'

/**
 * Research — the manuscript ledger + the road to grad school.
 *
 * Every statement below was checked against the manuscript it describes
 * (public/downloads): datasets, model line-ups, metrics and limitations
 * are taken from each paper's methods and results sections, not from its
 * abstract. If a manuscript is revised, re-check its entry here.
 */

export type Study = {
  id: string
  title: string
  year: string
  venue: string
  kind: string
  field: string
  method: string
  findings: readonly string[]
  /** What the study does not yet show — stated as plainly as the findings. */
  limits: readonly string[]
  stack: readonly string[]
  /** Full manuscript — served from /downloads for public reading. */
  file: string
  fileKind: 'PDF' | 'DOCX'
}

export const researchAreas = [
  {
    id: '01',
    title: 'Drilling Automation & Well-Control AI',
    blurb: 'Stacked machine-learning models on drilling data, to detect well kicks early and estimate their size.',
  },
  {
    id: '02',
    title: 'AI for Sustainable Energy & Climate',
    blurb: 'Satellite flare records and regression models to estimate how much gas is flared, read alongside Nigeria’s flaring policy.',
  },
  {
    id: '03',
    title: 'Data-Driven Fluids & Materials',
    blurb: 'Laboratory rheology and clay-swelling tests, with regression models that predict how a fracturing fluid will perform.',
  },
  {
    id: '04',
    title: 'Climate Fintech',
    blurb: 'Where my M.Sc is heading: pricing and risk in financial engineering, which I hope to apply to the energy transition. No manuscript yet.',
  },
] as const

export const studies: Study[] = [
  {
    id: 'kick-ensemble',
    title: 'Ensemble Machine Learning for Early Detection of Well Kicks and Integrity Risk Indicators',
    year: '2026',
    venue: 'SPE NAICE STSE 2026',
    kind: 'Draft manuscript',
    field: 'Drilling Automation & Well-Control AI',
    method:
      'Three classifiers (a random forest, XGBoost and a deep neural network) stacked under a gradient-boosting meta-learner and trained on 12,142 drilling records derived from Equinor’s open Volve field dataset. Kick severity is labeled in four classes from formation-pressure, flow-imbalance and gas indicators; detected kicks are then sized with classical well-control volume equations.',
    findings: [
      '97.9% accuracy on the held-out test set of 1,215 records; XGBoost on its own scored 98.1%.',
      'Estimated kick volumes track the reference volumes with R² = 0.87 and a mean absolute error of 0.35 bbl.',
      'The full pipeline runs in under 300 ms per time step on a GPU workstation.',
    ],
    limits: [
      'Five-fold cross-validation averaged 51.8% accuracy, far below the test score, so how well the model generalizes is still an open question.',
      'Trained and tested on a single field’s data, with kick labels derived from rule-based thresholds rather than recorded well-control events.',
    ],
    stack: ['Random Forest', 'XGBoost', 'Deep Neural Network', 'Stacked Ensemble', 'Well Control'],
    file: '/downloads/TSA-2026-SPE-NAICE-Ensemble-ML-Well-Kick-Detection.pdf',
    fileKind: 'PDF',
  },
  {
    id: 'kick-anomaly',
    title: 'Well Kick Detection and Quantification Using Real-Time Anomaly Detection',
    year: '2025',
    venue: 'SPE SAASC 2025',
    kind: 'Draft manuscript',
    field: 'Drilling Automation & Well-Control AI',
    method:
      'A random forest, an LSTM network and a physics-informed neural network combined by a stacking meta-learner, using ten-step sliding windows over drilling records from the Volve field dataset. The classifier’s output is paired with flow-difference and annular-volume equations to estimate the size of each kick.',
    findings: [
      '98.2% test accuracy across four kick-severity classes (1,215 test records).',
      'Kick-volume estimates correlate with reference volumes at R² = 0.87 (MAE 0.35 bbl, RMSE 0.48 bbl).',
      'Inference in under 300 ms per time step on a GPU workstation.',
    ],
    limits: [
      'Evaluated offline on recorded and simulated data, not on a live rig.',
      'Model interpretability (for example SHAP) is named as future work.',
    ],
    stack: ['Random Forest', 'LSTM', 'Physics-Informed Neural Network', 'Stacking', 'Well Control'],
    file: '/downloads/TSA-2025-SPE-SAASC-Well-Kick-Detection-Quantification.pdf',
    fileKind: 'PDF',
  },
  {
    id: 'clay-stabilization',
    title:
      'Rheology and Clay Stabilization Performance of Selected Inorganic Salts and Amino Acids in Water-Based Hydraulic Fracturing Fluids with Machine Learning for Predictive Performance Optimization',
    year: '2026',
    venue: 'SPE NAICE STSE 2026 · B.Sc thesis',
    kind: 'Draft manuscript',
    field: 'Data-Driven Fluids & Materials',
    method:
      'Ten water-based fracturing-fluid systems using KCl, CaCl₂, L-arginine and L-cysteine, alone and in hybrid blends. Rheology was measured by rotational viscometry and clay stabilization by 24-hour bentonite swelling tests; multiple linear regression and random forest models then predicted swelling and rheology from fluid composition.',
    findings: [
      'Hybrid amino-acid–salt fluids outperformed conventional KCl fluids on both rheological stability and clay inhibition (one-way ANOVA, p < 0.05).',
      'Yield point correlated strongly with proppant-carrying capacity (r = 0.894).',
      'Random forest regression predicted swelling and rheology more accurately than multiple linear regression.',
    ],
    limits: ['A laboratory-scale study: ten fluid systems, with bentonite swelling observed over 24 hours.'],
    stack: ['Rheology Lab Work', 'ANOVA', 'Random Forest', 'Linear Regression', 'Fluid Design'],
    file: '/downloads/TSA-2026-SPE-NAICE-Clay-Stabilization-Rheology-ML.docx',
    fileKind: 'DOCX',
  },
  {
    id: 'gas-flaring',
    title:
      'Transforming Gas Flaring Solutions: Pioneering Sustainable Practices in Nigeria’s Oil & Gas Sector through Data-Driven Innovation',
    year: '2024',
    venue: 'STSE 2024',
    kind: 'Draft manuscript',
    field: 'AI for Sustainable Energy & Climate',
    method:
      'Random forest regression on VIIRS Nightfire satellite flare-site surveys (2012–2019: 83,641 records worldwide, 1,293 for Nigeria), predicting flared volume from flare temperature, ellipticity, detection frequency, clear observations and flare type, alongside a review of Nigeria’s flaring record and policy.',
    findings: [
      'The model explains about 66% of the variance in flare volume (R² = 0.658).',
      'Compares two Niger Delta fields, one of which flares more than 39% of the gas it produces.',
      'Sets out the policy context: Nigeria’s flare-gas regulations and its 2030 target for zero routine flaring.',
    ],
    limits: [
      'Predictions deviate noticeably for some flare sites; more input features and alternative models are listed as next steps.',
    ],
    stack: ['VIIRS Nightfire', 'Random Forest Regression', 'Satellite Remote Sensing', 'Policy Review'],
    file: '/downloads/TSA-2024-STSE-AI-BigData-Gas-Flaring-Management.pdf',
    fileKind: 'PDF',
  },
]

/**
 * The road to grad school — where the ledger leads. `statement` is a
 * plain account of where the work stands and what it still needs; it
 * makes no claim the studies above do not support.
 */
export const gradPath = {
  current: {
    label: 'M.Sc Financial Engineering, WorldQuant University',
    detail: 'In progress. It covers pricing, risk and the math of making decisions under uncertainty.',
  },
  target: {
    label: 'A PhD or research role in AI for energy systems',
    detail: 'What I want to work on: machine learning for drilling safety and emissions monitoring, tested on field data.',
  },
  statement: `So far I have ${countWord(studies.length)} draft manuscripts, built on Equinor’s open Volve drilling dataset, satellite flare records and lab fluid tests. None is published yet. Next, I want to join a research group where this work can be tested on field data and go through peer review.`,
} as const
