// What js/site.js sends to the Google script for each form (with delivery.provider "google"). Made-up people.
export const booking = {
  _form: "booking",
  _subject: "New booking NR-AB12: Deep Cleaning, Picking a time on the calendar",
  _replyto: "priya@example.com",
  _honey: "",
  _confirm: {
    tpl: "booking",
    vals: { name: "Priya", ref: "NR-AB12", summary: "Deep Cleaning, 2 bed, 1 bath condo; Picking a time on the calendar; estimate $228", items: "Deep Cleaning $285; Founding household −$57" }
  },
  "Reference": "NR-AB12",
  "Service": "Deep Cleaning",
  "Home": "2 bed, 1 bath condo",
  "Extras": "None",
  "Plan": "One time",
  "Date": "Picking a time on the calendar",
  "Arrival window": "",
  "Estimate, first visit": "$228",
  "Estimate, repeat visits": "n/a",
  "Estimated time": "about 4 hours",
  "Name": "Priya Sharma",
  "Phone": "647 555 0123",
  "email": "priya@example.com",
  "Address": "12 Example St",
  "Postal code": "M1B 2K3 (Scarborough)",
  "Getting in": "Lockbox or key code",
  "Pets": "Cat or other",
  "Referred by": "Sam O'Brien",
  "Notes": "We have a cat & the kitchen is the priority\nCode 4321",
  "Confirm by": "Email"
};

export const quote = {
  _form: "quote",
  _subject: "New quote request: Residence Care",
  _replyto: "lee@example.com",
  _honey: "",
  _confirm: { tpl: "quote", vals: { name: "Lee", reply: "within one business day" } },
  "Service": "Residence Care",
  "Name": "Lee Chen",
  "Phone": "647 555 0199",
  "Home size": "3,000 to 5,000 sq ft",
  "How often": "Every 2 weeks",
  "Special surfaces": "Natural stone or marble",
  "Best time for a walkthrough": "Weekday morning",
  "Postal code": "M2N 1A1",
  "Notes": "—",
  "email": "lee@example.com"
};

export const gift = {
  _form: "gift",
  _subject: "New gift card request GIFT-7QXZ: $150",
  _replyto: "ana@example.com",
  _honey: "",
  _confirm: { tpl: "gift", vals: { name: "Ana", ref: "GIFT-7QXZ" } },
  email: "ana@example.com",
  "Reference": "GIFT-7QXZ",
  "Amount": "$150",
  "Send": "To me, I'll pass it on",
  "Your name": "Ana Silva",
  "Your phone": "647 555 0144",
  "Gift for": "Rosa",
  "Their postal code": "M2N 5W9",
  "Message": "Happy holidays!"
};

export const review = {
  _form: "review",
  _subject: "New review: 5 stars from Priya S.",
  _honey: "",
  "Rating": "5 / 5",
  "Name": "Priya S.",
  "Neighbourhood": "Agincourt",
  "Service": "Deep Cleaning",
  "Review": "Spotless kitchen, thank you!",
  "Booked with": "priya@example.com"
};

export const textPrice = {
  _form: "textPrice",
  _subject: "Text this price: $285 to 647 555 0177",
  _honey: "",
  "Text this price to": "647 555 0177",
  "Quote": "Deep Cleaning, 2 bed, 1 bath condo, $285",
  "Estimated time": "about 4 hours",
  "Page": "/"
};

export const copy = (o) => JSON.parse(JSON.stringify(o));
