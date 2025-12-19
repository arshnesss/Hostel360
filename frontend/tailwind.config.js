  // frontend/tailwind.config.js (Ensure this is correct)

  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {},
    },
    // CRITICAL: Add daisyui plugin here
    plugins: [require("daisyui")],
    
    // CRITICAL: Configure DaisyUI for theme switching
    daisyui: {
      themes: ["light", "dark"],
      // This setting ensures DaisyUI listens to the data-theme attribute on the root HTML tag.
      // Which is exactly what your Navbar.jsx JS code does.
      darkTheme: "dark", 
      logs: false, // Optional: disables console warnings
    },
  }