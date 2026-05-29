/**
 * @fileoverview 인메모리 Lock 모듈.
 * 동시 명령 실행을 방지하고 각 워크플로우 상태를 관리한다.
 * 단일 사용자·단일 인스턴스 전제 하에 설계됐으며, 재시작 시 상태는 초기화된다.
 *
 * 상태 플래그:
 *   isLocked           — 명령 처리 중 여부 (중복 실행 차단)
 *   pendingChanges     — 승인 대기 중인 단일 파일 변경 데이터
 *   waitingForFeedback — 거절 후 피드백 입력 대기 여부
 *   retryContext       — 피드백 재시도에 필요한 원본 컨텍스트
 *   snippetRetryContext — originalSnippet 불일치 시 재시도 컨텍스트
 *   partialApproval    — 다중 파일 부분 승인 진행 데이터
 */

let isLocked = false;
let pendingChanges = null;
let lastResult = '없음';
let waitingForFeedback = false;
let retryContext = null;
let snippetRetryContext = null;
let partialApproval = null;

module.exports = {
  /** @returns {{ isLocked: boolean, pendingChanges: object|null, lastResult: string, waitingForFeedback: boolean, retryContext: object|null, snippetRetryContext: object|null, partialApproval: object|null }} */
  get: () => ({ isLocked, pendingChanges, lastResult, waitingForFeedback, retryContext, snippetRetryContext, partialApproval }),

  /** 명령 처리 시작 시 Lock 획득. */
  lock: () => { isLocked = true; },

  /** 명령 처리 완료 시 Lock 해제 및 pendingChanges 초기화. */
  unlock: () => { isLocked = false; pendingChanges = null; },

  /**
   * 단일 파일 승인 대기 데이터를 저장한다.
   * @param {object} changes shimResult + userMessage
   */
  setPending: (changes) => { pendingChanges = changes; },

  /**
   * 마지막 작업 결과 메시지를 갱신한다 (/status 응답에 사용).
   * @param {string} msg
   */
  setLastResult: (msg) => { lastResult = msg; },

  /**
   * 거절 후 피드백 대기 상태로 전환한다.
   * @param {{ targetFiles: string[], originalMessage: string, description: string }} context
   */
  setWaitingForFeedback: (context) => {
    waitingForFeedback = true;
    retryContext = context;
  },

  /** 피드백 대기 상태를 초기화한다. */
  clearFeedback: () => {
    waitingForFeedback = false;
    retryContext = null;
  },

  /**
   * originalSnippet 불일치 재시도 컨텍스트를 저장한다.
   * @param {{ targetFiles: string[], userMessage: string, description: string }} context
   */
  setSnippetRetry: (context) => { snippetRetryContext = context; },

  /** snippet retry 컨텍스트를 초기화한다. */
  clearSnippetRetry: () => { snippetRetryContext = null; },

  /**
   * 다중 파일 부분 승인 데이터를 저장한다.
   * @param {{ fileGroups: object, files: string[], decisions: object, base: object }} pa
   */
  setPartialApproval: (pa) => { partialApproval = pa; },

  /**
   * 특정 파일 인덱스의 승인/거절 결정을 기록한다.
   * @param {number} index 파일 인덱스
   * @param {'approved'|'rejected'} decision
   */
  updatePartialDecision: (index, decision) => {
    if (partialApproval) partialApproval.decisions[index] = decision;
  },

  /** @returns {object|null} 현재 부분 승인 데이터 */
  getPartialApproval: () => partialApproval,

  /** 부분 승인 데이터를 초기화한다. */
  clearPartialApproval: () => { partialApproval = null; },
};
