# 🎂 3D Harry Potter Birthday Cake Interactive Experience

[![Three.js](https://img.shields.io/badge/Three.js-r160-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> An immersive 3D web experience replicating the iconic **Harry Potter "Happee Birthdae" cake** given to Harry by Hagrid in *Harry Potter and the Sorcerer's Stone*. Complete with unboxing animations, Hedwig owl flight, noise-calibrated microphone candle blowing, 3D Hagrid character, and Hogwarts Great Hall atmosphere!

---

## ✨ Key Features & Magical Highlights

### 🧙‍♂️ 1. Authentic Movie Cake Replica
- **Hand-Piped Curved Text**: Giant bold green icing text reading `HAPPEE BIRTHDAE [YOUR NAME]`, curved along the top and bottom arcs of the cake.
- **Iconic Center Crack Line**: Realistically textured vertical cracked frosting running down the center of the pink icing, matching the original movie prop screenshot.
- **6 Candle Ring**: 6 glowing candles positioned around the outer rim so the front text remains 100% unobstructed.

### 🎁 2. Interactive Unboxing & Flying Hedwig
- **Gift Box Arrival**: The cake starts enclosed inside a vibrant Gryffindor crimson & glowing gold gift box.
- **Hedwig Snowy Owl**: Hedwig sits perched on top of the gift box bow, doing curious owl head-tilts.
- **Tap-to-Unbox**: Click or tap anywhere on screen to trigger Hedwig spreading her wings and slowly taking off into the night sky, while the gift box lid opens and the cake emerges onto the table with camera zoom!

### 🧙‍♂️ 3. 3D Rubeus Hagrid & Great Hall Atmosphere
- **3D Hagrid Character**: Detailed 3D model of Hagrid standing warmly beside the table, wearing his heavy moleskin coat, tunic, belt, face details, and a **3D floating Rubeus Hagrid parchment name tag**!
- **Hogwarts Feast Table**: Dark oak wood-grained feast table trimmed with concentric brass rings, Hogwarts runes, carved legs, and metal footings.
- **Ambient Floating Candles & Torch Lights**: 16 floating candles softly bobbing in the background under flickering torch lights and a twinkling starry sky.

### 🎤 4. Noise-Calibrated Microphone Candle Blowing + Tap Mode
- **Adaptive Room Noise Calibration**: Calibrates for 1.2 seconds upon start to measure ambient room/fan noise, dynamically setting a blow threshold above background hums.
- **Visual Volume Level Meter**: Live visual audio bar showing your breath/voice volume energy in real-time.
- **Smoke Particles & Sound Effects**: Extinguishing each candle spawns realistic smoke puffs with custom Web Audio whoosh and magic chime sounds.
- **Tap-to-Blow Button**: Prominent fallback button with animated green pulse rings for devices without microphones.

### 🎈 5. Age-Customized Magical Wishes & Confetti
- **Personalized Wishes**: Displays custom age-bracket magical birthday wishes (Level Wizard for kids, Chapter XX for 20s, Archmage for 50+).
- **Hogwarts Confetti Celebration**: Golden stars, lightning bolt shapes (⚡), circles, and magic confetti raining down upon completing the blow!
- **Celebrate Again Replay**: Clean restart button to replay the experience anytime.

---

## 🚀 Live Demo

Check out the live website on GitHub Pages:
**[https://jaivishmishra.github.io/Birthday-Cake-3D/](https://jaivishmishra.github.io/Birthday-Cake-3D/)**

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jaivishmishra/Birthday-Cake-3D.git
   cd Birthday-Cake-3D
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your web browser!

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deploying to GitHub Pages

To make this project live on your GitHub repository:

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - 3D Harry Potter Birthday Cake Web App"
   git branch -M main
   git remote add origin https://github.com/jaivishmishra/Birthday-Cake-3D.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings on GitHub: `https://github.com/jaivishmishra/Birthday-Cake-3D/settings/pages`
   - Under **Build and deployment** -> **Source**, select **GitHub Actions** (or select `main` branch / `dist` folder).
   - Your site will be live at `https://jaivishmishra.github.io/Birthday-Cake-3D/`!

---

## 🎨 Tech Stack & Libraries

- **3D Graphics Engine**: [Three.js](https://threejs.org/) (WebGL, Custom Shaders, Lighting, OrbitControls)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`, `BiquadFilterNode`)
- **Styling & UI**: Vanilla CSS3 (Glassmorphism, CSS Animations, Responsive Layout)

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

*Created with magic for Harry Potter fans worldwide! ✨*
