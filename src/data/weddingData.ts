import familyCelebrationOne from '../assets/photos/family-celebration-1.jpg';
import couplePhoto from '../assets/photos/sagar-ishwari.jpg';
import familyCelebrationTwo from '../assets/photos/family-celebration-2.jpg';

export const weddingData = {
  bride: 'Ishwari', brideFull: 'Ishwari Pathak', groom: 'Sagar', groomFull: 'Sagar Dave',
  date: '2027-01-16T10:00:00+05:30', dateLabel: '16 January 2027',
  dateParts: { day: '16', month: 'January', year: '2027', weekday: 'Saturday', time: '10:00 AM', timezone: 'IST' },
  calendar: { start: '20270116T043000Z', end: '20270116T073000Z', uid: 'sagar-ishwari-20270116@wedding' },
  engagementNote: 'The celebrations begin with the engagement on the morning of 15 January.',
  invitation: 'With the blessings of Lord Ganesha and the love of our families, we joyfully invite you to celebrate our wedding.',
  families: { groom: 'The Dave family', bride: 'The Pathak family' },
  venue: {
    name: 'Agrasen Foundation',
    nameGujarati: 'અગ્રસેન ફાઉન્ડેશન',
    address: 'Near, Club O7 Rd, Shela, Ahmedabad, Gujarat 380057',
    mapUrl: 'https://maps.app.goo.gl/Yr4jwwB1i5K1dKyf6',
  },
  contact: { name: 'The wedding families', phone: '', email: '' },
  hashtag: '#SagarWedsIshwari', instagramUrl: 'https://www.instagram.com/',
  youtubeId: '', templeArtwork: './temple.png', musicUrl: '',
  photos: [
    { src: familyCelebrationOne, alt: 'Sagar and Ishwari seated with family in front of pink drapes', caption: 'Two hearts, surrounded by love.' },
    { src: couplePhoto, alt: 'Sagar and Ishwari smiling at each other', caption: 'The little moments, the forever kind of love.' },
    { src: familyCelebrationTwo, alt: 'Sagar and Ishwari celebrating with family in green, maroon and gold outfits', caption: 'Two families. One beautiful beginning.' },
  ],
  story: 'Some journeys lead you somewhere. Ours led us to each other. With full hearts and our favourite people by our side, we’re beginning the most beautiful chapter yet.',
  events: [
    { name: 'Engagement', subtitle: 'The beginning of forever', date: '15 January 2027', time: '7:00 AM – 9:00 AM', description: 'Two hearts, two families, and a beautiful promise. Join us for our engagement ceremony.', icon: 'heart', dress: 'Traditional Indian attire' },
    { name: 'Ganesh Sthapna', subtitle: '& Mandap Murat', date: '15 January 2027', time: '9:00 AM – 12:00 PM', description: 'An auspicious beginning, with prayers, blessings, and the warmth of family.', icon: 'sun', dress: 'Traditional Indian attire' },
    { name: 'Haldi', subtitle: 'A little sunshine, a lot of love', date: '15 January 2027', time: 'From 3:00 PM', description: 'Golden hues, happy hearts, and a joyful afternoon.', icon: 'flower', dress: 'Shades of yellow & ivory' },
    { name: 'Sangeet Sandhya', subtitle: 'An evening to remember', date: '15 January 2027', time: '7:00 PM', description: 'An evening of music, dance, and memories as our two families celebrate together.', icon: 'music', dress: 'Festive Indian wear' },
    { name: 'The Wedding', subtitle: 'Hast Melap Mahurat', date: '16 January 2027', time: '10:00 AM', description: 'Sacred vows, seven steps, and a lifetime of togetherness. Join us for our forever.', icon: 'heart', dress: 'Traditional festive attire' },
  ],
};
