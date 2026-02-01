# Life's Plain Lessons

## The Quiet Strength of Simplicity

Markdown strips away the noise. No flashing colors or fancy fonts—just words, arranged with care. Life's lessons work the same way. They arrive plain, often in a quiet moment: a kind word from a friend, the weight of a mistake, or the warmth of a shared meal. We don't need fanfare to learn. On February 1, 2026, amid the rush of new tech and endless feeds, I find comfort in this. The deepest truths fit on a single page, easy to read, impossible to ignore.

## Building with Headings and Lists

Think of your days as a document. Headings mark the chapters—work, family, quiet walks. Bullet points capture the small wins:

- A deep breath before speaking.
- Listening without planning your reply.
- Noticing the light shift at dusk.

These structures hold chaos together. They remind us lessons aren't random; they're built, one line at a time. I've revisited old notes from years past, tweaking them as I grow. What felt heavy then now guides gently.

## Rendering What Lasts

Markdown waits to be rendered—turned into something visible, shared. Our lessons do too. We hold them inside until a conversation or journal entry brings them alive. They're not finished products but living drafts, open to revision. In sharing, they help others, creating a quiet chain of understanding.

*Simplicity doesn't shout; it settles into the heart, line by line.*

Here is the text from the image formatted as a Markdown document.

## Workflow Orchestration

### 1. Plan Mode Default

* Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
* If something goes sideways, STOP and re-plan immediately – don't keep pushing
* Use plan mode for verification steps, not just building
* Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

* Use subagents liberally to keep main context window clean
* Offload research, exploration, and parallel analysis to subagents
* For complex problems, throw more compute at it via subagents
* One task per subagent for focused execution

### 3. Self-Improvement Loop

* After ANY correction from the user: update `tasks/lessons.md` with the pattern
* Write rules for yourself that prevent the same mistake
* Ruthlessly iterate on these lessons until mistake rate drops
* Review lessons at session start for relevant project

### 4. Verification Before Done

* Never mark a task complete without proving it works
* Diff behavior between main and your changes when relevant
* Ask yourself: "Would a staff engineer approve this?"
* Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

* For non-trivial changes: pause and ask "is there a more elegant way?"
* If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
* Skip this for simple, obvious fixes – don't over-engineer
* Challenge your own work before presenting it

### 6. Autonomous Bug Fixing

* When given a bug report: just fix it. Don't ask for hand-holding
* Point at logs, errors, failing tests – then resolve them
* Zero context switching required from the user
* Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

* **Simplicity First**: Make every change as simple as possible. Impact minimal code.
* **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
* **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.
