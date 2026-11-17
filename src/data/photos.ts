/**
 * Photo plates — optimized copies in public/images. One list, used by the
 * home photo parade and the /life gallery, so the two never disagree.
 */

export type Plate = {
  src: string
  w: number
  h: number
  tag: string
  place: string
  alt: string
}

export const plates: Plate[] = [
  { src: '/images/graduation-1.jpg', w: 1280, h: 1600, tag: 'Graduation', place: 'University of Ibadan', alt: 'Graduation at the University of Ibadan' },
  { src: '/images/engineering-1.jpg', w: 1280, h: 1600, tag: 'Engineering', place: 'SPE UI', alt: 'With the Society of Petroleum Engineers community' },
  { src: '/images/facilitation.jpg', w: 1066, h: 1600, tag: 'Facilitation', place: 'Teaching', alt: 'Facilitating a teaching session' },
  { src: '/images/graduation-2.jpg', w: 1280, h: 1600, tag: 'Graduation', place: 'Class of 2026', alt: 'Graduation day, Class of 2026' },
  { src: '/images/community-1.jpg', w: 1600, h: 1066, tag: 'Community', place: 'Leadership', alt: 'With the community and leadership team' },
  { src: '/images/engineering-2.jpg', w: 1280, h: 1600, tag: 'Engineering', place: 'SPE UI', alt: 'With the SPE UI engineering community' },
  { src: '/images/studio.jpg', w: 1280, h: 1600, tag: 'Portrait', place: 'Studio', alt: 'Studio portrait' },
  { src: '/images/graduation-3.jpg', w: 1280, h: 1600, tag: 'Graduation', place: 'B.Sc Petroleum Engineering', alt: 'Graduating with a B.Sc in Petroleum Engineering' },
  { src: '/images/field.jpg', w: 663, h: 847, tag: 'Moments', place: 'Lagos, Nigeria', alt: 'Out in Lagos' },
  { src: '/images/community-2.jpg', w: 1600, h: 1066, tag: 'Community', place: 'Teams', alt: 'Working with teams' },
]
