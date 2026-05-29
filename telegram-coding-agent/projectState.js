/**
 * @fileoverview 현재 활성 프로젝트 상태 모듈.
 * /switch 커맨드로 전환된 프로젝트 이름과 경로를 인메모리로 관리한다.
 * 재시작 시 .env의 TARGET_PROJECT_PATH로 초기화된다.
 */
const { TARGET_PROJECT_PATH, PROJECTS } = require('./config');

const defaultName = Object.keys(PROJECTS).find(n => PROJECTS[n] === TARGET_PROJECT_PATH) || 'default';

let currentPath = TARGET_PROJECT_PATH;
let currentName = defaultName;

module.exports = {
  /** @returns {string} 현재 활성 프로젝트의 절대 경로 */
  get: () => currentPath,

  /** @returns {string} 현재 활성 프로젝트의 이름 */
  getName: () => currentName,

  /**
   * 활성 프로젝트를 전환한다.
   * @param {string} name 프로젝트 이름
   * @param {string} projPath 프로젝트 절대 경로
   */
  set: (name, projPath) => { currentName = name; currentPath = projPath; },
};
