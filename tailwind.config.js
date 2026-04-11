/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        irishGrover: ["IrishGrover_400Regular"],
        itim: ["Itim_400Regular"]
      }
    },
  },
  plugins: [],
}

