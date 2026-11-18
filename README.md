# Responsive Cab Booking Application

### A Modern, Interactive & Responsive Cab Booking Experience

A responsive cab booking web application developed using **Next.js, React, TypeScript, and Tailwind CSS**.

This project demonstrates a modern transportation booking interface with interactive ride booking, automatic ride ID generation, booking history, and browser-based data persistence.

Developed as part of the **UI/UX Design Internship at Pynexia Technology**.

---

## 📖 Project Overview

The Responsive Cab Booking Application is designed to provide users with an intuitive and seamless cab booking experience.

The application focuses on modern UI/UX principles, responsive layouts, intuitive navigation, and interactive booking functionality.

Users can select their pickup and destination locations, choose a cab, confirm their booking, and review their previous rides.

The project demonstrates a functional frontend experience without requiring a production database or external booking service.

---

## ✨ Key Features

### 🚖 1. Interactive Cab Booking

- Select pickup and destination locations.
- Explore available cab options.
- View estimated ride fares.
- Confirm cab bookings.
- Receive booking confirmation.

### 🆔 2. Automatic Ride ID Generation

- Every confirmed booking generates a unique ride ID.
- Ride IDs are associated with individual bookings.
- Booking information remains consistent throughout the application.

### 📜 3. Dynamic Ride History

- Newly created bookings appear in Ride History.
- Ride History remains empty until a booking is created.
- Users can review their previous bookings.
- Each booking displays its associated ride details.
- Bookings are displayed with their corresponding ride IDs.

**Important:** New users will not see previously generated booking records. Ride History is populated only after they successfully book a ride.

### 💾 4. Browser-Based Data Persistence

- Booking records are stored using browser localStorage.
- Booking history persists after refreshing the website.
- No external database configuration is required for the demonstration.
- Data remains specific to the user's browser and storage environment.

### 📱 5. Responsive User Interface

- Responsive layouts for desktop, tablet, and mobile devices.
- Modern interface components.
- Consistent typography and visual hierarchy.
- Intuitive navigation and interactive elements.

### 🎨 6. UI/UX-Focused Design

- Clean and modern visual presentation.
- User-friendly booking workflow.
- Organized information architecture.
- Interactive interface components.
- Consistent styling throughout the application.

---

## 🛠️ Technology Stack

| Technology   | Purpose                           |
| ------------ | --------------------------------- |
| Next.js      | React-based application framework |
| React        | Component-based user interface    |
| TypeScript   | Type-safe application development |
| Tailwind CSS | Responsive styling                |
| LocalStorage | Browser-based booking persistence |
| Git          | Version control                   |
| GitHub       | Source code hosting               |

---

## 🚀 Getting Started

### Prerequisites

Ensure that Node.js and npm are installed on your system.

### 1. Clone the Repository

```bash
git clone https://github.com/swarajtech15/responsive-cab-booking-application.git
```

### 2. Navigate to the Project Directory

```bash
cd responsive-cab-booking-application
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open the Application

Visit:

`http://localhost:3000`

The application should now be accessible in your browser.

---

## 🔄 Application Workflow

The application follows a straightforward booking process:

**Home → Select Pickup → Choose Destination → Select Cab → Confirm Booking → Generate Ride ID → View Ride History**

### Booking Process

1. Open the application.
2. Select your pickup location.
3. Choose your destination.
4. Select an available cab.
5. Review the booking details.
6. Confirm your ride.
7. Receive a unique booking ID.
8. Navigate to Ride History to review the booking.

### Ride History Behavior

When a user opens the application for the first time, Ride History initially contains no bookings.

After a successful booking, the application stores the ride information and displays it in Ride History.

Additional bookings are added to the history without replacing previous records.

Booking records remain available after refreshing the page, provided the browser's localStorage data has not been cleared.

---

## 📂 Project Structure

```text
responsive-cab-booking-application/
│
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── lib/
│
│
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── README.md
```

_The structure may vary slightly depending on the final implementation._

---

## ⚠️ Project Limitations

This application is developed primarily for UI/UX demonstration and educational purposes.

- It does not provide real-world cab dispatch services.
- Ride bookings are simulated.
- Booking information is stored locally in the browser.
- Ride history is not synchronized across different devices.
- Clearing browser storage may remove saved bookings.
- No real payment processing or driver assignment is implemented.

The objective is to demonstrate an interactive and realistic cab booking experience rather than operate a commercial transportation platform.

---

## 🎯 Project Objectives

- Design a modern and responsive cab booking interface.
- Implement an intuitive booking workflow.
- Demonstrate dynamic ride history functionality.
- Improve frontend development and UI/UX design skills.
- Apply reusable component-based development practices.
- Deliver a functional interactive web application.

---

## 👨‍💻 Developer

**Swaraj Chandurkar**

UI/UX Design

GitHub: [@swarajtech15](https://github.com/swarajtech15)

---

## 📌 Project Information

**Project:** Responsive Cab Booking Application  
**Category:** UI/UX Design & Frontend Development  
**Framework:** Next.js  
**Language:** TypeScript  
**Styling:** Tailwind CSS  
**Purpose:** Educational & UI/UX Demonstration

---

## 📄 Disclaimer

This project is created for educational and internship demonstration purposes. It is not affiliated with any commercial cab booking service.

---

**Designed and Developed by Swaraj Chandurkar**

_Learning • Designing • Developing_
