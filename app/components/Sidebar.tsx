"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    // Only access pathname on the client side
    setPathname(window.location.pathname);
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <aside 
      className="w-64 p-6 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0 bg-white dark:bg-gray-800 overflow-y-auto"
      aria-label="Main navigation"
    >
      <nav className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">🧑‍🌾 Cultivation Coach</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/coach"
                className={`block px-3 py-2 rounded-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isActive("/coach")
                    ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100 font-medium shadow-sm"
                    : "text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 hover:translate-x-1"
                }`}
                aria-current={isActive("/coach") ? "page" : undefined}
              >
                Dashboard
              </Link>
            </li>
            {[
              { path: "/coach/species-advisor", label: "🍄 Species Advisor" },
              { path: "/coach/substrate-advisor", label: "🌾 Substrate Advisor" },
              { path: "/coach/environment-advisor", label: "🌡️ Environment Advisor" },
              { path: "/coach/troubleshooting-advisor", label: "🔧 Troubleshooting" },
              { path: "/coach/grow-planner", label: "📋 Grow Planner" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-3 py-2 rounded-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    isActive(item.path)
                      ? "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100 font-medium shadow-sm"
                      : "text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 hover:translate-x-1"
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Advanced</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/advanced"
                className={`block px-3 py-2 rounded-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  isActive("/advanced")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium shadow-sm"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:translate-x-1"
                }`}
                aria-current={isActive("/advanced") ? "page" : undefined}
              >
                Overview
              </Link>
            </li>
            {[
              { path: "/advanced/environmental-control", label: "Environmental Control" },
              { path: "/advanced/substrate-engineering", label: "Substrate Engineering" },
              { path: "/advanced/species-ecology", label: "Species Ecology" },
              { path: "/advanced/contamination-ecology", label: "Contamination Ecology" },
              { path: "/advanced/fruiting-chamber-design", label: "Fruiting Chamber Design" },
              { path: "/advanced/yield-optimization", label: "Yield Optimization" },
            ].map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block px-3 py-2 rounded-md transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    isActive(item.path)
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium shadow-sm"
                      : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 hover:translate-x-1"
                  }`}
                  aria-current={isActive(item.path) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Beginner Pathway</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/beginner-pathway"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/beginner-pathway")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Overview
              </Link>
            </li>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <li key={step}>
                <Link
                  href={`/beginner-pathway/step-${step}`}
                  className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                    isActive(`/beginner-pathway/step-${step}`)
                      ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                      : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  }`}
                >
                  Step {step}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Foundations</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/foundations/overview"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/overview")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/what-is-mycelium"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/what-is-mycelium")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                What Is Mycelium?
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/what-is-a-mushroom"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/what-is-a-mushroom")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                What Is A Mushroom?
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/life-cycle"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/life-cycle")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Life Cycle
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/ecology"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/ecology")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Ecology
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/fungal-ecology"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/fungal-ecology")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Fungal Ecology
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/systems-thinking"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/systems-thinking")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Systems Thinking
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/beginners-mindset"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/beginners-mindset")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Beginner's Mindset
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/clean-technique"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/clean-technique")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Clean Technique
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/sterile-technique"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/sterile-technique")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Sterile Technique
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/contamination-ecology"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/contamination-ecology")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Contamination Ecology
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/environmental-parameters"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/environmental-parameters")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Environmental Parameters
              </Link>
            </li>
            <li>
              <Link
                href="/foundations/substrates"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/foundations/substrates")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Substrates
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Growing Guides</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/growing-guides/oyster"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/oyster")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Oyster
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/lions-mane"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/lions-mane")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Lion's Mane
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/reishi"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/reishi")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Reishi
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/shiitake"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/shiitake")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Shiitake
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/chestnut"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/chestnut")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Chestnut
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/cordyceps"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/cordyceps")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Cordyceps
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/enoki"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/enoki")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Enoki
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/king-oyster"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/king-oyster")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                King Oyster
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/pioppino"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/pioppino")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Pioppino
              </Link>
            </li>
            <li>
              <Link
                href="/growing-guides/turkey-tail"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/growing-guides/turkey-tail")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Turkey Tail
              </Link>
            </li>
            <li>
              <Link
                href="/guides/lions-mane"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/guides/lions-mane")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Lion's Mane (Advanced)
              </Link>
            </li>
            <li>
              <Link
                href="/guides/oyster-mushrooms"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/guides/oyster-mushrooms")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Oyster Mushrooms (Advanced)
              </Link>
            </li>
            <li>
              <Link
                href="/guides/reishi"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/guides/reishi")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Reishi (Advanced)
              </Link>
            </li>
            <li>
              <Link
                href="/guides/shiitake"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/guides/shiitake")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Shiitake (Advanced)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Troubleshooting</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/troubleshooting/overview"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/overview")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/slow-colonization"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/slow-colonization")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Slow Colonization
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/no-pins"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/no-pins")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                No Pins
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/side-pinning"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/side-pinning")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Side Pinning
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/aborts"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/aborts")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Aborts
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/bacterial-contamination"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/bacterial-contamination")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Bacterial Contamination
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/drying-caps"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/drying-caps")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Drying Caps
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/fuzzy-feet"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/fuzzy-feet")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Fuzzy Feet
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/green-mold"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/green-mold")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Green Mold
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/odd-fruit-shapes"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/odd-fruit-shapes")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Odd Fruit Shapes
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/overlay"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/overlay")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Overlay
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/search"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/search")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Search
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/stalled-fruiting"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/stalled-fruiting")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Stalled Fruiting
              </Link>
            </li>
            <li>
              <Link
                href="/troubleshooting/yellowing-mycelium"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/troubleshooting/yellowing-mycelium")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Yellowing Mycelium
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Medicinal Mushrooms</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/medicinal-mushrooms/lions-mane"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/lions-mane")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Lion's Mane
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/reishi"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/reishi")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Reishi
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/preparation"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/preparation")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Preparation Methods
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/chaga"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/chaga")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Chaga
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/cordyceps"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/cordyceps")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Cordyceps
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/maitake"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/maitake")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Maitake
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/reishi-vs-turkey-tail"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/reishi-vs-turkey-tail")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Reishi vs Turkey Tail
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/shiitake"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/shiitake")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Shiitake
              </Link>
            </li>
            <li>
              <Link
                href="/medicinal-mushrooms/turkey-tail"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/medicinal-mushrooms/turkey-tail")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Turkey Tail
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Visualization</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/graph"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/graph")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                🕸️ Knowledge Graph
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Intelligence</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/intelligence"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/intelligence")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                🧠 Intelligence Layer
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tools</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/tools/cultivation-system-map"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/tools/cultivation-system-map")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Cultivation System Map
              </Link>
            </li>
            <li>
              <Link
                href="/tools/species-comparison-matrix"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/tools/species-comparison-matrix")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Species Comparison Matrix
              </Link>
            </li>
            <li>
              <Link
                href="/tools/substrate-selector"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/tools/substrate-selector")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Substrate Selector
              </Link>
            </li>
            <li>
              <Link
                href="/tools/troubleshooting-decision-tree"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/tools/troubleshooting-decision-tree")
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-medium"
                    : "text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                }`}
              >
                Troubleshooting Decision Tree
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">🌱 Community</h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/community"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/community")
                    ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium"
                    : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                }`}
              >
                Hub
              </Link>
            </li>
            <li>
              <Link
                href="/community/grow-logs"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/community/grow-logs")
                    ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium"
                    : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                }`}
              >
                Grow Logs
              </Link>
            </li>
            <li>
              <Link
                href="/community/notes"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/community/notes")
                    ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium"
                    : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                }`}
              >
                Notes
              </Link>
            </li>
            <li>
              <Link
                href="/community/shared-insights"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/community/shared-insights")
                    ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium"
                    : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                }`}
              >
                Shared Insights
              </Link>
            </li>
            <li>
              <Link
                href="/community/guidelines"
                className={`block px-3 py-2 rounded-md transition-colors text-sm ${
                  isActive("/community/guidelines")
                    ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100 font-medium"
                    : "text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                }`}
              >
                Guidelines
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}