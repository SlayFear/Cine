@AGENTS.md

# Verificación de cambios en el front

No tomes capturas de pantalla (Playwright, chromium-cli, etc.) para verificar cambios visuales de rutina — consume mucho tiempo y tokens. Para confirmar que un cambio se aplicó, usa `curl` contra el dev server y revisa el HTML/texto resultante (grep), o simplemente confía en el código si compila y pasa lint/typecheck. Solo toma una captura si el usuario la pide explícitamente o si es la única forma de verificar algo genuinamente visual (layout, alineación, etc.) que no se puede confirmar de otra forma.
