---
inclusion: always
---

## Clarification and Planning Phase
Before proceeding with any implementation, follow this strict sequence to ensure all work is based on a complete understanding rather than assumptions:

* **Ambiguity Analysis:** Carefully analyze the request for ambiguities, missing information, or multiple implementation paths.
* **Sequential Questioning:** Ask specific clarifying questions one at a time. Get a definitive answer for each before moving to the next question until no ambiguity remains.
* **Security Analysis Enforcement:** Any request involving security analysis must be assessed against MITRE ATT&CK techniques and OWASP Top 10 risks. Incorporate recognized threat models, vulnerability classifications, and secure design principles. Reference: https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/
* **Implementation Planning:** Create a detailed plan for the changes. This plan will undergo a short discussion for any necessary refinements or agreement.
* **Task Breakdown:** Once the plan is agreed upon, break the work down into a list of atomic tasks.
* **Final Authorization:** Present the task list for review and obtain an explicit "go ahead" before starting any implementation work.

---

## Branch Management
Maintain a structured branching workflow to ensure the integrity of the default branch:

* **Feature Branches:** Always work within a feature branch. No commits are permitted directly to the default branch.
* **Naming Convention:** Create new branches using the format: `issue-<ticket-id>-<short-description>`.
* **Issue Linkage:** Extract the issue number from the branch name to use in the `refs:` section of commit messages.

---

## Implementation and Quality Control
During the implementation phase, maintain high standards for code integrity, documentation, and clean code principles:

* **Build Integrity:** Ensure the application builds successfully without any fixable errors or warnings before moving toward the commit stage.
* **Regression Prevention:** When making changes to shared code, ensure that other code references or dependencies are not negatively affected to avoid regression bugs.
* **Clean Code Standards:** Do not introduce magic numbers, magic strings, or inline styles. Define meaningful named constants, enums, or configuration values instead. Centralize reusable values and use self-describing names that express intent.
* **Testing Requirements:** Always generate or update existing unit tests. Include the relevant tests in the corresponding commit.
* **Test Naming Convention:** All generated tests must follow the naming pattern: `{MethodName}_Should{doSomething}_When{Condition}`.
* **Documentation Synchronization:** Update any documentation affected by code changes (such as DB schemas or internal instructions) to ensure it remains accurate and up to date.
* **Pre-Commit Verification:** When implementation is complete, notify the user to allow for testing before any work is committed.

---

## Commit Requirements
Adhere to these standards to ensure a clean and traceable version history:

* **Authorization to Commit:** Do not perform any commits unless explicit permission has been granted to commit the work.
* **Atomic Commits:** Break the work into small, atomic chunks so that each commit implements or fixes exactly one thing.
* **Documentation and Test Inclusion:** Always include related documentation changes and unit tests within the same commit as the code changes they describe.
* **Commit Specifications:** Always use the [Conventional Commit specifications](https://www.conventionalcommits.org/en/v1.0.0/#specification).
* **Message Formatting:** Use the imperative mode for the commit summary and include a detailed description of the changes.
* **Issue Tracking:** Include a reference (e.g., `refs: WT-1234`) at the end of the commit, utilizing the issue number extracted from the branch name.

---

## MCP Server Protocols
You must utilize specific documentation servers when the task involves the following technologies:

* **Microsoft Stack:** For any work involving C#, ASP.NET Core, Microsoft.Extensions, NuGet, Entity Framework, Blazor, or the dotnet runtime, use the `microsoft.docs.mcp` server to retrieve the latest official information.
* **External & UI Components:** For tasks involving external components (e.g., Mermaid, Redis, React) or UI components without a specified toolkit, use the `ask_question` tool from DeepWiki’s MCP or `query_docs` from the Context7 MCP to find correct implementation patterns before writing code.