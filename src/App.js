import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";

import * as XLSX from "xlsx";
import JSZip from "jszip";
import FileSaver from "file-saver";
import ReactJson from "react-json-view";

import SelectBox from "./SelectBox";

import { string, message } from "./defaultLocale";
import { language } from "./data/language";
import { CHECK } from "./func/check";

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
  AllDownloadButton,
} from "./style/Styled";

const setKey = ["Korean", "English(US)", "Chinese", "French", "German", "Japanese", "Portuguese(Brazilian)", "Spanish"];

const errorArr = ["DUPLICATE.ERROR", "SPACE_BAR.ERROR", "STR_ID_SPACE.ERROR", "STR_ID.ERROR", "BRACE.ERROR", "NONE.ERROR"];

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

  const [uploadFileName, setUploadFileName] = useState("JSON으로 변환 할 엑셀 파일을 등록 해 주세요.");

  const [selectData, setSelectData] = useState([{ name: "언어를 선택하세요.", value: "" }]);

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
    setPreString("");
    setStrString("");
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
              JSON[1][strIdx][preKey].toString().indexOf("value.") >= 0 ? JSON[1][strIdx][preKey].toString() : '"' + JSON[1][strIdx][preKey].toString() + '"'
            } ,\n`;
          });
        }
      });

      let keyNumber = 0;

      _.forEach(sheetKey.string, (strKey, keyIdx) => {
        if (keyNumber > 0 && setKey.includes(strKey)) {
          let strArr = [];

          const sendMessage = (errNumber, msgKey, msg) => {
            ErrorMessage = {
              ...ErrorMessage,
              [errorArr[errNumber]]: {
                ...ErrorMessage[errorArr[errNumber]],
                [msgKey]: msg,
              },
            };
          };

          _.forEach(sheetStr.string, (strStr, strIdx) => {
            const sheet = SheetName_string;

            // strKey: 최상위 데이터 (언어) EX) Korean, English ... 등
            // strStr: 각 언어에 배치 된 다국어 ID EX) user_name, restart_device ... 등
            // strLanguage["Korean"] => Korean: { user_name: "유저 닉네임", restart_device: "디바이스 재시작" } / 각 언어 오브젝트 데이터

            CHECK.dupliCheck(strArr, strStr, strIdx, sheet, sendMessage); // 중복 키 체크 / DUPLICATE.ERROR
            CHECK.spaceCheck(strKey, strIdx, sheet, sendMessage); // 줄바꿈 제거 필요 알림 / SPACE_BAR.ERROR
            CHECK.strSpaceCheck(strStr, strIdx, sendMessage); // 키 값 공백 체크 / STR_ID_SPACE.ERROR
            CHECK.strIdCheck(strKey, strIdx, sendMessage); // STR_ID가 존재하지 않을 경우 / STR_ID.ERROR
            // CHECK.isInsertData(strKey, strIdx); // 중괄호 입력 검사 / BRACE.ERROR

            // JSON 생성
            const setLanguageData = (key, idx) => {
              strLanguage[key] += `\t${strStr} : ${
                SheetName_string[idx][key].toString().indexOf("value.") >= 0
                  ? SheetName_string[idx][key].toString()
                  : '"' + SheetName_string[idx][key].toString() + '"'
              } ,\n`;
            };

            // 삭제 컬럼 체크
            if (CHECK.isDeleteData(strIdx, sheet)) {
              Deleted = {
                ...Deleted,
                [strStr]: `${strIdx + 2}번 행이 삭제되었습니다.`,
              };
            } else {
              // Develop 모드 일 경우, 값이 하나라도 존재하지 않더라도 해당 값은 제외시키고 JS 파일 생성
              if (SheetName_string[strIdx][strKey] !== undefined) {
                setLanguageData(strKey, strIdx);
              } else {
                CHECK.noneData(strStr, strKey, strIdx, sendMessage, mode);
              }
            }

            // 키 값 중복 체크를 위해 배열에 저장
            strArr[strIdx] = strStr;
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

  const onSettingJs = (value) => {
    const setJS = string + preString[value] + "};" + message + strString[value] + "});\n\nexport default messages;";

    return setJS;
  };

  const onCreateZip = () => {
    const zip = new JSZip();

    // Locale 폴더 안에 넣은 파일 이름과 파일 안에 입력 할 데이터를 넣어준다.
    _.forEach(setKey, (key) => {
      zip.folder("Locale").file(language[key], onSettingJs(key));
    });

    // 모두 작성이 완료되면, zip.generateAsync로 FileSaver를 활용해서 zip파일로 내보낸다.
    zip.generateAsync({ type: "blob" }).then((resZip) => {
      FileSaver(resZip, "Locale.zip");
    });
  };

  const onSelect = (e) => {
    const { value } = e.target;

    let notError = value !== "";
    let fileName = notError ? language[value] : "";

    let JsonUrl = "data:application/json;charset=utf-8,"; // utf-8 설정
    const settingJS = onSettingJs(value); // 다운로드 받을 JS 파일 입력 및 그리기 / 설정

    const setURL = notError ? (JsonUrl += encodeURIComponent(settingJS)) : "";

    setFileName(fileName);
    setJsonUrl(setURL);
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
    setPreString("");
    setStrString("");

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
            <UploadFileInput type={"file"} id="excelInput" onChange={onUpload} ref={inputRef} accept={".xls,.xlsx"} />
            <UploadFileInputStyle>
              <UploadFileInputText>{uploadFileName}</UploadFileInputText>
              <UploadFileInputButton onClick={() => inputRef.current.click()}>등록</UploadFileInputButton>
            </UploadFileInputStyle>
          </LanguageMenu>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>언어</LanguageTarget>
            <SelectBox data={selectData} onSelect={onSelect} />
          </LanguageMenu>
          <JsonView>
            <ReactJson src={jsonData} displayDataTypes={false} iconStyle={"circle"} />
          </JsonView>
        </ConverterWrapper>
        <ConverterBottomWrap>
          <DownloadButton disabled={jsonUrl === ""} href={jsonUrl} id={`${fileName}`} download={`${fileName}`}>
            JS 다운로드
          </DownloadButton>
          <AllDownloadButton disabled={preString === "" && strString === ""} active={jsonUrl === ""} onClick={onCreateZip}>
            ZIP 다운로드
          </AllDownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
