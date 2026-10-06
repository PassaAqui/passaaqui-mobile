/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        irishGrover: ["IrishGrover_400Regular"],
        itim: ["Itim_400Regular"],
        inter: ["Inter_400Regular"],
        interBold: ["Inter_700Bold"],
        interItalic: ["Inter_400Regular_Italic"]
      }
    },
  },
  plugins: [],
}

