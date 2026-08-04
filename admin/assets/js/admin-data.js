/* Grand Palace — Admin config & seed data */
window.ADMIN_CONFIG = {
  storageKeyPrefix: "gpAdmin",
  brandName: "Grand Palace",
  brandInitial: "GP",
  adminName: "Admin User",
  adminInitials: "AU",
  menu: [
    { key: "dashboard", href: "dashboard.html", label: "Dashboard", icon: "📊" },
    { key: "bookings", href: "bookings.html", label: "Bookings", icon: "🗓️" },
    { key: "halls", href: "halls.html", label: "Halls", icon: "🏛️" },
    { key: "packages", href: "packages.html", label: "Packages", icon: "🎁" },
    { key: "gallery", href: "gallery.html", label: "Gallery", icon: "🖼️" },
    { key: "testimonials", href: "testimonials.html", label: "Testimonials", icon: "⭐" },
    { key: "customers", href: "customers.html", label: "Customers", icon: "👥" },
    { key: "enquiries", href: "enquiries.html", label: "Enquiries", icon: "✉️" },
    { key: "calendar", href: "calendar.html", label: "Calendar", icon: "📅" },
    { key: "reports", href: "reports.html", label: "Reports", icon: "📈" },
    { key: "settings", href: "settings.html", label: "Settings", icon: "⚙️" },
    { key: "profile", href: "profile.html", label: "Profile", icon: "👤" }
  ],
  pageTitles: {
    dashboard: "Dashboard", bookings: "Manage Bookings", "booking-details": "Booking Details",
    halls: "Manage Halls", "add-hall": "Add Hall", "edit-hall": "Edit Hall",
    packages: "Manage Packages", gallery: "Gallery Management", testimonials: "Testimonials",
    customers: "Customer Management", enquiries: "Contact Enquiries", calendar: "Event Calendar",
    reports: "Revenue & Booking Reports", settings: "Website Settings", profile: "Admin Profile"
  }
};

(function () {
  const HALLS = [
    { id: "H1", name: "Emerald Grand Hall", capacity: 800, price: 250000, facilities: "AC, Valet Parking, Stage, LED Wall", availability: "Available", desc: "Our largest palace-style hall with double-height ceilings, ideal for grand weddings.", img: "" },
    { id: "H2", name: "Gold Pavilion", capacity: 450, price: 150000, facilities: "AC, Garden View, Catering Kitchen", availability: "Available", desc: "An elegant mid-size hall opening onto landscaped lawns.", img: "" },
    { id: "H3", name: "Wine Terrace", capacity: 250, price: 95000, facilities: "Open-air, Fairy Lights, Bar Counter", availability: "Booked", desc: "Rooftop terrace venue perfect for receptions and sundowners.", img: "" },
    { id: "H4", name: "Ivory Banquet Room", capacity: 150, price: 60000, facilities: "AC, Projector, Sound System", availability: "Available", desc: "Intimate indoor hall suited to birthdays and corporate events.", img: "" },
    { id: "H5", name: "Royal Courtyard", capacity: 600, price: 190000, facilities: "Open-air, Mandap Setup, Parking", availability: "Available", desc: "Traditional courtyard with jali architecture for cultural ceremonies.", img: "" },
    { id: "H6", name: "Jade Conference Suite", capacity: 120, price: 45000, facilities: "AC, Projector, Wi-Fi, Boardroom Table", availability: "Available", desc: "Purpose-built for corporate meetings and product launches.", img: "" }
  ];

  const PACKAGES = [
    { id: "P1", name: "Silver Package", type: "Wedding", price: 150000, desc: "Basic decor, standard catering for 200 guests, DJ for 4 hours." },
    { id: "P2", name: "Gold Package", type: "Wedding", price: 275000, desc: "Premium decor, multi-cuisine catering for 400 guests, live band, photography." },
    { id: "P3", name: "Diamond Package", type: "Wedding", price: 450000, desc: "Luxury decor, 5-course catering for 600 guests, drone photography, celebrity anchor." },
    { id: "P4", name: "Birthday Bash", type: "Birthday", price: 45000, desc: "Themed decor, cake, snacks and games for up to 80 guests." },
    { id: "P5", name: "Corporate Essentials", type: "Corporate", price: 60000, desc: "AV setup, seating for 120, tea/coffee service and working lunch." },
    { id: "P6", name: "Anniversary Special", type: "Anniversary", price: 85000, desc: "Candlelight decor, dinner for 100 guests, live music." }
  ];

  const CUSTOMER_NAMES = ["Rohan Mehta", "Priya Sharma", "Arjun Nair", "Sneha Kapoor", "Vikram Singh", "Ananya Rao", "Karan Malhotra", "Divya Iyer", "Rahul Verma", "Neha Gupta", "Aditya Joshi", "Pooja Reddy", "Manish Agarwal", "Kavya Pillai", "Siddharth Bose"];
  const EVENT_TYPES = ["Wedding", "Birthday Party", "Corporate Event", "Reception", "Anniversary"];
  const STATUSES = ["pending", "approved", "confirmed", "completed", "cancelled", "rejected"];

  function seedBookings() {
    const arr = [];
    const today = new Date();
    for (let i = 0; i < 32; i++) {
      const name = CUSTOMER_NAMES[i % CUSTOMER_NAMES.length];
      const hall = HALLS[i % HALLS.length];
      const pkg = PACKAGES[i % PACKAGES.length];
      const dayOffset = (i - 14) * 4;
      const evtDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayOffset);
      const status = STATUSES[i % STATUSES.length];
      arr.push({
        id: "BKG" + String(1000 + i),
        customer: name,
        phone: "98" + (10000000 + i * 137).toString().slice(0, 8),
        email: name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
        hall: hall.name,
        package: pkg.name,
        eventType: EVENT_TYPES[i % EVENT_TYPES.length],
        guests: 80 + (i % 10) * 45,
        eventDate: evtDate.toISOString().slice(0, 10),
        amount: pkg.price + (i % 3) * 15000,
        status: status,
        createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - (32 - i)).toISOString(),
        notes: "Advance paid via bank transfer. Decor theme to be finalised 2 weeks prior."
      });
    }
    return arr;
  }

  function seedGallery() {
    const cats = ["Weddings", "Birthdays", "Corporate", "Halls", "Decor"];
    const arr = [];
    for (let i = 1; i <= 12; i++) {
      arr.push({ id: "IMG" + i, caption: cats[i % cats.length] + " highlight " + i, category: cats[i % cats.length], type: i % 6 === 0 ? "video" : "image", img: "" });
    }
    return arr;
  }

  function seedTestimonials() {
    const arr = [
      { id: "T1", name: "Rohan Mehta", rating: 5, comment: "Grand Palace made our wedding absolutely magical. The Emerald Hall was breathtaking.", status: "approved" },
      { id: "T2", name: "Priya Sharma", rating: 4, comment: "Lovely venue and attentive staff. Catering could have had more variety.", status: "approved" },
      { id: "T3", name: "Karan Malhotra", rating: 5, comment: "Our corporate offsite ran flawlessly. Highly recommend the Jade Suite.", status: "pending" },
      { id: "T4", name: "Sneha Kapoor", rating: 3, comment: "Decent experience, parking was a bit crowded during peak hours.", status: "pending" },
      { id: "T5", name: "Vikram Singh", rating: 5, comment: "Best banquet hall in the city, hands down. Booking again for our anniversary.", status: "approved" },
      { id: "T6", name: "Ananya Rao", rating: 2, comment: "Service was slow during the event and AC took time to cool the hall.", status: "rejected" }
    ];
    return arr;
  }

  function seedEnquiries() {
    const arr = [];
    const subs = ["Wedding date availability", "Package pricing", "Site visit request", "Catering menu query", "Cancellation policy", "Corporate booking"];
    for (let i = 0; i < 14; i++) {
      const name = CUSTOMER_NAMES[(i + 3) % CUSTOMER_NAMES.length];
      arr.push({
        id: "ENQ" + (200 + i),
        name, email: name.toLowerCase().replace(/\s+/g, ".") + "@example.com",
        phone: "97" + (20000000 + i * 211).toString().slice(0, 8),
        subject: subs[i % subs.length],
        message: "Hello, I would like more information regarding " + subs[i % subs.length].toLowerCase() + " for an event we're planning.",
        date: new Date(Date.now() - i * 86400000).toISOString(),
        status: i % 4 === 0 ? "replied" : "new",
        reply: i % 4 === 0 ? "Thank you for reaching out — our team has shared full details over email." : ""
      });
    }
    return arr;
  }

  window.Adm_seedAll = function () {
    const Adm = window.Adm;
    Adm.seedIfEmpty("halls", HALLS);
    Adm.seedIfEmpty("packages", PACKAGES);
    Adm.seedIfEmpty("bookings", seedBookings());
    Adm.seedIfEmpty("gallery", seedGallery());
    Adm.seedIfEmpty("testimonials", seedTestimonials());
    Adm.seedIfEmpty("enquiries", seedEnquiries());
    Adm.seedIfEmpty("settings", {
      venueName: "Grand Palace", address: "Plot 12, Necklace Road, Hyderabad, Telangana 500001",
      phone: "+91 90000 12345", email: "info@grandpalace.example.com",
      facebook: "https://facebook.com/grandpalace", instagram: "https://instagram.com/grandpalace",
      map: "Necklace Road, Hyderabad", hours: "Mon–Sun: 9:00 AM – 9:00 PM",
      footer: "Grand Palace is Hyderabad's landmark party hall and banquet venue.",
      logo: "", favicon: ""
    });
    Adm.seedIfEmpty("profile", { name: "Admin User", email: "admin@grandpalace.example.com", photo: "", lastLogin: new Date().toISOString() });
  };
})();
