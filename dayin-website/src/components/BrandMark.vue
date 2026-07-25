<template>
  <svg class="brand-mark-icon" viewBox="0 0 48 48" role="img" aria-label="向日葵">
    <defs>
      <linearGradient id="c4-grad-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFDF0" />
        <stop offset="100%" stop-color="#FFF4D0" />
      </linearGradient>
      <linearGradient id="c4-grad-printer" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2F7D46" />
        <stop offset="100%" stop-color="#1C532E" />
      </linearGradient>
      <filter id="c4-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-color="#1C532E" flood-opacity="0.18" />
      </filter>
    </defs>
    <!-- Background rectangle to override container background with gradient -->
    <rect x="0" y="0" width="48" height="48" fill="url(#c4-grad-bg)" />
    <!-- Printer Group with Shadow -->
    <g filter="url(#c4-shadow)">
      <!-- Top Paper -->
      <rect x="15" y="10" width="18" height="4" rx="0.5" fill="#2F7D46" opacity="0.85" />
      <!-- Paper Out -->
      <g>
        <!-- White paper sheet coming out -->
        <rect x="15" y="26" width="18" height="12" rx="0.5" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="0.5" />
        <!-- Small sunflower emblem on paper -->
        <circle cx="24" cy="32" r="1.8" fill="#FBBF24" />
        <circle cx="24" cy="32" r="0.8" fill="#78350F" />
        <!-- Petals -->
        <circle cx="24" cy="29.7" r="0.5" fill="#FBBF24" />
        <circle cx="24" cy="34.3" r="0.5" fill="#FBBF24" />
        <circle cx="21.7" cy="32" r="0.5" fill="#FBBF24" />
        <circle cx="26.3" cy="32" r="0.5" fill="#FBBF24" />
        <circle cx="22.4" cy="30.4" r="0.5" fill="#FBBF24" />
        <circle cx="25.6" cy="33.6" r="0.5" fill="#FBBF24" />
        <circle cx="22.4" cy="33.6" r="0.5" fill="#FBBF24" />
        <circle cx="25.6" cy="30.4" r="0.5" fill="#FBBF24" />
      </g>
      <!-- Printer Body -->
      <path d="M 12 14 h 24 a 4 4 0 0 1 4 4 v 12 h -4 v -4 H 12 v 4 H 8 V 18 a 4 4 0 0 1 4 -4 Z" fill="url(#c4-grad-printer)" />
    </g>
    <!-- LED Light -->
    <circle cx="34" cy="20" r="1.5" fill="#10B981" />
  </svg>
</template>

<style scoped>
.brand-mark-icon {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
