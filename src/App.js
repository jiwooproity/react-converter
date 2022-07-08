import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";

import * as XLSX from "xlsx";
import ReactJson from "react-json-view";

import SelectBox from "./SelectBox";

import { string, message } from "./defaultLocale";
import { language } from "./data/language";

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

const setKey = [
  "Korean",
  "English(US)",
  "Chinese",
  "French",
  "German",
  "Japanese",
  "Portuguese(Brazilian)",
  "Spanish",
];

const errorArr = [
  "DUPLICATE.ERROR",
  "SPACE_BAR.ERROR",
  "STR_ID_SPACE.ERROR",
  "STR_ID.ERROR",
  "BRACE.ERROR",
  "NONE.ERROR",
];

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

      const SheetName_predefined = JSON[1];
      const SheetName_string = JSON[2];

      // 두번째 시트 VALUE 키 값 저장
      _.forEach(SheetName_predefined, (json, index) => {
        sheetStr.predefined[index] = json.value;
      });

      // 세번째 시트 STR_ID 키 값 저장
      _.forEach(SheetName_string, (json, index) => {
        sheetStr.string[index] = json.Str_ID;
      });

      // 각 시트에 존재하는 컬럼 데이터 저장 EX) ["STR_ID", "Korean", "English"]
      sheetKey.predefined = Object.keys(JSON[1][0]);
      sheetKey.string = Object.keys(SheetName_string[0]);

      const getKey = () => {
        let data = {};

        setKey.forEach((key) => {
          data = {
            ...data,
            [key]: "",
          };
        });

        return data;
      };

      let preLanguage = getKey(); // const value = {} 시트 2
      let strLanguage = getKey(); // const message = defineMessages({}) 시트 3

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

      let keyNumber = 0;

      _.forEach(sheetKey.string, (strKey, keyIdx) => {
        if (keyNumber > 0 && setKey.includes(strKey)) {
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

          // 삭제 컬럼 검사
          const isDeleteData = (targetIdx) => {
            return SheetName_string[targetIdx]["삭제"] !== undefined;
          };

          // 중복 검사
          const dupliCheck = (data, target, targetIdx) => {
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
          };

          // 줄바꿈 검사
          const spaceCheck = (target, targetIdx) => {
            const data = SheetName_string[targetIdx][target];
            const msg_01 = `${target} ${[targetIdx + 2]}번 행`;
            const msg_02 = `해당 값에 줄바꿈이 존재합니다.`;

            if (
              data &&
              data.toString().split("\n").length &&
              data.toString().split("\n").length > 1
            ) {
              sendMessage(1, msg_01, msg_02);
            }
          };

          // 키 값 띄어쓰기 검사
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

          // 키 값 입력 검사
          const strIdCheck = (target, targetIdx) => {
            const msg_01 = `Str_ID ${[targetIdx + 2]}번 행`;
            const msg_02 = "STR_ID 키 값이 입력되지 않았습니다.";

            if (target === undefined) {
              sendMessage(3, msg_01, msg_02);
            }
          };

          const noneData = (target, targetKey, targetIdx) => {
            const msg_01 = `${targetKey} ${[targetIdx + 2]}번 행`;
            const msg_02 = `${target} 값이 없습니다.`;

            // Develop / Release 모드 유무
            if (!mode) {
              sendMessage(5, msg_01, msg_02);
            }
          };

          // const isInsertData = (target, targetIdx) => {
          //   const data = SheetName_string[targetIdx][target];
          //   const msg_01 = `${target} ${[targetIdx + 2]}번 행`;
          //   const msg_02 = "{} 중괄호 입력 시, 큰 따옴표를 제거 해주세요.";

          //   if (data !== undefined && data.toString().includes(`"{`)) {
          //     sendMessage(4, msg_01, msg_02);
          //   }
          // };

          _.forEach(sheetStr.string, (strStr, strIdx) => {
            // ----------------------- 오류 체크 -----------------------

            dupliCheck(test, strStr, strIdx); // 중복 키 체크 / DUPLICATE.ERROR
            spaceCheck(strKey, strIdx); // 줄바꿈 제거 필요 알림 / SPACE_BAR.ERROR
            strSpaceCheck(strStr, strIdx); // 키 값 공백 체크 / STR_ID_SPACE.ERROR
            strIdCheck(strKey, strIdx); // STR_ID가 존재하지 않을 경우 / STR_ID.ERROR
            // isInsertData(strKey, strIdx); // 중괄호 입력 검사 / BRACE.ERROR

            // ----------------------- 오류 체크 -----------------------

            // JSON 생성
            const setLanguageData = (key, idx) => {
              strLanguage[key] += `\t${strStr} : ${
                SheetName_string[idx][key].toString().indexOf("value.") >= 0
                  ? SheetName_string[idx][key].toString()
                  : '"' + SheetName_string[idx][key].toString() + '"'
              } ,\n`;
            };

            // 삭제 컬럼 체크
            if (isDeleteData(strIdx)) {
              Deleted = {
                ...Deleted,
                [strStr]: `${strIdx + 2}번 행이 삭제되었습니다.`,
              };
            } else {
              // Develop 모드 일 경우, 값이 하나라도 존재하지 않더라도 해당 값은 제외시키고 JS 파일 생성
              if (SheetName_string[strIdx][strKey] !== undefined) {
                setLanguageData(strKey, strIdx);
              } else {
                noneData(strStr, strKey, strIdx);
              }
            }

            // 키 값 중복 체크를 위해 배열에 저장
            test[strIdx] = strStr;
          });

          // SELECT BOX 할당
          SelectData[keyNumber] = {
            name: strKey,
            value: strKey,
          };

          keyNumber++;
        } else if (keyNumber === 0) {
          // SELECT BOX 기본 값 설정
          SelectData[keyIdx] = { name: "언어를 선택하세요.", value: "" };
          keyNumber++;
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
    let fileName = value !== "" ? language[value] : "";

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
