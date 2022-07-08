import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";

import * as XLSX from "xlsx";
import ReactJson from "react-json-view";

import SelectBox from "./SelectBox";

import { string, message } from "./defaultLocale";

// CSS 스타일
import {
  ConvertMainWrapper,
  ConverterBottomWrap,
  ConverterContainer,
  ConverterTitleWrap,
  ConverterTitle,
  ConverterWrapper,
  LanguageMenu,
  LanguageRequired,
  LanguageTarget,
  UploadFileInput,
  UploadFileInputStyle,
  UploadFileInputText,
  UploadFileInputButton,
  JsonView,
  DownloadButton,
  UploadModeWrap,
  UploadModeButton,
} from "./style/Styled";

const App = () => {
  const inputRef = useRef(null);

  const [preString, setPreString] = useState(""); // 1번 시트 value 값
  const [strString, setStrString] = useState(""); // 2번 시트 defineMessage 영역 값
  const [fileName, setFileName] = useState(""); // 다운로드 될 파일의 이름 설정 EX) kr.js .. en.js 등
  const [jsonUrl, setJsonUrl] = useState(""); // 다운로드 요청을 받을 URL 설정
  const [mode, setMode] = useState(true); // Develop / Release 모드 설정

  const [jsonData, setJsonData] = useState({
    Deleted: {},
    ErrorMessage: {},
  }); // 아래 JSON 프리 뷰에 띄어 줄 데이터 목록 설정

  const [uploadFileName, setUploadFileName] = useState(
    "JSON으로 변환 할 엑셀 파일을 등록 해 주세요."
  );

  const [selectData, setSelectData] = useState([
    { name: "언어를 선택하세요.", value: "" },
  ]);

  const onMode = (on) => {
    setMode(on);
  };

  const onReset = () => {
    setSelectData([{ name: "언어를 선택하세요.", value: "" }]);
    setJsonData({
      Deleted: {},
      ErrorMessage: {},
    });
    setJsonUrl("");
  };

  const onUpload = (e) => {
    onReset();

    let JSON = [];

    let sheetKey = {
      predefined: [],
      string: [],
    };

    let sheetStr = {
      predefined: [],
      string: [],
    };

    const files = e.target.files[0];
    const filesName = files.name;
    const reader = new FileReader();

    reader.onload = (event) => {
      // reader로 읽어온 엑셀 가공
      const data = event.target.result;
      // XLSX 라이브러리
      const workBook = XLSX.read(data, { type: "binary" });

      // 각 시트 데이터 이름 및 데이터 저장
      _.forEach(workBook.SheetNames, (sheetName, index) => {
        JSON[index] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      });

      // 두번째 시트 VALUE 키 값 저장
      _.forEach(JSON[1], (json, index) => {
        sheetStr.predefined[index] = json.value;
      });

      // 세번째 시트 STR_ID 키 값 저장
      _.forEach(JSON[2], (json, index) => {
        sheetStr.string[index] = json.Str_ID;
      });

      // 각 시트에 존재하는 컬럼 데이터 저장 EX) ["STR_ID", "Korean", "English"]
      sheetKey.predefined = Object.keys(JSON[1][0]);
      sheetKey.string = Object.keys(JSON[2][0]);

      const getKey = (index) => {
        let json = {};
        const keys = Object.keys(JSON[index][0]);

        keys.forEach((key) => {
          json = {
            ...json,
            [key]: "",
          };
        });

        return json;
      };

      let preLanguage = getKey(1); // const value = {} 시트 2
      let strLanguage = getKey(2); // const message = defineMessages({}) 시트 3

      let SelectData = []; // 선택 박스 데이터
      let ErrorMessage = {}; // 에러 발생 시 메세지
      let Deleted = {}; // 삭제 컬럼 활성화 된 데이터 저장

      // const value = {} 안에 입력 될 데이터 설정 ( 문자열로 가공 )
      _.forEach(sheetKey.predefined, (preKey, keyIdx) => {
        if (keyIdx !== 0) {
          _.forEach(sheetStr.predefined, (preStr, strIdx) => {
            // ... { ...Convert, * [Korean]: { ...Convert[key], [language]: "언어" } * }
            preLanguage[preKey] += `\t${preStr} : ${
              JSON[1][strIdx][preKey].toString().indexOf("value.") >= 0
                ? JSON[1][strIdx][preKey].toString()
                : '"' + JSON[1][strIdx][preKey].toString() + '"'
            } ,\n`;
          });
        }
      });

      // const message = defineMessages({}) 안에 입력 될 데이터 설정 ( 문자열로 가공 )
      _.forEach(sheetKey.string, (strKey, keyIdx) => {
        const columnArr = ["Comments", "신규", "수정", "삭제", "사용처"];
        const errorArr = [
          "DUPLICATE.ERROR",
          "SPACE_BAR.ERROR",
          "STR_ID_SPACE.ERROR",
          "STR_ID.ERROR",
        ];

        if (keyIdx !== 0 && !columnArr.includes(strKey)) {
          let test = [];

          const sendMessage = (errNumber, msgKey, msg) => {
            ErrorMessage = {
              ...ErrorMessage,
              [errorArr[errNumber]]: {
                ...ErrorMessage[errorArr[errNumber]],
                [msgKey]: msg,
              },
            };
          };

          const dupliCheck = (data, target, targetIdx) => {
            const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
            const msg_02 = `${target} 중복 키가 존재합니다.`;

            if (data.includes(target)) {
              sendMessage(0, msg_01, msg_02);
            }
          };

          const spaceCheck = (target, targetIdx) => {
            const msg_01 = `${target} ${[targetIdx + 2]}번 행`;
            const msg_02 = `해당 값에 줄바꿈이 존재합니다.`;

            if (
              JSON[2][targetIdx][target] &&
              JSON[2][targetIdx][target].split("\n").length &&
              JSON[2][targetIdx][target].split("\n").length > 1
            ) {
              sendMessage(1, msg_01, msg_02);
            }
          };

          const strSpaceCheck = (target, targetIdx) => {
            const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
            const msg_02 = `해당 키 값에 띄어쓰기가 존재합니다.`;

            if (
              target &&
              target.split(" ").length &&
              target.split(" ").length > 1
            ) {
              sendMessage(2, msg_01, msg_02);
            }
          };

          const strIdCheck = (target, targetIdx) => {
            const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
            const msg_02 = "STR_ID 키 값이 입력되지 않았습니다.";

            if (target === undefined) {
              sendMessage(3, msg_01, msg_02);
            }
          };

          const isDeleteData = (targetIdx) => {
            return JSON[2][targetIdx]["삭제"] !== undefined;
          };

          _.forEach(sheetStr.string, (strStr, strIdx) => {
            // ----------------------- 오류 체크 -----------------------

            dupliCheck(test, strStr, strIdx); // 중복 키 체크 / DUPLICATE.ERROR
            spaceCheck(strKey, strIdx); // 줄바꿈 제거 필요 알림 / SPACE_BAR.ERROR
            strSpaceCheck(strStr, strIdx); // 키 값 공백 체크 / STR_ID_SPACE.ERROR
            strIdCheck(strStr, strIdx); // STR_ID가 존재하지 않을 경우 / STR_ID.ERROR

            // ----------------------- 오류 체크 -----------------------

            // 삭제 컬럼 체크
            if (isDeleteData(strIdx)) {
              Deleted = {
                ...Deleted,
                [strStr]: `${strIdx + 2}번 행이 삭제되었습니다.`,
              };
            } else {
              // Develop / Release 모드 유무
              if (mode) {
                // Develop 모드 일 경우, 값이 하나라도 존재하지 않더라도 해당 값은 제외시키고 JS 파일 생성
                if (JSON[2][strIdx][strKey] !== undefined) {
                  strLanguage[strKey] += `\t${strStr} : ${
                    JSON[2][strIdx][strKey].toString().indexOf("value.") >= 0
                      ? JSON[2][strIdx][strKey].toString()
                      : '"' + JSON[2][strIdx][strKey].toString() + '"'
                  } ,\n`;
                }
              } else {
                // Release 모드 일 경우, 값이 하나라도 존재하지 않으면 에러 메세지 출력 및 JS 생성 및 다운로드 차단
                if (JSON[2][strIdx][strKey] !== undefined) {
                  strLanguage[strKey] += `\t${strStr} : ${
                    JSON[2][strIdx][strKey].toString().indexOf("value.") >= 0
                      ? JSON[2][strIdx][strKey].toString()
                      : '"' + JSON[2][strIdx][strKey].toString() + '"'
                  } ,\n`;
                } else {
                  ErrorMessage = {
                    ...ErrorMessage,
                    "NONE.ERROR": {
                      ...ErrorMessage["NONE.ERROR"],
                      [`${strKey} ${[
                        strIdx + 2,
                      ]}번 행`]: `${strStr} 값이 없습니다.`,
                    },
                  };
                }
              }
            }

            // 키 값 중복 체크를 위해 배열에 저장
            test[strIdx] = strStr;
          });

          // SELECT BOX 할당
          SelectData[keyIdx] = {
            name: strKey,
            value: strKey,
          };
        } else if (keyIdx === 0) {
          // SELECT BOX 기본 값 설정
          SelectData[keyIdx] = { name: "언어를 선택하세요.", value: "" };
        }
      });

      // 현재 업로드 된 파일의 이름 저장
      setUploadFileName(filesName);

      if (!_.isEmpty(ErrorMessage)) {
        setJsonData({ Deleted, ErrorMessage });
      } else {
        setSelectData(SelectData);
        setPreString(preLanguage);
        setStrString(strLanguage);

        setJsonData({ Deleted, ErrorMessage });
      }
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {
    const { value } = e.target;
    let fileName = "";

    // 현재 선택한 선택 박스의 Value 값 switching
    switch (value) {
      case "Korean":
        fileName = "ko.js";
        break;
      case "English(US)":
        fileName = "en.js";
        break;
      case "Chinese":
        fileName = "zh.js";
        break;
      case "French":
        fileName = "fr.js";
        break;
      case "German":
        fileName = "de.js";
        break;
      case "Japanese":
        fileName = "jp.js";
        break;
      case "Portuguese(Brazilian)":
        fileName = "pt.js";
        break;
      case "Spanish":
        fileName = "es.js";
        break;
      case "":
        fileName = "";
        setJsonData({
          Deleted: {},
          ErrorMessage: {},
        });
        setJsonUrl("");
        return;
      default:
        break;
    }

    // utf-8 설정
    let JsonUrl = "data:application/json;charset=utf-8,";

    // 다운로드 받을 JS 파일 입력 및 그리기 / 설정
    const settingJS =
      string +
      preString[value] +
      "};" +
      message +
      strString[value] +
      "});\n\nexport default messages;";

    setFileName(fileName);
    setJsonUrl((JsonUrl += encodeURIComponent(settingJS)));
  };

  // 모드 변경할 때마다 초기화 작업
  useEffect(() => {
    setJsonData({
      Deleted: {},
      ErrorMessage: {},
    });

    setUploadFileName("JSON으로 변환 할 엑셀 파일을 등록 해 주세요.");
    setSelectData([{ name: "언어를 선택하세요.", value: "" }]);
    setFileName("");
    setJsonUrl("");

    inputRef.current.value = "";
  }, [mode, setMode]);

  return (
    <ConverterContainer>
      <ConvertMainWrapper>
        <ConverterTitleWrap>
          <ConverterTitle onClick={onSelect}>LG Converter</ConverterTitle>
        </ConverterTitleWrap>
        <ConverterWrapper>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>모드</LanguageTarget>
            <UploadModeWrap>
              <UploadModeButton onClick={() => onMode(true)} active={mode}>
                Develop
              </UploadModeButton>
              <UploadModeButton onClick={() => onMode(false)} active={!mode}>
                Release
              </UploadModeButton>
            </UploadModeWrap>
          </LanguageMenu>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>엑셀</LanguageTarget>
            <UploadFileInput
              type={"file"}
              id="excelInput"
              onChange={onUpload}
              ref={inputRef}
              accept={".xls,.xlsx"}
            />
            <UploadFileInputStyle>
              <UploadFileInputText>{uploadFileName}</UploadFileInputText>
              <UploadFileInputButton onClick={() => inputRef.current.click()}>
                등록
              </UploadFileInputButton>
            </UploadFileInputStyle>
          </LanguageMenu>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>언어</LanguageTarget>
            <SelectBox data={selectData} onSelect={onSelect} />
          </LanguageMenu>
          <JsonView>
            <ReactJson
              src={jsonData}
              displayDataTypes={false}
              iconStyle={"circle"}
            />
          </JsonView>
        </ConverterWrapper>
        <ConverterBottomWrap>
          <DownloadButton
            disabled={jsonUrl === ""}
            href={jsonUrl}
            id={`${fileName}`}
            download={`${fileName}`}
          >
            JSON 다운로드
          </DownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
