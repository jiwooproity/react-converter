import React, { useRef, useState } from "react";

import _ from "lodash";
import * as XLSX from "xlsx";

import { kr, en, de, es, fr, ja, pt, zh } from "./defaultLocale";

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

const App = () => {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState({});
  const [jsonUrl, setJsonUrl] = useState("");
  const [uploadFileName, setUploadFileName] = useState("JSON으로 변환 할 엑셀 파일을 등록 해 주세요.");
  const [selectData, setSelectData] = useState([{ name: "언어를 선택하세요.", value: "" }]);

  const inputRef = useRef(null);

  const onUpload = (e) => {
    let JSON = [];
    let Keys = [];
    let StringID = [];
    let Convert = {};
    let ErrorMsg = {};
    let SelectData = [];

    setJsonData({});
    setExcelData([]);
    setSelectData([{ name: "언어를 선택하세요.", value: "" }]);

    const files = e.target.files[0];
    const filesName = files.name;
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workBook = XLSX.read(data, { type: "binary" });

      _.forEach(workBook.SheetNames, (sheetName, index) => {
        JSON[index] = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      });

      _.forEach(JSON[2], (item, index) => {
        StringID[index] = item.Str_ID;
      });

      Keys = Object.keys(JSON[2][0]);

      // Keys: [ Korean, English, ... ]
      _.forEach(Keys, (key, idx) => {
        if (idx !== 0) {
          // StringID: [ language, system_language, ... ]
          _.forEach(StringID, (item, index) => {
            if (JSON[2][index]["삭제"] === undefined) {
              // JSON의 키가 될 데이터가 존재하지 않을 경우 처리 ( 오류 )

              // 중간에 공백이 있을 경우 _ 언더 바 자동 적용
              if (item && item.split(" ").length > 1) {
                const splitItem = item.split(" ");
                item = splitItem.join("_");
              }

              // ... { ...Convert, * [Korean]: { ...Convert[key], [language]: "언어" } * }
              Convert = {
                ...Convert,
                [key]: { ...Convert[key], [item]: JSON[2][index][key] },
              };
            }
          });

          // SELECT BOX 할당
          SelectData[idx] = {
            name: key,
            value: key,
          };
        } else {
          // SELECT BOX 기본 값 설정
          SelectData[idx] = { name: "언어를 선택하세요.", value: "" };
        }
      });

      setUploadFileName(`${filesName}`);

      if (!_.isEmpty(ErrorMsg)) {
        setJsonData(ErrorMsg);
      } else {
        setSelectData(SelectData);
        setExcelData(Convert);
      }
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {
    let fileName = "";
    const { value } = e.target;

    if (value === "") {
      setFileName("");
      setJsonData({});
      setJsonUrl("");
      return;
    }

    let defaultJson = null;

    switch (value) {
      case "Korean":
        fileName = "kr";
        defaultJson = kr;
        break;
      case "English":
        fileName = "en";
        defaultJson = en;
        break;
      case "Chinese":
        fileName = "zh";
        defaultJson = zh;
        break;
      case "Deutsch":
        fileName = "de";
        defaultJson = de;
        break;
      case "Franch":
        fileName = "fr";
        defaultJson = fr;
        break;
      case "Japanese":
        fileName = "ja";
        defaultJson = ja;
        break;
      case "Portuguese":
        fileName = "pt";
        defaultJson = pt;
        break;
      case "Espanol":
        fileName = "es";
        defaultJson = es;
        break;
      default:
        break;
    }

    const root = {
      default: defaultJson,
      new: excelData[value],
    };

    let JsonUrl = "data:application/json;charset=utf-8,";
    JsonUrl += encodeURIComponent(JSON.stringify(root, null, 2));

    setFileName(`${fileName}.json`);
    setJsonData(root);
    setJsonUrl(JsonUrl);
  };

  return (
    <ConverterContainer>
      <ConvertMainWrapper>
        <ConverterTitleWrap>
          <ConverterTitle>LG Converter</ConverterTitle>
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
          <JsonView>
            <ReactJson src={jsonData} displayDataTypes={false} iconStyle={"circle"} />
          </JsonView>
        </ConverterWrapper>
        <ConverterBottomWrap>
          <DownloadButton disabled={jsonUrl === ""} href={jsonUrl} id={fileName} download={fileName}>
            JSON 다운로드
          </DownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
