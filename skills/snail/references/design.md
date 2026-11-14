# design

Record what implementation will follow: solution structure, interfaces, data flow and failure behavior, each decision with a one-line reason. Expand the selected option. Keep it short: decisions another person can review before implementation, not prose.

When the project asks for separate design, test-plan or security/privacy documents (its own templates or conventions), produce them where the project keeps its docs, alongside the short record:

- test plan: scenarios, success criteria, which automated tests to write, and how the finished feature is exercised. Automated tests are written and run during implementation; exercising the finished feature is a separate check that it really works, not a substitute for tests. Which tests fit depends on the change's surface (UI, backend or both), the project's conventions and the user's judgment - details live in project templates, never a fixed universal list.
- security/privacy: what data moves or is stored, permissions, threats, mitigations and what stays open.

Test-plan and security/privacy requirements shape the design before it is approved; they are not appendices written after. review checks the work against these documents; verify executes the test plan and reports every gap. These requested documents are the only files this stage writes; no other diffs/edits.
