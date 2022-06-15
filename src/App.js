import React, { useEffect, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";
import Sky from "./image/sky.jpg";
import Icon from "./image/spreadSheets.png";
// import JsonImage from "./image/json.png";

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
  right: 60px;
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

  background-color: rgba(0, 0, 0, 0.7);
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

const DownloadWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DownloadButton = styled.a`
  margin: 15px 0px 0px 0px;
  padding: 5px 10px 5px 10px;
  font-size: 13px;

  text-decoration: none;

  border-radius: 5px;

  background-color: ${({ disabled }) =>
    disabled ? "rgba(0, 0, 0, 0.2)" : "rgba(0, 0, 0, 0.9)"};
  color: white;

  cursor: pointer;

  pointer-events: ${({ disabled }) => (disabled ? "none" : "")};

  transition: background-color 0.5s ease;
`;

const JsonView = styled.div`
  width: 487.66px;
  margin-top: 15px;
  max-height: 300px;
  overflow-y: scroll;

  display: block;
`;

const languageData = [
  { name: "언어를 선택하세요.", value: "" },
  { name: "한국어", value: "Korean" },
  { name: "영어", value: "English" },
  { name: "중국어", value: "Chinese" },
  { name: "독일어", value: "Deutsch" },
  { name: "프랑스어", value: "Franch" },
  { name: "일본어", value: "Japanese" },
  { name: "포르투갈어", value: "Portuguese" },
  { name: "스페인어", value: "Espanol" },
];

const App = () => {
  const API_TOKEN = "AIzaSyBiXVHWac0qqPbeW857yGxkeMr5OZ401kM";
  const [spreadSheetsId, setSpreadSheetsId] = useState(
    "1k5Muc1xM3_PP0musMihHJMEkYYarIVSKKERUriHBkV8"
  );

  const [stringId, setStringId] = useState([]); // STR_ID 등록
  const [jsonUrl, setJsonUrl] = useState(""); // JSON 다운로드 주소 생성
  const [fileName, setFileName] = useState(""); // file 생성 시, JSON 파일 이름 설정
  const [jsonData, setJsonData] = useState(); // ReactJson View에 표시 할 Json

  // SpreacAPI Cell Data
  const SpreadAPI = async (range) => {
    let resJson = [];

    resJson = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetsId}/values/Sheet1!${range}?key=${API_TOKEN}`
    ).then((response) => response.json());

    return resJson.values ? resJson.values : resJson;
  };

  const getGoogleSpreadSheetsStringId = async () => {
    const getData = await SpreadAPI("A2:A9999");
    setStringId(getData);
  };

  const googleSpreadSheetsConnect = async (range) => {
    let language = {};

    const getData = await SpreadAPI(range);

    // 오류 발견 시
    if (getData.error) {
      setJsonData(getData.error);
      return;
    }

    _.forEach(getData, (res, index) => {
      language = { ...language, [stringId[index][0]]: res[0] ? res[0] : "" };
    });

    const charset = "data:application/json;charset=utf-8,";

    let JsonUrl =
      charset + encodeURIComponent(JSON.stringify(language, null, 2));
    setJsonUrl(JsonUrl);
    setJsonData(language);
  };

  const getLanguage = async (language) => {
    let range = "";
    let fileName = "";

    switch (language) {
      case "Korean":
        range = "B2:B9999";
        fileName = "ko.json";
        break;
      case "English":
        range = "C2:C9999";
        fileName = "en.json";
        break;
      case "Chinese":
        range = "D2:D9999";
        fileName = "zh.json";
        break;
      case "Deutsch":
        range = "E2:E9999";
        fileName = "de.json";
        break;
      case "Franch":
        range = "F2:F9999";
        fileName = "fr.json";
        break;
      case "Japanese":
        range = "G2:G9999";
        fileName = "jp.json";
        break;
      case "Portuguese":
        range = "H2:H9999";
        fileName = "pt.json";
        break;
      case "Espanol":
        range = "I2:I9999";
        fileName = "es.json";
        break;
      default:
        break;
    }

    googleSpreadSheetsConnect(range);
    setFileName(fileName);
  };

  useEffect(() => {
    const getSpreadData = async () => {
      await getGoogleSpreadSheetsStringId();
    };

    getSpreadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelect = (e) => {
    const { value } = e.target;

    if (value === "") {
      setJsonData();
      setJsonUrl(value);
      return;
    }

    getLanguage(value);
  };

  const onChange = (e) => {
    const { value } = e.target;

    setSpreadSheetsId(value);
  };

  return (
    <ConverterContainer>
      <a
        href={`https://docs.google.com/spreadsheets/d/${spreadSheetsId}/edit#gid=0`}
        target={"_blank"}
        rel="noreferrer"
      >
        <ConverterSpreadSheetIcon src={Icon} />
      </a>
      {/* <a
        href={`https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetsId}/values/Sheet1!A1:I9999?key=${API_TOKEN}`}
        target={"_blank"}
        rel="noreferrer"
      >
        <JsonIcon src={JsonImage} />
      </a> */}

      <ConverterBackground src={Sky} />
      <ConvertMainWrapper>
        <ConverterTitleWrap>
          <ConverterTitle>LG Converter</ConverterTitle>
        </ConverterTitleWrap>
        <ConverterWrapper>
          <LanguageMenu>
            <LanguageTarget>API 토큰</LanguageTarget>
            <TextInput value={API_TOKEN} readOnly />
          </LanguageMenu>
          <LanguageMenu>
            <LanguageTarget>스프레드 시트 ID</LanguageTarget>
            <TextInput value={spreadSheetsId} onChange={onChange} />
          </LanguageMenu>
          <LanguageMenu>
            <LanguageTarget>언어</LanguageTarget>
            <SelectBox data={languageData} onSelect={onSelect} />
          </LanguageMenu>
          <JsonView>
            <ReactJson
              src={jsonData}
              displayDataTypes={false}
              iconStyle={"circle"}
            />
          </JsonView>
          <DownloadWrap>
            <DownloadButton
              disabled={jsonUrl === ""}
              href={jsonUrl}
              id={fileName}
              download={fileName}
            >
              다운로드
            </DownloadButton>
          </DownloadWrap>
        </ConverterWrapper>
      </ConvertMainWrapper>
    </ConverterContainer>
  );
};

export default App;
