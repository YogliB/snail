# verify

exercise end-to-end user behavior, not just tests. No real messages, posts, purchases or bookings without explicit approval; use local/sandbox checks. Report each step and overall PASS/FAIL/blocked; first failure stops, never auto-fix. When the project has a test plan, execute it and report every gap against it. Code changed after a FAIL goes back through review, then is verified again. PASS needs observed feature behavior; logs/tests only support it.
