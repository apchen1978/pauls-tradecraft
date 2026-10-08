import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  APPROVAL_RECORD,
  STAGE_IDS,
  STATUS,
  collectPublicText,
  createFlowState,
  createNavState,
  describeRefusal,
  earlierUnresolved,
  flowReducer,
  navReducer,
  passRefusal,
  passedCount,
  stages,
  workflowCopy,
} from "../src/data/tradeDecisionWorkflow.js";

const passThrough = (state, ids) => ids.reduce((current, id) => {
  const next = flowReducer(current, { type: "PASS", id });
  assert.notEqual(next, current, `${id} should pass`);
  assert.equal(next.stages[id], STATUS.PASSED);
  return next;
}, state);

test("initial state is all pending, lead selected, evidence missing, no approval record", () => {
  const flow = createFlowState();
  const nav = createNavState();
  assert.deepEqual(Object.keys(flow.stages), STAGE_IDS);
  for (const id of STAGE_IDS) assert.equal(flow.stages[id], STATUS.PENDING);
  assert.equal(flow.paymentSecurityEvidence, "missing");
  assert.equal(flow.approvalRecord, null);
  assert.equal(nav.selectedId, "lead");
  assert.equal(passedCount(flow.stages), 0);
  assert.equal(flowReducer(flow, { type: "RESET" }), flow);
});

test("selecting a stage never passes it", () => {
  const nav = createNavState();
  const flow = createFlowState();
  const next = navReducer(nav, { type: "SELECT", id: "approval" });
  assert.equal(next.selectedId, "approval");
  assert.equal(navReducer(next, { type: "SELECT", id: "approval" }), next);
  assert.equal(flowReducer(flow, { type: "SELECT", id: "approval" }), flow);
  assert.equal(passedCount(flow.stages), 0);
  assert.equal(flow.stages.approval, STATUS.PENDING);
});

test("next and previous stop at the ends", () => {
  let nav = createNavState();
  assert.equal(navReducer(nav, { type: "PREV" }), nav);
  for (let step = 0; step < STAGE_IDS.length - 1; step += 1) {
    const moved = navReducer(nav, { type: "NEXT" });
    assert.equal(moved.selectedId, STAGE_IDS[step + 1]);
    nav = moved;
  }
  assert.equal(nav.selectedId, "approval");
  assert.equal(navReducer(nav, { type: "NEXT" }), nav);
  const back = navReducer(nav, { type: "PREV" });
  assert.equal(back.selectedId, "quote");
  const initialNav = createNavState();
  assert.equal(navReducer(initialNav, { type: "RESET" }), initialNav);
});

test("pass counts toward progress and hold does not", () => {
  let flow = createFlowState();
  flow = flowReducer(flow, { type: "PASS", id: "lead" });
  assert.equal(flow.stages.lead, STATUS.PASSED);
  assert.equal(flow.stages.qualification, STATUS.ACTIVE);
  assert.equal(passedCount(flow.stages), 1);
  flow = flowReducer(flow, { type: "HOLD", id: "qualification" });
  assert.equal(flow.stages.qualification, STATUS.HOLD);
  assert.equal(passedCount(flow.stages), 1);
  assert.equal(["PENDING", "ACTIVE", "HOLD", "BLOCKED"].includes(flow.stages.qualification), true);
});

test("a later stage cannot pass while an earlier stage is unresolved", () => {
  const flow = createFlowState();
  const refused = flowReducer(flow, { type: "PASS", id: "rfq" });
  assert.equal(refused, flow);
  assert.equal(flow.stages.rfq, STATUS.PENDING);
  const refusal = passRefusal(flow, "approval");
  assert.equal(refusal.code, "prerequisites");
  assert.deepEqual(refusal.blockers, ["lead", "qualification", "rfq", "risk-check", "quote"]);
  assert.match(describeRefusal(refusal, "zh"), /核准還沒有打開/);
  assert.match(describeRefusal(refusal, "en"), /Approval stays closed/);
  assert.match(describeRefusal(refusal, "zh"), /詢盤/);
  assert.match(describeRefusal(refusal, "en"), /Lead/);
});

test("holding or blocking an earlier stage invalidates downstream passes", () => {
  let flow = passThrough(createFlowState(), ["lead", "qualification", "rfq"]);
  flow = flowReducer(flow, { type: "RESOLVE_PAYMENT_EVIDENCE" });
  flow = passThrough(flow, ["risk-check", "quote", "approval"]);
  assert.equal(flow.approvalRecord, APPROVAL_RECORD);
  assert.equal(passedCount(flow.stages), 6);

  const held = flowReducer(flow, { type: "HOLD", id: "qualification" });
  assert.equal(held.stages.qualification, STATUS.HOLD);
  assert.equal(held.stages.lead, STATUS.PASSED);
  for (const id of ["rfq", "risk-check", "quote", "approval"]) {
    assert.equal(held.stages[id], STATUS.BLOCKED, id);
  }
  assert.equal(held.approvalRecord, null);
  assert.equal(passedCount(held.stages), 1);
  assert.equal(flowReducer(held, { type: "PASS", id: "quote" }), held);

  const active = flowReducer(createFlowState(), { type: "PASS", id: "lead" });
  assert.equal(active.stages.qualification, STATUS.ACTIVE);
  const blocked = flowReducer(active, { type: "BLOCK", id: "lead" });
  assert.equal(blocked.stages.lead, STATUS.BLOCKED);
  assert.equal(blocked.stages.qualification, STATUS.BLOCKED);
  assert.equal(passedCount(blocked.stages), 0);
});

test("approval stays closed until gates 1-5 pass, then records SIMULATED_APPROVAL", () => {
  let flow = createFlowState();
  assert.equal(flowReducer(flow, { type: "PASS", id: "approval" }), flow);
  assert.equal(flow.approvalRecord, null);
  flow = passThrough(flow, ["lead", "qualification", "rfq"]);
  flow = flowReducer(flow, { type: "RESOLVE_PAYMENT_EVIDENCE" });
  flow = passThrough(flow, ["risk-check", "quote"]);
  assert.equal(flow.stages.quote, STATUS.PASSED);
  assert.equal(flow.approvalRecord, null);
  assert.equal(flow.stages.approval, STATUS.ACTIVE);
  const approved = flowReducer(flow, { type: "PASS", id: "approval" });
  assert.equal(approved.stages.approval, STATUS.PASSED);
  assert.equal(approved.approvalRecord, "SIMULATED_APPROVAL");
  assert.equal(approved.approvalRecord, APPROVAL_RECORD);
  assert.equal(String(approved.approvalRecord).includes("AUTHORIZED"), false);
  assert.equal(flowReducer(approved, { type: "PASS", id: "approval" }), approved);
});

test("reset returns every stage to pending and lead can be selected again", () => {
  let flow = passThrough(createFlowState(), ["lead"]);
  flow = flowReducer(flow, { type: "HOLD", id: "qualification" });
  flow = flowReducer(flow, { type: "RESOLVE_PAYMENT_EVIDENCE" });
  const reset = flowReducer(flow, { type: "RESET" });
  assert.deepEqual(reset, createFlowState());
  assert.equal(reset.paymentSecurityEvidence, "missing");
  assert.equal(reset.approvalRecord, null);
  const nav = navReducer({ selectedId: "quote" }, { type: "RESET" });
  assert.equal(nav.selectedId, "lead");
});

test("risk check holds for missing payment security and recovers only through the simulated action", () => {
  let flow = passThrough(createFlowState(), ["lead", "qualification", "rfq"]);
  assert.equal(flow.stages["risk-check"], STATUS.ACTIVE);
  const refused = flowReducer(flow, { type: "PASS", id: "risk-check" });
  assert.equal(refused, flow);
  assert.equal(passRefusal(flow, "risk-check").code, "missing-payment-security");
  assert.match(describeRefusal(passRefusal(flow, "risk-check"), "zh"), /不能顯示為已查核/);
  assert.match(describeRefusal(passRefusal(flow, "risk-check"), "en"), /not shown as checked/);

  const held = flowReducer(flow, { type: "HOLD", id: "risk-check" });
  assert.equal(held.stages["risk-check"], STATUS.HOLD);
  assert.equal(passedCount(held.stages), 3);
  assert.equal(held.paymentSecurityEvidence, "missing");

  const resolved = flowReducer(held, { type: "RESOLVE_PAYMENT_EVIDENCE" });
  assert.equal(resolved.paymentSecurityEvidence, "simulated");
  assert.equal(resolved.stages["risk-check"], STATUS.HOLD);
  assert.equal(resolved.stages, held.stages);
  assert.equal(flowReducer(resolved, { type: "RESOLVE_PAYMENT_EVIDENCE" }), resolved);
  assert.equal(workflowCopy.zh.evidenceMissing.includes("缺失"), true);
  assert.equal(workflowCopy.zh.evidenceMissing.includes("已查核"), false);
  assert.equal(workflowCopy.en.evidenceMissing.toLowerCase().includes("missing"), true);
  assert.equal(/\bverified\b/i.test(workflowCopy.en.evidenceMissing), false);
  assert.match(workflowCopy.zh.evidenceSimulated, /模擬已補上/);
  assert.match(workflowCopy.zh.evidenceSimulated, /不是實際查核/);

  const passed = flowReducer(resolved, { type: "PASS", id: "risk-check" });
  assert.equal(passed.stages["risk-check"], STATUS.PASSED);
  assert.equal(passedCount(passed.stages), 4);
  assert.equal(passed.approvalRecord, null);
});

test("both languages carry the same stage shape and the scenario facts", () => {
  assert.equal(stages.length, 6);
  assert.deepEqual(stages.map((stage) => stage.id), STAGE_IDS);
  for (const stage of stages) {
    for (const lang of ["zh", "en"]) {
      for (const field of ["title", "description", "tool", "person", "evidence", "output", "gate", "pass", "blocked"]) {
        assert.equal(typeof stage[lang][field], "string", `${stage.id} ${lang} ${field}`);
        assert.ok(stage[lang][field].length > 0);
      }
    }
    assert.equal(stage.order, STAGE_IDS.indexOf(stage.id) + 1);
  }
  const text = collectPublicText();
  assert.match(text, /1,000 直米/);
  assert.equal(text.includes("延米"), false);
  assert.equal(text.includes("質米"), false);
  assert.match(text, /0\.686 × 8\.23 m/);
  assert.match(text, /FOB 上海/);
  assert.match(text, /USD 10–15/);
  assert.match(text, /30%/);
  assert.match(text, /35%/);
  assert.match(text, /QUOTE_READY/);
  assert.match(text, /SIMULATED_APPROVAL/);
  assert.match(workflowCopy.zh.disclosure, /互動示範，使用合成資料。不會發生真實交易或授權。/);
  assert.equal(workflowCopy.en.disclosure, "Interactive demonstration using synthetic data. No real transaction or authorization occurs.");
  assert.match(text, /示範／成效未驗證/);
  assert.match(text, /Demo \/ outcomes not validated/);
  assert.equal(workflowCopy.zh.columnsTool, "工具先整理");
  assert.equal(workflowCopy.en.columnsTool, "Prepared by tools");
  assert.equal(workflowCopy.zh.columnsPerson, "由人決定");
  assert.equal(workflowCopy.en.columnsPerson, "Decided by a person");
  const banned = [
    /\bAI\b/,
    /人工智能|人工智慧/,
    /中間層/,
    /\bA2A\b/,
    /\bCDD\b/,
    /\bROI\b/i,
    /轉換率|成交率|conversion/i,
    /老闆|\bboss\b|\bowner\b/i,
    /延米|質米/,
    /\bAUTHORIZED\b/,
    /github\.com/i,
  ];
  for (const pattern of banned) assert.equal(pattern.test(text), false, String(pattern));
  assert.equal(describeRefusal(passRefusal(createFlowState(), "quote"), "zh").includes("詢盤"), true);
  assert.equal(describeRefusal(passRefusal(createFlowState(), "quote"), "en").includes("Lead"), true);
  assert.equal(earlierUnresolved(createFlowState().stages, "lead").length, 0);
});

test("workflow modules do not call the network", () => {
  const sources = [
    "src/data/tradeDecisionWorkflow.js",
    "src/components/TradeDecisionWorkflow.jsx",
  ].map((path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
  const joined = sources.join("\n");
  assert.equal(/\bfetch\s*\(/.test(joined), false);
  assert.equal(/XMLHttpRequest|WebSocket|sendBeacon/.test(joined), false);
  assert.equal(joined.includes("AUTHORIZED"), false);
});
