// Assistant page — full chat experience
const AssistantPage = () => (
  <div>
    <div className="page-head">
      <div>
        <div className="page-title">Assistant</div>
        <div className="page-sub">Conversational research, trade staging, and portfolio reasoning · running on your connected models</div>
      </div>
      <div className="row row-gap-2">
        <Button variant="ghost" size="sm">History</Button>
        <Button variant="ghost" size="sm">Templates</Button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, height: 'calc(100vh - 240px)' }}>
      <div className="card card-flat" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <AssistantChat />
      </div>

      <div className="col gap-4">
        <Card title="Quick prompts" titleSize="lg">
          <div className="col gap-2">
            {[
              'Summarize my overnight P&L drivers',
              'Which positions look stretched?',
              'Build a screener for high-FCF semis',
              'Stress test my book against +100bps',
              'Compare AAPL vs MSFT on quality',
            ].map((p, i) => (
              <div key={i} style={{
                padding: '8px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--line-soft)',
                borderRadius: 'var(--r-md)',
                fontSize: 12.5,
                cursor: 'pointer',
              }}>{p}</div>
            ))}
          </div>
        </Card>

        <Card title="Mode reference" titleSize="lg">
          <div className="col gap-3" style={{ fontSize: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Step</div>
              <div style={{ color: 'var(--ink-3)' }}>Walks each phase: research → plan → confirm → execute → verify → commit. You approve each gate.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>GSD² <Badge variant="brand">favorite</Badge></div>
              <div style={{ color: 'var(--ink-3)' }}>Get Shit Done². Skips the talking, returns the answer with a one-line justification.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Half-Auto</div>
              <div style={{ color: 'var(--ink-3)' }}>Drafts the trade, waits for your one-tap confirm before sending to broker.</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Full-Auto</div>
              <div style={{ color: 'var(--ink-3)' }}>Executes within your risk policy. Stops at any rule breach. Daily summary.</div>
            </div>
          </div>
        </Card>

        <Card title="Today's confidence">
          <div className="row row-gap-3" style={{ alignItems: 'center' }}>
            <Donut size={70} thickness={11} segments={[
              { value: 78, color: 'var(--brand)' },
              { value: 22, color: 'var(--bg-inset)' },
            ]} label={<div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>78</div>} />
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Signal quality is high today. 4 ideas have ≥70% conviction. Tape conditions favor adds.
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
);

window.AssistantPage = AssistantPage;
