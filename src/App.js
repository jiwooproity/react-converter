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
    let sheetStr = {};

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

      let predefined = [];
      let string = [];

      _.forEach(JSON[1], (json, index) => {
        predefined[index] = json.value;
      });

      _.forEach(JSON[2], (json, index) => {
        string[index] = json.Str_ID;
      });

      console.log(predefined);
      console.log(string);
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {};

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
