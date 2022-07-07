import React, { useRef, useState } from "react";

import _ from "lodash";
import * as XLSX from "xlsx";

import { string } from "./defaultLocale/string";

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
} from "./style/Styled";

import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";
import { message } from "./defaultLocale/message";

const App = () => {
  const [preString, setPreString] = useState("");
  const [strString, setStrString] = useState("");
  const [fileName, setFileName] = useState("");
  const [jsonUrl, setJsonUrl] = useState("");

  const [jsonData, setJsonData] = useState({
    deletes: {},
    errorMsg: {},
  });

  const [uploadFileName, setUploadFileName] = useState(
    "JSON으로 변환 할 엑셀 파일을 등록 해 주세요."
  );

  const [selectData, setSelectData] = useState([
    { name: "언어를 선택하세요.", value: "" },
  ]);

  const inputRef = useRef(null);

  const onUpload = (e) => {
    setJsonUrl("");
    setSelectData([{ name: "언어를 선택하세요.", value: "" }]);
    setJsonData({
      deletes: {},
      errorMsg: {},
    });

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
      const data = event.target.result;
      const workBook = XLSX.read(data, { type: "binary" });

      _.forEach(workBook.SheetNames, (sheetName, index) => {
        JSON[index] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      });

      _.forEach(JSON[1], (json, index) => {
        sheetStr.predefined[index] = json.value;
      });

      _.forEach(JSON[2], (json, index) => {
        sheetStr.string[index] = json.Str_ID;
      });

      sheetKey.predefined = Object.keys(JSON[1][0]);
      sheetKey.string = Object.keys(JSON[2][0]);

      let preLanguage = {
        Korean: "",
        English: "",
        Chinese: "",
        French: "",
        German: "",
        Japanese: "",
        Portuguese: "",
        Spanish: "",
      };

      let strLanguage = {
        Korean: "",
        English: "",
        Chinese: "",
        French: "",
        German: "",
        Japanese: "",
        Portuguese: "",
        Spanish: "",
      };

      let SelectData = [];
      let errorMsg = {};
      let deletes = {};

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

      _.forEach(sheetKey.string, (strKey, keyIdx) => {
        const chkColumn = ["신규", "수정", "삭제", "사용처"];

        if (keyIdx !== 0 && !strKey.includes(chkColumn)) {
          let test = [];

          _.forEach(sheetStr.string, (strStr, strIdx) => {
            // 중복 키 체크
            if (test.includes(strStr)) {
              errorMsg = {
                ...errorMsg,
                [`${[strIdx + 2]}번 행`]: `${strStr} 중복 키`,
              };
            }

            // 삭제 컬럼 체크
            if (JSON[2][strIdx]["삭제"] !== undefined) {
              deletes = {
                ...deletes,
                [`${strStr}`]: `${strIdx + 2}번 행 삭제되었습니다.`,
              };
            } else {
              if (JSON[2][strIdx][strKey] !== undefined) {
                strLanguage[strKey] += `\t${strStr} : ${
                  JSON[2][strIdx][strKey].toString().indexOf("value.") >= 0
                    ? JSON[2][strIdx][strKey].toString()
                    : '"' + JSON[2][strIdx][strKey].toString() + '"'
                } ,\n`;
              }
            }

            test[strIdx] = strStr;
          });

          // SELECT BOX 할당
          SelectData[keyIdx] = {
            name: strKey,
            value: strKey,
          };
        } else {
          // SELECT BOX 기본 값 설정
          SelectData[keyIdx] = { name: "언어를 선택하세요.", value: "" };
        }
      });

      if (!_.isEmpty(errorMsg)) {
        setJsonData({ deletes, errorMsg });
      } else {
        setSelectData(SelectData);
        setPreString(preLanguage);
        setStrString(strLanguage);
        setUploadFileName(filesName);

        setJsonData({ deletes, errorMsg });
      }
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {
    const { value } = e.target;
    let fileName = "";

    switch (value) {
      case "Korean":
        fileName = "kr.js";
        break;
      case "English":
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
      case "Portuguese":
        fileName = "pt.js";
        break;
      case "Spanish":
        fileName = "es.js";
        break;
      default:
        break;
    }

    let JsonUrl = "data:application/json;charset=utf-8,";

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

  return (
    <ConverterContainer>
      <ConvertMainWrapper>
        <ConverterTitleWrap>
          <ConverterTitle onClick={onSelect}>LG Converter</ConverterTitle>
        </ConverterTitleWrap>
        <ConverterWrapper>
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
