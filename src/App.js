import React, { useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";
import * as XLSX from "xlsx";
import { kr, en, de, es, fr, ja, pt, zh } from "./defaultLocale";

const ConverterContainer = styled.div`
  width: 100%;
  height: 100vh;
  padding: 20px 20px 20px 20px;

  position: relative;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.1);
`;

const ConvertMainWrapper = styled.div`
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;

  overflow: hidden;
`;

const ConverterWrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  background-color: white;
`;

const ConverterTitleWrap = styled.div`
  padding: 20px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: rgba(0, 0, 0, 0.8);
`;

const ConverterBottomWrap = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConverterTitle = styled.h1`
  font-size: 15px;
  color: white;
`;

const LanguageMenu = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  list-style: none;

  padding: 4px 0px;
`;

const LanguageRequired = styled.span`
  font-size: 14px;
  margin-right: 2px;

  color: rgb(165, 0, 52);
`;

const LanguageTarget = styled.span`
  font-size: 11px;
  line-height: 12px;

  display: block;
  font-weight: 700;
`;

const DownloadButton = styled.a`
  width: 100%;
  height: ${({ disabled }) => (disabled ? "0px" : "40px")};

  line-height: 40px;

  text-align: center;
  font-size: 12px;

  text-decoration: none;

  color: white;

  cursor: pointer;

  background-color: rgba(0, 0, 0, 0.8);

  pointer-events: ${({ disabled }) => (disabled ? "none" : "")};

  &:hover {
    background-color: #a50034;
    color: white;
  }

  transition: background-color 0.5s ease, color 0.5s ease, height 0.5s ease;
`;

const JsonView = styled.div`
  width: 487.66px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: scroll;

  padding: 10px;

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 5px;

  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 3px;
    background-color: rgba(0, 0, 0, 0.1);

    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
`;

const UploadFileInput = styled.input`
  width: 380px;
  padding: 8px 5px 8px 5px;
  margin-left: 10px;
`;

const App = () => {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [jsonData, setJsonData] = useState({});
  const [jsonUrl, setJsonUrl] = useState("");
  const [selectData, setSelectData] = useState([
    { name: "언어를 선택하세요.", value: "" },
  ]);

  const sendMessage = (language, key, index) => {
    console.log(
      `[${language}]: ${index + 2}행 ${key} Key 사이에 공백이 존재합니다.`
    );
  };

  const onUpload = (e) => {
    setExcelData([]);

    let JSON = [];
    let Keys = [];
    let StringID = [];
    let Convert = {};
    let SelectData = [];

    const files = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const data = event.target.result;
      const workBook = XLSX.read(data, { type: "binary" });

      _.forEach(workBook.SheetNames, (sheetName) => {
        JSON = XLSX.utils.sheet_to_json(workBook.Sheets[sheetName]);
      });

      _.forEach(JSON, (item, index) => {
        StringID[index] = item.String;
      });

      Keys = Object.keys(JSON[0]);

      _.forEach(Keys, (key, idx) => {
        if (idx !== 0) {
          _.forEach(StringID, (item, index) => {
            if (!item) {
              let msg = `[${index + 2}]번 행에`;
              msg += " 값이 없는 String ID가 있습니다.";
              setJsonData({ msg });
            } else {
              setJsonData({});
            }

            // 중간에 공백이 있을 경우 _ 언더 바 자동 적용
            if (item.split(" ").length > 1) {
              const splitItem = item.split(" ");
              item = splitItem.join("_");
              sendMessage(key, item, index);
            }

            Convert = {
              ...Convert,
              [key]: { ...Convert[key], [item]: JSON[index][key] },
            };
          });

          SelectData[idx] = {
            name: key,
            value: key,
          };
        } else {
          SelectData[idx] = { name: "언어를 선택하세요.", value: "" };
        }
      });

      setSelectData(SelectData);
      setExcelData(Convert);
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
            <UploadFileInput
              type={"file"}
              id="excelInput"
              onChange={onUpload}
            />
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
            id={fileName}
            download={fileName}
          >
            JSON 다운로드
          </DownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
