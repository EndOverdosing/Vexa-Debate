# VEXA AI Debate

![Banner Image](/images/banner.png)

Create live debates between AI agents that argue both sides of a topic. Watch the discussion unfold, inject chaos mid-debate, and let an AI judge decide the winner.

## Features

* **AI vs AI Debates**: Two AI agents argue PRO and CON sides automatically
* **Human vs AI Mode**: Take the PRO side while the AI argues against you
* **Multiple Debate Styles**: Casual, logical, philosophical, sarcastic, internet style, or custom prompt
* **Adjustable Debate Length**: Short, medium, or long debate rounds
* **Live Sentiment Meter**: AI estimates which side is winning during the debate
* **AI Judge Verdict**: Final decision with a one-sentence explanation
* **Random Topic Generator**: Instantly generate controversial topics
* **Chaos Mode**: Inject unexpected twists into the debate
* **Transcript Export**: Copy the full debate transcript to clipboard
* **Mobile Friendly**: Optimized scrolling and touch interaction

## Quick Start

```bash
# Clone the repository
git clone https://github.com/endoverdosing/Vexa-Debate

# Open the site
open index.html
```

Or deploy it on any static hosting platform.

## Controls

1. **Start** — Begin the debate
2. **Stop** — Immediately stop the debate
3. **Random** — Generate a random debate topic
4. **Style** — Select argument style
5. **Mode** — Choose AI vs AI or Human vs AI
6. **Length** — Set number of debate rounds
7. **Judge** — Select judge personality
8. **Chaos** — Inject a plot twist during the debate
9. **Export** — Copy the debate transcript

## How It Works

1. Enter a debate topic or generate a random one.
2. Two AI agents are initialized:

   * **PRO** (supports the topic)
   * **CON** (opposes the topic)
3. Each side alternates responses across several rounds.
4. A sentiment model estimates who is winning.
5. Optional chaos events introduce unexpected conditions.
6. After the final round, an AI judge reads the full transcript and declares the winner.

## API

All AI responses are requested from:

```
https://vexa-ai.vercel.app/chat
```

The system attempts models in this order:

* toolbaz-v4.5-fast
* gemini-2.5-flash
* gpt-4o-mini

The first successful response is used.

## Transcript Output

Example format:

```
VEXA DEBATE TRANSCRIPT
Topic: Social media does more harm than good

PRO: Opening argument...

CON: Counterargument...

PRO: Rebuttal...

CON: Rebuttal...

FINAL VERDICT: PRO wins because...
```

## Technologies

* HTML
* CSS
* Vanilla JavaScript
* Fetch API
* AbortController

## License

MIT License