# design

Record what implementation will follow: solution structure, interfaces, data flow and failure behavior, each decision with a one-line reason. Expand the selected option. Keep it short: decisions another person can review before implementation, not prose. The record itself stays in the conversation.

Weigh the design's own security and privacy risks - trust boundaries, permissions, sensitive data and abuse cases - whether or not the project asks for a separate document.

Write a separate design, test-plan or security/privacy document only when the user or the project explicitly asks - a stated request or a documented project convention; template files alone are not a request. Produce it where the project keeps its docs. For each document's structure, read the matching template from the snail directory in the XDG state path (`$XDG_STATE_HOME/snail/templates/`, or `~/.local/state/snail/templates/` when that is unset, empty or relative); when there is none, use the built-in templates under `templates/` next to this file. The user can always name a different template for the task. Each document covers:

- test plan: scenarios, success criteria, which automated tests to write, and how the finished feature is exercised. Automated tests are written and run during implementation; exercising the finished feature is a separate check that it really works, not a substitute for tests. Which tests fit depends on the change's surface (UI, backend or both), the project's conventions and the user's judgment - details live in the resolved template, never a fixed universal list.
- security/privacy: what data moves or is stored, permissions, threats, mitigations and what stays open.

Test-plan and security/privacy requirements shape the design before it is approved; they are not appendices written after. review checks the work against these documents; verify executes the test plan, stops at the first failure and reports what was left not run. These requested documents are the only files this stage writes; no other diffs/edits.
