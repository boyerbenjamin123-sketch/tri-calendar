# TriCalendar PWA : test local
    cd tricalendar
    node scripts/build-ics.mjs      # génère data/tricalendar.ics (+ met à jour updatedAt)
    python3 -m http.server 8080     # ou: npx serve
Ouvre http://localhost:8080 (le service worker fonctionne sur localhost).
Test hors-ligne : ouvre une fois la page, DevTools > Network > Offline, recharge.
Ici index.html est une version de test minimale (CSS simplifié, 8 courses d'exemple).
Dans ton vrai projet, applique les patchs a-e sur ton TriCalendar_2026.html.
