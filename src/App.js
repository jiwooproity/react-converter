import React, { useEffect, useState } from "react";
import _ from "lodash";
import styled from "styled-components";
import SelectBox from "./SelectBox";
import ReactJson from "react-json-view";
import Sky from "./image/sky.jpg";
import Icon from "./image/spreadSheets.png";
import Refresh from "./image/refresh.jpg";
import { kr, en, de, es, fr, ja, pt, zh } from "./defaultLocale";
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
    background-color: rgba(0, 0, 0, 1);
    color: yellow;
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

  display: block;

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
  const [loading, setLoading] = useState(true);
  const [selectLanguage, setSelectLanguage] = useState("");

  // SpreacAPI Cell Data
  const SpreadAPI = async (range) => {
    let resJson = [];

    resJson = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadSheetsId}/values/Sheet1!${range}?key=${API_TOKEN}`
    ).then((response) => response.json());

    return resJson.values ? resJson.values : resJson;
  };

  // 설정된 Object Key 값 저장
  const getGoogleSpreadSheetsStringId = async () => {
    const getData = await SpreadAPI("A2:A9999");
    setStringId(getData);
  };

  // SpreadSheet에서 사용자가 선택한 언어의 JSON 저장
  const googleSpreadSheetsConnect = async (defaultLocale, range) => {
    // JSON 임시 저장
    let language = { default: { ...defaultLocale } };

    // JSON API
    const getData = await SpreadAPI(range);

    // 오류 발견 시
    if (getData.error) {
      setJsonData(getData.error);
      return;
    }

    _.forEach(getData, (res, index) => {
      // 설정된 Object Key ( StringID ) 가 존재할 경우

      if (stringId[index][0]) {
        const splitChar = stringId[index][0].split(" ");

        if (stringId[index][0].split(" ").length > 1 && splitChar[1] !== "") {
          console.log(
            `String Key : 값 사이에 공백이 존재함 [${index + 2}번 행] "${
              stringId[index]
            }"`
          );

          // 구분 된 ID일 경우 소문자로 변환
          stringId[index][0] = stringId[index][0].toLowerCase();
          // 소문자로 변환 후, " " 공백 부분 "_"로 변환 ex) Progress Record > progress_record
          stringId[index][0] = stringId[index][0].replaceAll(" ", "_");
        }
      }

      language = {
        ...language,
        new_locale: {
          ...language.new_locale,
          [stringId[index][0]]: res[0] ? res[0] : "",
        },
      };
    });

    const charset = "data:application/json;charset=utf-8,";

    let JsonUrl = charset;
    JsonUrl += encodeURIComponent(JSON.stringify(language, null, 2));

    setJsonUrl(JsonUrl);
    setJsonData(language);
    setLoading(true);
  };

  const getLanguage = async (language) => {
    let range = "";
    let fileName = "";
    let defaultLocale = {};

    setLoading(false);

    switch (language) {
      case "Korean":
        range = "B2:B9999";
        fileName = "ko.json";
        defaultLocale = kr;
        break;
      case "English":
        range = "C2:C9999";
        fileName = "en.json";
        defaultLocale = en;
        break;
      case "Chinese":
        range = "D2:D9999";
        fileName = "zh.json";
        defaultLocale = zh;
        break;
      case "Deutsch":
        range = "E2:E9999";
        fileName = "de.json";
        defaultLocale = de;
        break;
      case "Franch":
        range = "F2:F9999";
        fileName = "fr.json";
        defaultLocale = fr;
        break;
      case "Japanese":
        range = "G2:G9999";
        fileName = "ja.json";
        defaultLocale = ja;
        break;
      case "Portuguese":
        range = "H2:H9999";
        fileName = "pt.json";
        defaultLocale = pt;
        break;
      case "Espanol":
        range = "I2:I9999";
        fileName = "es.json";
        defaultLocale = es;
        break;
      default:
        break;
    }

    googleSpreadSheetsConnect(defaultLocale, range);
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
      setSelectLanguage(value);
      setJsonData();
      setJsonUrl(value);
      return;
    }

    setSelectLanguage(value);
    getLanguage(value);
  };

  const onChange = (e) => {
    const { value } = e.target;

    setSpreadSheetsId(value);
  };

  const onRefresh = () => {
    if (selectLanguage === "") {
      setJsonData();
      setJsonUrl(selectLanguage);
      return;
    }

    getGoogleSpreadSheetsStringId();
    getLanguage(selectLanguage);
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
          <ConvertRefreshButton onClick={onRefresh}>
            <ConverterRefresh src={Refresh} />
          </ConvertRefreshButton>
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
            {loading ? (
              <ReactJson
                src={jsonData}
                displayDataTypes={false}
                iconStyle={"circle"}
              />
            ) : (
              <LoadingWrap>
                <LoadingText>JSON 파일 생성 중</LoadingText>
              </LoadingWrap>
            )}
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
