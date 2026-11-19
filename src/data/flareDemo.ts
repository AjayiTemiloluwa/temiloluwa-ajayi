import type { Cite } from '@/data/sources'

/**
 * The gas-flaring paper's own test comparisons (page 13): five flares the
 * random forest had not been trained on, with its predicted volume and the
 * measured one, in billion cubic metres (BCM) exactly as printed. The demo
 * on /research/gas-flaring is built from these and nothing else.
 */
export const flareCases = [
  { id: 1, predicted: 0.0011735945199999988, measured: 0.001178687 },
  { id: 2, predicted: 0.04275129306000001, measured: 0.058750323 },
  { id: 3, predicted: 0.015699353880000023, measured: 0.015390717 },
  { id: 4, predicted: 0.006932136849999995, measured: 0.004694778 },
  { id: 5, predicted: 0.0030952009600000024, measured: 0.001571275 },
] as const

export const flareCasesCite: Cite = {
  doc: 'gas-flaring',
  page: 13,
  where: 'Results: predicted vs original volume',
  quote: 'Predicted flr_volume: 0.04275129306000001 Original flr_volume: 0.058750323',
}

export const flareR2Cite: Cite = {
  doc: 'gas-flaring',
  page: 14,
  where: 'Results',
  quote: 'approximately 65.83% of the variance in the flare volume can be explained by the selected independent variables',
}

/** The five inputs the model reads, as the paper names them (page 14). */
export const flareInputs = [
  { name: 'Average temperature', plain: 'How hot the flare burns, as the satellite measures it.' },
  { name: 'Ellipticity', plain: 'The shape of the hot spot in the image: round or stretched out.' },
  { name: 'Detection frequency', plain: 'How often the satellite spotted the flare burning.' },
  { name: 'Clear observations', plain: 'How many passes had a cloud-free view of the site.' },
  { name: 'Flare type', plain: 'What kind of site it is, such as upstream oil and gas or downstream.' },
] as const

export const flareInputsCite: Cite = {
  doc: 'gas-flaring',
  page: 14,
  where: 'Results',
  quote: "The results focuses on utilizing the variables 'Average Temperature', 'Ellipticity', 'Detection Frequency', 'Clear Observation', and 'Flare Type Code' to predict the 'Flare Volume'.",
}
