import React, { useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";
import Sky from "./image/sky.jpg";
import * as XLSX from "xlsx";
// import { kr, en, de, es, fr, ja, pt, zh } from "./defaultLocale";

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

const ConverterBackground = styled.img`
  width: 100%;
  height: 100%;

  object-fit: cover;

  display: block;
  position: absolute;
  top: 0;
  left: 0;

  z-index: -1;
`;

const ConverterSpreadSheetIcon = styled.img`
  width: 50px;
  height: 50px;

  position: absolute;
  top: 15px;
  right: 15px;

  &:hover {
    top: 12px;
  }

  transition: top 0.5s ease;
`;

// const JsonIcon = styled.img`
//   width: 49px;
//   height: 49px;

//   position: absolute;
//   top: 15px;
//   right: 15px;
// `;

const ConvertMainWrapper = styled.div`
  border-radius: 10px;
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.1);

  border: 1px solid rgba(0, 0, 0, 0.1);

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

  background-color: rgba(0, 0, 0, 0.7);
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

const ConvertRefreshButton = styled.button`
  background-color: transparent;
  border: none;

  cursor: pointer;

  &:hover {
    transform: rotate(360deg);
  }

  transition: transform 0.5s ease;
`;

const ConverterRefresh = styled.img`
  width: 20px;
  height: 20px;
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

const TextInput = styled.input`
  width: 380px;
  padding: 8px 5px 8px 5px;
  margin-left: 10px;
  outline: 0 none;
  font-size: 12px;

  border-color: rgba(0, 0, 0, 0.7);
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  color: rgba(0, 0, 0, 0.8);

  &:hover {
    border-color: rgba(0, 0, 0, 0.5);
  }

  &:focus {
    border-color: rgba(0, 0, 0, 0.5);
  }

  transition: border-color 0.5s ease;
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

  background-color: rgba(0, 0, 0, 0.7);

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

const LoadingWrap = styled.div`
  width: 100%;
  height: 300px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingText = styled.span`
  font-size: 12px;

  color: rgba(0, 0, 0, 0.8);
`;

const UploadFileInput = styled.input`
  width: 380px;
  padding: 8px 5px 8px 5px;
  margin-left: 10px;
`;

const App = () => {
  const [excelData, setExcelData] = useState([]);
  const [JSON, setJSON] = useState({});
  const [language, setLanguage] = useState("");
  const [selectData, setSelectData] = useState([{ name: "언어를 선택하세요.", value: "" }]);

  const onUpload = (e) => {
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
        if (key !== "String") {
          _.forEach(StringID, (item, index) => {
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
          SelectData[idx] = selectData[0];
        }
      });

      setSelectData(SelectData);
      setExcelData(Convert);
    };

    reader.readAsBinaryString(files);
  };

  const onSelect = (e) => {
    const { value } = e.target;

    setJSON(excelData[value]);
  };

  return (
    <ConverterContainer>
      <ConverterBackground src={Sky} />
      <ConvertMainWrapper>
        <ConverterTitleWrap>
          <ConverterTitle>LG Converter</ConverterTitle>
        </ConverterTitleWrap>
        <ConverterWrapper>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>파일</LanguageTarget>
            <UploadFileInput type={"file"} id="excelInput" onChange={onUpload} />
          </LanguageMenu>
          <LanguageMenu>
            <LanguageRequired>*</LanguageRequired>
            <LanguageTarget>언어</LanguageTarget>
            <SelectBox data={selectData} onSelect={onSelect} />
          </LanguageMenu>
          <JsonView>
            <ReactJson src={JSON} displayDataTypes={false} iconStyle={"circle"} />
          </JsonView>
        </ConverterWrapper>
        <ConverterBottomWrap>
          <DownloadButton>JSON 다운로드</DownloadButton>
        </ConverterBottomWrap>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
