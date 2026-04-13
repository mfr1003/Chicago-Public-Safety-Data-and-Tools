Clearpath — Mission, Philosophy & Design Record
> This document captures the thinking behind every major decision in this project.
> Code can be rewritten. This is harder to reconstruct. Read it before you change anything.
---
What This Is
Clearpath is a free, AI-assisted benefits navigator. It helps anyone find the government programs, resources, and assistance they qualify for — and generates pre-filled application forms so they walk into the office with most of the work already done.
It is not affiliated with any government agency, religious organization, political party, or ideology.
It has no login. It collects no sensitive data. It costs nothing to use.
---
Why It Exists
The information about available benefits is public. The programs exist. The money is allocated. The problem is navigation — 11 different agency websites, 11 different application processes, each requiring the same information typed in fresh, while managing whatever crisis brought someone to this point in the first place.
A person experiencing housing instability does not have the bandwidth to spend three days researching SNAP eligibility requirements, finding the county office, downloading the form, and figuring out which documents to bring. That is a full-time job. Clearpath collapses it to one conversation.
---
Who It Is For
Everyone. Without exception.
This is not rhetorical. It is the central design constraint.
Poverty is not an identity. People cycle in and out of financial crisis from all walks of life at any time. One person doesn't need housing assistance today but might need unemployment benefits. Another is a veteran who doesn't know what they qualify for. Another is a middle-class person whose situation changed overnight.
The existing ecosystem has gaps that this project exists to fill:
A disproportionate number of people experiencing homelessness and poverty are LGBTQ — estimates put LGBTQ youth at roughly 40% of the homeless youth population despite being approximately 7% of the general population. A significant portion of the infrastructure meant to catch people in crisis has religious affiliations that create ideological filters. A tool with no organizational affiliation, no intake screening, no pastor's signature required is not a nice-to-have for that population. For some of them, it is one of the only options that does not require them to be a palatable version of themselves to receive help.
Undocumented people in the current political climate face existential risk from institutional contact. A tool that explicitly collects no immigration status, no sensitive identifiers, and stores nothing server-side is meaningfully different from anything that requires an account or organizational intake.
People in domestic violence situations. People in mental health crisis. People who have been burned by institutions before and have reasonable skepticism of anything that asks for their information.
The design answer to all of these populations is the same: ask for less, store nothing, judge no one.
---
The Core Privacy Promise
This is not a marketing claim. It is an architectural commitment.
What we collect:
- First name (optional — nickname or nothing is fine)
- State and county
- Household size (a number, not names)
- Rough housing situation
- Rough employment situation
- Which documents they currently have in hand
- Which benefits they're already receiving
What we never collect:
- Social Security Numbers
- Income amounts
- Immigration status
- Medical information
- Sexual orientation or gender identity
- Criminal history
- Anything that could harm someone if intercepted
Where data lives:
- The conversation happens between the user's browser and our server, then to Anthropic's API. Message content passes through Anthropic's systems — this is stated plainly to users before they type anything.
- Session data (the conversation, the profile built during it) lives in the browser's sessionStorage only. It never touches our database because we have no database. It disappears when the tab closes.
- We log nothing from user conversations on our servers.
The form model is the mechanism that makes this work:
Instead of collecting sensitive information and filling forms completely, Clearpath pre-fills everything that could be found with a web search — program addresses, eligibility criteria explained in plain language, publicly-known fields — and leaves clearly labeled blank lines for the sensitive parts. The user fills those in themselves, with a pen, before they walk into the office.
The result: a person walks in with a form that looks almost complete. The caseworker sees someone prepared and organized. The user only had to provide the sensitive information once, in person, to the actual agency — not to a website they found somewhere.
---
The Design Philosophy
- No gatekeeping
    There is no income verification to use this tool. There is no proof-of-need. There is no account creation, no phone number verification, no email confirmation. Anyone who opens the URL can use it immediately.
    This is intentional. Designing intake screens to filter who "deserves" help is exactly the problem we are trying to work around.
- One conversation, not eleven forms
    The intake is a conversation with Maya, not a form. Maya asks one question at a time, acknowledges what she hears, and builds a picture gradually. She does not present a 47-field intake form. She does not use bureaucratic language. She is a knowledgeable friend helping someone navigate a confusing system.
- The sensitive stuff stays with the user
    SSNs, income figures, immigration status — these stay in the user's head or their pocket. We never touch them. This is not just a privacy decision; it is a trust decision. Asking for less is how you earn the trust of people who have been burned before.
- Plain language, always
    The people who need this most are often dealing with high stress, limited time, possible language barriers, and possible literacy challenges. Every piece of text in this application — Maya's responses, the form instructions, the document checklists — should be readable by someone in crisis on a library computer with 20 minutes left on their session.
    If a sentence needs to be re-read twice, it needs to be rewritten.
- Crisis first, forms second
    If someone mentions they have nowhere to sleep tonight, or they haven't eaten, or they're in danger — Maya addresses that first. Always. The intake questions wait. The answer is: call 2-1-1 right now for emergency resources. Everything else comes after.
- Open source by necessity, not convention
    The privacy promise has to be verifiable. "We don't store your data" is meaningless as a policy statement to someone who has reason to distrust institutions. It means something when a skeptical person can read the code and confirm it themselves. The repository is public from day one for this reason.
---
Distribution Strategy
There is no app store. There is no marketing budget. There is no organization pushing this.
The distribution model is a URL and a QR code.
Printed. Taped up at:
- Public library bulletin boards
- Laundromat community boards
- Free clinic waiting rooms
- Harm reduction drop-in centers
- Food bank lines
- Community center bulletin boards
These are secular, low-threshold access points. No organization filters who walks in. Anyone with a phone can scan the code.
The population most likely to need this urgently is also the population least likely to find it through conventional channels. The QR code is the answer to that problem. It is low-tech on purpose.
---
What Already Exists (and Why This Is Still Needed):
211, Findhelp.org (formerly Aunt Bertha), BenefitsCal, GetCalFresh — these are real, funded, staffed organizations doing important work. They have legal review, state partnerships, and actual case workers.
This project does not compete with them. It fills a gap they cannot fill:
- They require varying degrees of intake and account creation
- Many rely on partnerships with organizations that have their own eligibility criteria
- The AI-assisted conversational intake that removes the navigation burden is genuinely new
- The pre-filled form generation — handling everything that isn't sensitive so the user only fills in what must be private — doesn't exist elsewhere at this level
The Trevor Project, PFLAG chapters, ACLU state affiliates, and LGBTQ community centers are secular, affirming organizations that serve the populations most underserved by the existing ecosystem. They are natural allies, not competitors.
---
Sustainability:
The only ongoing cost is Anthropic API usage.
At current pricing, a full conversation costs roughly $0.01–0.03. At 1,000 monthly users, that's $10–30/month. At 10,000 monthly users, $100–300/month. This is a GoFundMe or a small grant from an aligned foundation, not a funding round.
A transparent "this costs money to run, here's how much, here's how to help" page is honest and appropriate. Advertising is not.
There are no plans to monetize this. If that ever becomes a question, the answer is no.
---
Forms Accuracy — The Hard Problem:
Form templates go stale. SNAP applications differ by state. Section 8 waitlists open and close unpredictably. Medicaid rules shift with every legislative session.
Stale information at a vulnerable moment causes real harm.
The community suggestion feature exists for this reason — users can flag missing programs or outdated information directly from the app. But suggestions require human review. Keeping this accurate over time requires:
- People who know the programs (social workers, case managers, legal aid attorneys)
- People who know which states have which variations
- Regular audits of form templates, at minimum annually
This is the maintenance burden that matters most. The technology is the easy part.
If you are reading this because you work in social services, legal aid, housing advocacy, or benefits navigation — your knowledge is more valuable to this project than any code contribution.
---
Legal Considerations:
Before this reaches significant scale, a one-hour consultation with a tech-focused nonprofit attorney is not optional. Specifically:
- Liability exposure for form accuracy (forms are preparation aids, not official documents — this must be clearly stated)
- Privacy policy language that is honest rather than just legal
- Mandatory reporting considerations if users disclose abuse or harm to minors
- Whether any special considerations apply for serving undocumented users in the current regulatory environment
Organizations like the Electronic Frontier Foundation or state ACLU chapters can help find the right people. Many offer free or reduced-rate consultations for public interest projects.
The disclaimer on every generated form — "This form is a preparation aid only. It is not an official government document." — is the starting point, not the finish line.
---
The Undocumented User Question:
This requires its own section because it is the most serious responsibility in the project.
An undocumented person using this tool in the current political climate is trusting us with something significant. If something goes wrong — a data breach, a subpoena, a legal misunderstanding about what we collect — the consequences for them are not a bad user experience. They are potentially life-altering.
The architectural response:
- We do not collect immigration status. Period.
- We do not collect SSNs or other identifiers that could be used for enforcement purposes.
- We store nothing server-side.
- We say this plainly in the UI before anyone types anything sensitive — not in a privacy policy, in plain language on the screen.
- The code is open source so the claim is verifiable.
---
But we also have to be honest about what we cannot protect against:
- The Anthropic API call means message content passes through Anthropic's systems. Users should know this.
- Browser sessionStorage is not encrypted. If someone else has access to the device, they could read it.
- We cannot protect against someone reading over a user's shoulder at a library.
"We don't store your data" needs to be precise, not just reassuring. The UI language must explain exactly what travels where and what doesn't. This has to be reviewed by someone with relevant legal expertise before launch.
---
What This Project Is Not:
- It is not a government program.
- It is not affiliated with any political party or ideology.
- It is not a social services replacement. It is a navigation and preparation tool.
- It is not a data collection operation.
- It is not a business.
- It is not finished.
---
Origin
This project began as a conversation about whether an LLM-driven app could help people who are struggling financially get organized — handling the paperwork they need, filling it out with prompted questions, finding government programs they qualify for.
The insight that simplified everything: we don't need to collect sensitive information at all. We pre-fill everything that a web search could find anyway. The form prints out. The only thing the user fills in is the sensitive part. Their SSN stays in their head. Their immigration status stays in their pocket. We never needed it.
The design constraint that shaped everything else: poverty is not an identity. People cycle in and out of crisis from all walks of life. The tool has no threshold test, no eligibility screen, no proof-of-need. Anyone who opens the URL can use it. That's the point.
The ethical commitment that preceded the technical decisions: work important enough that if it is within one's power to do, one feels compelled to do it.
---
If You Are Reading This as a Contributor
Welcome. The most valuable things you can bring are:
- Knowledge of the programs — which forms have changed, which state-specific variations exist, what case workers actually see when people walk in
- Knowledge of the populations — what LGBTQ youth in crisis actually need, what undocumented families actually face, what the gaps in the existing system actually feel like from the inside
- Plain language skills — the ability to take a bureaucratic form instruction and make it readable by someone in crisis with a 20-minute library session
- Legal review — nonprofit tech law, privacy law, the specific considerations for serving vulnerable populations
- Translation — this tool is only as useful as the languages it speaks
The code is the easy part. Don't lose sight of that.
---
Clearpath is open source. The repository is public. The privacy promise is verifiable.
If you can help maintain the accuracy of the program information, please reach out.
