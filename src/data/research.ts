import { countWord } from '@/lib/words'
import type { Cite, Claim } from '@/data/sources'

/**
 * Research — the manuscript ledger + the road to grad school.
 *
 * Every statement below is tied to the manuscript it describes: each
 * finding and limit carries a `cite` (page and the paper's own words), and
 * scripts/check-sources.mjs fails the check if a quote is no longer in the
 * draft. Datasets, models, metrics and limits come from each paper's
 * methods and results sections; where a draft only states something in
 * its abstract, the entry says so.
 */

/** Something I'd change, and the line in the paper that made me think so. */
export type Rethink = { text: string; because: Cite }

export type Study = {
  id: string
  /** A short name for the paper's own page header. */
  short: string
  title: string
  year: string
  venue: string
  kind: string
  field: string
  method: string
  methodCite: Cite
  findings: readonly Claim[]
  /** What the study does not yet show — stated as plainly as the findings. */
  limits: readonly Claim[]
  /** What I'd do differently, written after re-reading the draft. */
  rethink: readonly Rethink[]
  stack: readonly string[]
  /** Full manuscript — served from /downloads for public reading. */
  file: string
  fileKind: 'PDF' | 'DOCX'
  /** An interactive look at the paper's own results, on its page. */
  demo?: 'flare'
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
    short: 'Ensemble kick detection',
    title: 'Ensemble Machine Learning for Early Detection of Well Kicks and Integrity Risk Indicators',
    year: '2026',
    venue: 'SPE NAICE STSE 2026',
    kind: 'Draft manuscript',
    field: 'Drilling Automation & Well-Control AI',
    method:
      'Three classifiers (a random forest, XGBoost and a deep neural network) stacked under a gradient-boosting meta-learner and trained on 12,142 drilling records derived from Equinor’s open Volve field dataset. Kick severity is labeled in four classes from formation-pressure, flow-imbalance and gas indicators; detected kicks are then sized with classical well-control volume equations.',
    methodCite: {
      doc: 'kick-ensemble',
      page: 8,
      where: '§4.1 Dataset',
      quote: 'In total, the processed dataset contained 12,142 observations representing sequential drilling states at different time intervals.',
    },
    findings: [
      {
        text: '97.9% accuracy on the held-out test set of 1,215 records; XGBoost on its own scored 98.1%.',
        cite: { doc: 'kick-ensemble', page: 11, where: '§4.5 and Table 4.3', quote: 'The results show that the XGBoost model achieved the highest performance among the individual base models with an accuracy of 0.981070.' },
      },
      {
        text: 'Estimated kick volumes track the reference volumes with R² = 0.87 and a mean absolute error of 0.35 bbl.',
        cite: { doc: 'kick-ensemble', page: 13, where: 'Kick volume estimation', quote: 'the mean absolute error (MAE) and root mean squared error (RMSE) were calculated as 0.35 bbl and 0.48 bbl respectively' },
      },
      {
        text: 'The full pipeline runs in under 300 ms per time step on a GPU workstation.',
        cite: { doc: 'kick-ensemble', page: 13, where: '§4.5.3 Real-Time Performance', quote: 'The results indicate that the system requires less than 300 milliseconds to process each time step.' },
      },
    ],
    limits: [
      {
        text: 'Five-fold cross-validation averaged 51.8% accuracy, far below the test score, so how well the model generalizes is still an open question.',
        cite: { doc: 'kick-ensemble', page: 11, where: 'Table 4.4 Cross Validation Results', quote: 'Mean Cross Validation Accuracy = 0.517616' },
      },
      {
        text: 'Trained and tested on a single field’s data, with kick labels derived from rule-based thresholds rather than recorded well-control events.',
        cite: { doc: 'kick-ensemble', page: 7, where: '§3 Kick labeling', quote: 'This classification scheme provides a systematic method for labeling drilling conditions based on operational thresholds.' },
      },
      {
        text: 'Kick volumes were checked against reference volumes from controlled drilling simulations, not measured influxes.',
        cite: { doc: 'kick-ensemble', page: 13, where: 'Kick volume estimation', quote: 'the estimated kick volumes showed strong agreement with the ground-truth values recorded during the controlled drilling simulations' },
      },
    ],
    rethink: [
      {
        text: 'Explain the gap between 97.9% on the test set and 51.8% in cross-validation before quoting either. The split was stratified by class, so neighbouring time steps from the same well can land in both the training and the test set. I would split by time or by well section and report that score.',
        because: { doc: 'kick-ensemble', page: 8, where: '§4.2 Data Splitting Strategy', quote: 'A stratified sampling approach was applied when splitting the dataset.' },
      },
      {
        text: 'Label kicks from logged well-control events where they exist, and keep the threshold rules as a baseline to beat. Learning the rules back is not the same as detecting kicks.',
        because: { doc: 'kick-ensemble', page: 7, where: '§3 Kick labeling', quote: 'The resulting score is mapped to predefined kick severity categories ranging from No Kick to Severe Kick.' },
      },
      {
        text: 'Add SHAP explanations to every alert, so a driller can see which readings raised it.',
        because: { doc: 'kick-ensemble', page: 14, where: '§5.4 Limitations and Challenges', quote: 'Explainable AI techniques such as SHAP could improve transparency and help engineers understand the factors influencing predictions.' },
      },
    ],
    stack: ['Random Forest', 'XGBoost', 'Deep Neural Network', 'Stacked Ensemble', 'Well Control'],
    file: '/downloads/TSA-2026-SPE-NAICE-Ensemble-ML-Well-Kick-Detection.pdf',
    fileKind: 'PDF',
  },
  {
    id: 'kick-anomaly',
    short: 'Real-time kick anomaly detection',
    title: 'Well Kick Detection and Quantification Using Real-Time Anomaly Detection',
    year: '2025',
    venue: 'SPE SAASC 2025',
    kind: 'Draft manuscript',
    field: 'Drilling Automation & Well-Control AI',
    method:
      'A random forest, an LSTM network and a physics-informed neural network combined by a stacking meta-learner, using ten-step sliding windows over drilling records from the Volve field dataset. The classifier’s output is paired with flow-difference and annular-volume equations to estimate the size of each kick.',
    methodCite: {
      doc: 'kick-anomaly',
      page: 6,
      where: '§3.1 Overview and Rationale',
      quote: 'Raw drilling datasets set of data from the Volve field, 2008-2016 released by Equinor',
    },
    findings: [
      {
        text: '98.2% test accuracy across four kick-severity classes (1,215 test records).',
        cite: { doc: 'kick-anomaly', page: 10, where: 'Table 4.1', quote: 'Combined Model Test Accuracy: 0.9818930041152263' },
      },
      {
        text: 'Kick-volume estimates correlate with reference volumes at R² = 0.87 (MAE 0.35 bbl, RMSE 0.48 bbl).',
        cite: { doc: 'kick-anomaly', page: 11, where: '§4.5.2 Volume estimation', quote: 'The MAE and RMSE for the volume estimation were 0.35 bbl and 0.48 bbl, respectively' },
      },
      {
        text: 'Inference in under 300 ms per time step on a GPU workstation.',
        cite: { doc: 'kick-anomaly', page: 11, where: '§4.5.3 Real-Time Performance', quote: 'was benchmarked to run in under 300 milliseconds per time step on a standard GPU- equipped workstation' },
      },
    ],
    limits: [
      {
        text: 'Evaluated offline on recorded and simulated data, not on a live rig.',
        cite: { doc: 'kick-anomaly', page: 8, where: '§4.1 Dataset Description', quote: 'The dataset used in the experiments originates from high-frequency drilling data gathered during simulated drilling operations.' },
      },
      {
        text: 'Model interpretability (for example SHAP) is named as future work.',
        cite: { doc: 'kick-anomaly', page: 13, where: '§5.5 Limitations and Challenges', quote: 'such as SHAP (SHapley Additive exPlanations) could be integrated to enhance transparency and build operator trust.' },
      },
    ],
    rethink: [
      {
        text: 'Report cross-validation next to the test score. When I did that in the 2026 follow-up, the two disagreed sharply, and this paper shows only the test score.',
        because: { doc: 'kick-anomaly', page: 8, where: '§4.2 Data Splitting', quote: 'A stratified sampling approach was applied to preserve the relative frequency of kick events across the subsets.' },
      },
      {
        text: 'Keep windows from the same stretch of drilling together when splitting. Overlapping ten-step windows that straddle the training and test sets share most of their data.',
        because: { doc: 'kick-anomaly', page: 8, where: '§4.2 Data Splitting', quote: 'sequential samples were generated using a sliding window approach' },
      },
      {
        text: 'Replay the model over a full recorded well, start to finish, to see how early it would really have raised each alarm.',
        because: { doc: 'kick-anomaly', page: 8, where: '§4.1 Dataset Description', quote: 'gathered during simulated drilling operations' },
      },
    ],
    stack: ['Random Forest', 'LSTM', 'Physics-Informed Neural Network', 'Stacking', 'Well Control'],
    file: '/downloads/TSA-2025-SPE-SAASC-Well-Kick-Detection-Quantification.pdf',
    fileKind: 'PDF',
  },
  {
    id: 'clay-stabilization',
    short: 'Clay stabilization & fluid rheology',
    title:
      'Rheology and Clay Stabilization Performance of Selected Inorganic Salts and Amino Acids in Water-Based Hydraulic Fracturing Fluids with Machine Learning for Predictive Performance Optimization',
    year: '2026',
    venue: 'SPE NAICE STSE 2026 · B.Sc thesis',
    kind: 'Draft manuscript',
    field: 'Data-Driven Fluids & Materials',
    method:
      'Ten water-based fracturing-fluid systems using KCl, CaCl₂, L-arginine and L-cysteine, alone and in hybrid blends. Rheology was measured by rotational viscometry and clay stabilization by 24-hour bentonite swelling tests; multiple linear regression and random forest models then predicted swelling and rheology from fluid composition.',
    methodCite: {
      doc: 'clay-stabilization',
      where: '§1.4 Scope and Significance',
      quote: 'This study is limited to laboratory-scale evaluation of ten water-based hydraulic fracturing fluid systems containing selected inorganic salts, amino acids, and their combinations.',
    },
    findings: [
      {
        text: 'Hybrid amino-acid–salt fluids outperformed conventional KCl fluids on both rheological stability and clay inhibition (one-way ANOVA, p < 0.05).',
        cite: { doc: 'clay-stabilization', where: 'Abstract', quote: 'hybrid additive systems exhibited statistically significant improvements in both rheological stability and clay inhibition performance compared to conventional KCl-based fluids (p < 0.05)' },
      },
      {
        text: 'Yield point correlated strongly with proppant-carrying capacity (r = 0.894).',
        cite: { doc: 'clay-stabilization', where: '§4.3 Statistical Analysis', quote: 'Yield point exhibits a strong positive correlation with proppant carrying capacity (r = 0.894)' },
      },
      {
        text: 'The abstract reports that random forest regression predicted swelling and rheology more accurately than multiple linear regression.',
        cite: { doc: 'clay-stabilization', where: 'Abstract', quote: 'Model evaluation demonstrated that the random forest approach provided superior predictive accuracy' },
      },
    ],
    limits: [
      {
        text: 'A laboratory-scale study: ten fluid systems, with bentonite swelling observed over 24 hours, and no high-pressure or high-temperature testing.',
        cite: { doc: 'clay-stabilization', where: '§1.4 Scope and Significance', quote: 'Field-scale conditions such as high pressure and temperature are not considered.' },
      },
      {
        text: 'The draft defines the model scores it uses (R², RMSE, MAE) but does not yet report their values in the results.',
        cite: { doc: 'clay-stabilization', where: '§3.7.3 Model Evaluation', quote: 'Model performance was evaluated using standard regression metrics' },
      },
    ],
    rethink: [
      {
        text: 'Put the model scores in the results. The claim that random forest beat linear regression needs its R² and error on the held-out samples beside it.',
        because: { doc: 'clay-stabilization', where: '§3.7.3 Model Evaluation', quote: 'Model performance was evaluated using standard regression metrics' },
      },
      {
        text: 'Test more fluid systems before training a model on them. With ten systems, an 80:20 split leaves about two for testing. Leave-one-out validation would be more honest at this size.',
        because: { doc: 'clay-stabilization', where: '§3.7.1 Dataset Preparation', quote: 'The dataset was divided into training and testing subsets using an 80:20 split.' },
      },
      {
        text: 'Repeat the best two blends (L-Arg + KCl and L-Cys + KCl) at reservoir temperature, where amino acids may behave differently.',
        because: { doc: 'clay-stabilization', where: '§1.4 Scope and Significance', quote: 'Field-scale conditions such as high pressure and temperature are not considered.' },
      },
    ],
    stack: ['Rheology Lab Work', 'ANOVA', 'Random Forest', 'Linear Regression', 'Fluid Design'],
    file: '/downloads/TSA-2026-SPE-NAICE-Clay-Stabilization-Rheology-ML.docx',
    fileKind: 'DOCX',
  },
  {
    id: 'gas-flaring',
    short: 'Gas flaring from satellite data',
    title:
      'Transforming Gas Flaring Solutions: Pioneering Sustainable Practices in Nigeria’s Oil & Gas Sector through Data-Driven Innovation',
    year: '2024',
    venue: 'STSE 2024',
    kind: 'Draft manuscript',
    field: 'AI for Sustainable Energy & Climate',
    method:
      'Random forest regression on VIIRS Nightfire satellite flare-site surveys (2012–2019: 83,641 records worldwide, 1,293 for Nigeria), predicting flared volume from flare temperature, ellipticity, detection frequency, clear observations and flare type, alongside a review of Nigeria’s flaring record and policy.',
    methodCite: {
      doc: 'gas-flaring',
      page: 10,
      where: 'Data processing',
      quote: 'The global flare site dataset contains 83,641 rows',
    },
    findings: [
      {
        text: 'The model explains about 66% of the variance in flare volume (R² = 0.658).',
        cite: { doc: 'gas-flaring', page: 13, where: 'Results', quote: 'R-squared Score: 0.6583303296788747' },
      },
      {
        text: 'Compares two Niger Delta fields, one of which flares more than 39% of the gas it produces.',
        cite: { doc: 'gas-flaring', page: 8, where: 'Field Y', quote: 'accounting for more than 39 percent of the average gas produced annually' },
      },
      {
        text: 'Sets out the policy context: Nigeria’s flare-gas regulations and its 2030 target for zero routine flaring.',
        cite: { doc: 'gas-flaring', page: 5, where: 'Policy background', quote: 'introduced stricter penalties and a 2030 target for zero routine flaring' },
      },
    ],
    limits: [
      {
        text: 'Predictions deviate noticeably for some flare sites; more input features and alternative models are listed as next steps.',
        cite: { doc: 'gas-flaring', page: 15, where: 'Results discussion', quote: 'the model struggles with accurately predicting the flare volume in some instances' },
      },
    ],
    rethink: [
      {
        text: 'Report the baselines. The method names linear regression, XGBoost and LightGBM, but the results show only the random forest, so there is nothing to say how much better it is.',
        because: { doc: 'gas-flaring', page: 12, where: 'Methodology', quote: 'Linear regression models were initially employed to predict gas flaring volumes' },
      },
      {
        text: 'Give the error in units people can picture. An MSE of 0.00067 on volumes in billions of cubic metres sounds small but says little; a typical miss per flare in million m³ would say more.',
        because: { doc: 'gas-flaring', page: 13, where: 'Results', quote: 'Mean Squared Error: 0.0006739525848685301' },
      },
      {
        text: 'Add the weather and wind inputs the paper itself suggests, and test on a year the model has never seen.',
        because: { doc: 'gas-flaring', page: 16, where: 'Future Research', quote: 'such as atmospheric conditions, wind patterns, and geological features, to improve the precision of flaring predictions' },
      },
    ],
    stack: ['VIIRS Nightfire', 'Random Forest Regression', 'Satellite Remote Sensing', 'Policy Review'],
    file: '/downloads/TSA-2024-STSE-AI-BigData-Gas-Flaring-Management.pdf',
    fileKind: 'PDF',
    demo: 'flare',
  },
]

export const studyById = (id: string) => studies.find((s) => s.id === id)

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
