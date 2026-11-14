# design

Record what implementation will follow: solution structure, interfaces, data flow and failure behavior, each decision with a one-line reason. Expand the selected option. Keep it short: decisions another person can review before implementation, not prose. No diffs/edits.

When the project asks for separate design, test-plan or security/privacy documents (its own templates or conventions), produce them where the project keeps its docs, alongside the short record:

- test plan: scenarios, success criteria, which automated tests to write, and how the finished feature is exercised. The surface decides the method: UI - logic, component and interaction tests, browser tests for critical flows, visual regression when relevant, plus real browser flows including loading, error, visual and accessibility states. Backend - logic, DB/service integration, API contract, permission and failure-case tests, plus real runs through the actual interface covering responses, data changes and side effects. Cross-stack - also tests for the connection between layers and an end-to-end check. Automated tests are written and run during implementation; exercising the finished feature is a separate check that it really works, not a substitute for tests. Choose by the change, its risks and the project's existing infrastructure - never a fixed checklist.
- security/privacy: what data moves or is stored, permissions, threats, mitigations and what stays open.

Test-plan and security/privacy requirements shape the design before it is approved; they are not appendices written after. review checks the work against these documents; verify executes the test plan and reports every gap.
