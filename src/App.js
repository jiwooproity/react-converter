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
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState({});
  const [jsonUrl, setJsonUrl] = useState("");
  const [uploadFileName, setUploadFileName] = useState("JSON으로 변환 할 엑셀 파일을 등록 해 주세요.");
  const [selectData, setSelectData] = useState([{ name: "언어를 선택하세요.", value: "" }]);

  const inputRef = useRef(null);

  //
  const [preString, setPreString] = useState("");
  const [strString, setStrString] = useState("");

  const onUpload = (e) => {
    let JSON = [];

    let sheetKey = {
      predefined: [],
      string: [],
    };

    let sheetStr = {
      predefined: [],
      string: [],
    };

    setJsonData({});
    setExcelData([]);
    setSelectData([{ name: "언어를 선택하세요.", value: "" }]);

    const files = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workBook = XLSX.read(data, { type: "binary" });

      _.forEach(workBook.SheetNames, (sheetName, index) => {
        JSON[index] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      });

      _.forEach(JSON[1], (json, index) => {
        sheetStr.predefined[index] = json.Str_ID;
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

      setPreString(preLanguage);

      _.forEach(sheetKey.string, (strKey, keyIdx) => {
        if (keyIdx !== 0 && strKey !== "신규" && strKey !== "수정" && strKey !== "삭제" && strKey !== "사용처") {
          _.forEach(sheetStr.string, (strStr, strIdx) => {
            console.log(strStr);
            // ... { ...Convert, * [Korean]: { ...Convert[key], [language]: "언어" } * }
            strLanguage[strKey] += `\t${strStr} : ${
              JSON[2][strIdx][strKey].toString().indexOf("value.") >= 0 ? JSON[2][strIdx][strKey].toString() : '"' + JSON[2][strIdx][strKey].toString() + '"'
            } ,\n`;
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

      setSelectData(SelectData);
      setStrString(strLanguage);
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {
    const { value } = e.target;

    const data = string + preString[value] + "};" + message + strString[value] + "});\nexport default messages;";
    let JsonUrl = "data:application/json;charset=utf-8,";
    setFileName(value);
    setJsonUrl((JsonUrl += encodeURIComponent(data)));
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
          {/* <JsonView>
            <ReactJson src={jsonData} displayDataTypes={false} iconStyle={"circle"} />
          </JsonView> */}
        </ConverterWrapper>
        <ConverterBottomWrap>
          <DownloadButton disabled={jsonUrl === ""} href={jsonUrl} id={`${fileName}.js`} download={`${fileName}.js`}>
            JSON 다운로드
          </DownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
