# design

Record what implementation will follow: solution structure, interfaces, data flow and failure behavior, each decision with a one-line reason. Expand the selected option. Keep it short: decisions another person can review before implementation, not prose. No diffs/edits.

When the project asks for separate design, test-plan or security/privacy documents (its own templates or conventions), produce them where the project keeps its docs, alongside the short record:

- test plan: scenarios, success criteria and how each is exercised. The surface decides the method: UI changes run real browser flows, including loading, error, visual and accessibility states; backend changes run through the real interface, covering responses, permissions, data changes, failures and side effects; cross-stack changes also test the connection end to end. Test what the change needs, never a fixed checklist.
- security/privacy: what data moves or is stored, permissions, threats, mitigations and what stays open.

Test-plan and security/privacy requirements shape the design before it is approved; they are not appendices written after. review checks the work against these documents; verify executes the test plan and reports every gap.
