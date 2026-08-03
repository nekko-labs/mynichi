// Create + drive a Kotrain training run for the mynichi SLM, headlessly.
//
//   node kotrain_run.mjs create   -> prints run id, starts it
//   node kotrain_run.mjs watch <runId>
//   node kotrain_run.mjs hint <runId> "<text>"
//   node kotrain_run.mjs stop <runId>
//
// Requires the Kotrain web server (npm run web in the kotrain repo, port 1440)
// and LM Studio serving the agent model at 127.0.0.1:1338.

const BASE = process.env.KOTRAIN_URL ?? 'http://localhost:1440';
const AGENT_PROVIDER = 'lmstudio-x';
const AGENT_MODEL = 'google/gemma-4-12b';
const SLM_DIR = 'C:/Users/phili/code/mynichi/packages/slm';
const PY = `${SLM_DIR}/.venv/Scripts/python.exe`;

async function call(channel, ...args) {
  const r = await fetch(`${BASE}/api/${channel}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ args }),
  });
  if (!r.ok) throw new Error(`${channel}: HTTP ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

const GOAL = `Fine-tune the mynichi translation SLM: find the LoRA hyperparameters (rank, learning rate, epochs) that maximize the eval score printed by eval.py. Everything is already set up; you only launch experiments, poll them, and report scores.`;

const EXTRA = `HOW TO RUN EXPERIMENTS (follow exactly, do not improvise):
- Work only inside ${SLM_DIR}. Never create or modify files elsewhere.
- One experiment = one command, run with the bash tool from cwd ${SLM_DIR}:
    "${PY}" launch.py start --out runs/EXPNAME --rank R --lr LR --epochs E
  It returns immediately with {"status": "started"}. Training runs in the background on the GPU.
- Poll (roughly once a minute, one bash call each time):
    "${PY}" launch.py status --out runs/EXPNAME
  While running it shows {"status": "running"} plus a log tail. When finished it prints {"status": "done", "score": ..., "case_pass": ..., "chrf": ..., "json_valid": ..., "loss": ...}. If it prints {"status": "error", ...} the experiment failed; report it as failed with the error note.
- Only ONE experiment can run at a time (single GPU). launch.py refuses to start a second one; wait for the current one to finish.
- The metric is "score" (0-100, higher is better). The untuned baseline score is recorded in runs/baseline/result.json; read it first and report it as your first experiment (status succeeded, title "baseline: untuned Qwen3-4B").
- Sensible search space: rank in {4, 8, 16, 32}, lr in {1e-4, 2e-4, 4e-4}, epochs in {1, 2, 3}. Start with rank 8, lr 2e-4, epochs 2, then move toward whatever looks best. Name runs like runs/r8-lr2e4-e2.
- A full experiment takes roughly 10-25 minutes. Be patient: keep polling rather than starting something else.
- Call report_experiment when you START an experiment (status "running") and again when it FINISHES (status "succeeded" with the score, or "failed").
- Do not edit train.py, eval.py, launch.py, or the data. Only launch, poll, and report.
- After ${'maxExperiments'} experiments or if two consecutive experiments fail to beat the leader, reply with the done token.`;

const cmd = process.argv[2];

if (cmd === 'create') {
  const run = await call('training:create', {
    kind: 'training',
    name: 'mynichi-slm-v1',
    goal: GOAL,
    workspaceId: 'mynichi',
    providerId: AGENT_PROVIDER,
    modelId: AGENT_MODEL,
    config: {
      baseModel: { source: 'huggingface', id: 'Qwen/Qwen3-4B-Instruct-2507' },
      dataset: { source: 'local', id: 'packages/slm/data/train.jsonl' },
      metric: 'score',
      minimizeMetric: false,
      framework: 'transformers',
      maxExperiments: 6,
      timeBudgetMin: 180,
      extra: EXTRA,
    },
  });
  console.log('run', run.id, 'session', run.sessionId);
  await call('session:setOptions', run.sessionId, { mode: 'yolo', disabledTools: ['spawn_agent'] });
  await call('training:start', run.id);
  console.log('started');
} else if (cmd === 'watch') {
  const id = process.argv[3];
  for (;;) {
    const runs = await call('training:list');
    const run = runs.find((r) => r.id === id);
    if (!run) throw new Error('run not found');
    const best = run.experiments.find((e) => e.id === run.bestExperimentId);
    console.log(
      `[${new Date().toTimeString().slice(0, 8)}] ${run.status} turns=${run.turns ?? 0} experiments=${run.experiments.length} best=${best ? `${best.id} ${best.score}` : '-'}`,
    );
    for (const e of run.experiments.slice(-3)) {
      console.log(`  ${e.id} ${e.status} score=${e.score ?? '-'} ${e.title ?? ''}`);
    }
    if (['completed', 'stopped', 'failed'].includes(run.status)) {
      console.log(JSON.stringify(run.experiments, null, 2));
      break;
    }
    await new Promise((r) => setTimeout(r, 30_000));
  }
} else if (cmd === 'hint') {
  await call('training:hint', process.argv[3], process.argv[4]);
  console.log('hint queued');
} else if (cmd === 'stop') {
  await call('training:stop', process.argv[3]);
  console.log('stopped');
} else {
  console.log('usage: node kotrain_run.mjs create | watch <id> | hint <id> "text" | stop <id>');
}
