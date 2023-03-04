export const CHECK = {
  // 삭제 컬럼 체크
  isDeleteData: (targetIdx, SheetName_string) => {
    return SheetName_string[targetIdx]["삭제"] !== undefined;
  },

  // KEY 중복 검사
  dupliCheck: (data, target, targetIdx, SheetName_string, sendMessage) => {
    const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
    const msg_02 = `${target} 중복 키가 존재합니다.`;

    if (
      data.includes(target) &&
      SheetName_string[targetIdx]["삭제"] === undefined
    ) {
      const prevDupIndex = data.indexOf(target);

      if (SheetName_string[prevDupIndex]["삭제"] === undefined) {
        sendMessage(0, msg_01, msg_02);
      }
    }
  },

  // VALUE 줄바꿈 검사
  spaceCheck: (target, targetIdx, SheetName_string, sendMessage) => {
    const msg_01 = `${target} ${[targetIdx + 2]}번 행`;
    const msg_02 = `해당 값에 줄바꿈이 존재합니다.`;

    const data = SheetName_string[targetIdx][target];

    if (
      data &&
      data.toString().split("\n").length &&
      data.toString().split("\n").length > 1
    ) {
      sendMessage(1, msg_01, msg_02);
    }
  },

  // KEY 띄어쓰기 검사
  strSpaceCheck: (target, targetIdx, sendMessage) => {
    const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
    const msg_02 = `해당 키 값에 띄어쓰기가 존재합니다.`;

    if (target && target.split(" ").length && target.split(" ").length > 1) {
      sendMessage(2, msg_01, msg_02);
    }
  },

  // KEY 값 입력 검사
  strIdCheck: (target, targetIdx, sendMessage) => {
    const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
    const msg_02 = "STR_ID 키 값이 입력되지 않았습니다.";

    if (target === undefined) {
      sendMessage(3, msg_01, msg_02);
    }
  },

  // 값이 없을 경우
  noneData: (target, targetKey, targetIdx, sendMessage, mode) => {
    const msg_01 = `${targetKey} ${[targetIdx + 2]}번 행`;
    const msg_02 = `${target} 값이 없습니다.`;

    // Develop / Release 모드 유무
    if (!mode) {
      sendMessage(5, msg_01, msg_02);
    }
  },

  // 중괄호 입력 검사
  isInsertData: (target, targetIdx, SheetName_string, sendMessage) => {
    const msg_01 = `${target} ${[targetIdx + 2]}번 행`;
    const msg_02 = "{} 중괄호 입력 시, 큰 따옴표를 제거 해주세요.";

    const data = SheetName_string[targetIdx][target];

    if (data !== undefined && data.toString().includes(`"{`)) {
      sendMessage(4, msg_01, msg_02);
    }
  },
};
